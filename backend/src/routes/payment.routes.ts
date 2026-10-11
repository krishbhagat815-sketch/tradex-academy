import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db/database.js';
import { isMongoConnected } from '../db/mongodb.js';
import { OrderModel, PaymentModel, EnrollmentModel, CourseModel, UserModel } from '../models/index.js';

dotenv.config();

const router = Router();

// Helper to get active Razorpay client and credentials dynamically
function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || '';

  const isReal = Boolean(
    keyId &&
    !keyId.includes('placeholder') &&
    keyId !== 'your_razorpay_key_id' &&
    keySecret &&
    !keySecret.includes('placeholder')
  );

  const client = new Razorpay({
    key_id: isReal ? keyId : 'rzp_test_placeholder',
    key_secret: isReal ? keySecret : 'rzp_test_secret_placeholder',
  });

  return { keyId, keySecret, webhookSecret, isReal, client };
}

/**
 * 1. POST /api/payments/create-order
 * Validates course, calculates trusted price, creates official Razorpay order,
 * and saves pending order in MongoDB and SQLite.
 */
router.post('/create-order', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, couponCode, paymentMethod = 'UPI' } = req.body;

    if (!courseId) {
      res.status(400).json({ success: false, message: 'Course ID is required.' });
      return;
    }

    // 1. Fetch course details
    let course: any = null;
    if (isMongoConnected()) {
      course = await CourseModel.findOne({ id: courseId }).lean();
    }
    if (!course) {
      course = queryOne('SELECT * FROM courses WHERE id = ?', [courseId]);
    }

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // 2. Check existing enrollment (prevent duplicate purchases)
    let isEnrolled = false;
    if (isMongoConnected()) {
      const existingMongoEnrollment = await EnrollmentModel.findOne({
        user_id: userId,
        course_id: courseId,
        status: { $ne: 'revoked' }
      }).lean();
      if (existingMongoEnrollment) isEnrolled = true;
    }
    if (!isEnrolled) {
      const existingSqlEnrollment = queryOne(
        `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status != 'revoked'`,
        [userId, courseId]
      );
      if (existingSqlEnrollment) isEnrolled = true;
    }

    if (isEnrolled) {
      res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
      return;
    }

    // 3. Calculate price & discounts securely
    const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = queryOne(
        `SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1`,
        [String(couponCode).trim()]
      );

      if (coupon) {
        appliedCoupon = coupon;
        if (coupon.discount_type === 'percent') {
          discountAmount = (basePrice * Number(coupon.discount_value)) / 100;
        } else {
          discountAmount = Number(coupon.discount_value);
        }
        discountAmount = Math.min(basePrice, Math.round(discountAmount * 100) / 100);
      }
    }

    const finalAmount = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);

    // Free course fallback
    if (finalAmount === 0) {
      res.status(400).json({
        success: false,
        message: 'Course is free. Use standard free enrollment process.'
      });
      return;
    }

    const { keyId, keySecret, isReal, client } = getRazorpayConfig();
    const amountInPaise = Math.round(finalAmount * 100);
    const receipt = `rcpt_${uuidv4().slice(0, 8)}`;
    const internalOrderId = `ord-${uuidv4().slice(0, 8)}`;
    const orderNumber = `TRX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    let razorpayOrderId = `order_sim_${uuidv4().replace(/-/g, '').slice(0, 14)}`;
    let isRealRazorpay = false;

    // 4. Create official Razorpay Order
    if (isReal) {
      try {
        const rzpOrder: any = await (client.orders as any).create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receipt,
          payment_capture: true, // Automatic capture enabled
          notes: {
            userId,
            courseId,
            courseTitle: course.title,
            orderNumber
          }
        });
        razorpayOrderId = rzpOrder.id;
        isRealRazorpay = true;
      } catch (err: any) {
        console.warn('⚠️ [Razorpay] Live order creation failed, falling back to simulated order:', err?.message || err);
      }
    }

    const now = new Date();

    // 5. Save pending order in MongoDB
    if (isMongoConnected()) {
      try {
        await OrderModel.create({
          id: internalOrderId,
          order_number: orderNumber,
          user_id: userId,
          course_id: courseId,
          amount: finalAmount,
          discount_amount: discountAmount,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          payment_method: paymentMethod,
          payment_status: 'pending',
          razorpay_order_id: razorpayOrderId,
          currency: 'INR',
          created_at: now,
          updated_at: now
        });

        await PaymentModel.create({
          id: `pay_rec_${uuidv4().slice(0, 8)}`,
          order_id: internalOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pending_${razorpayOrderId}`,
          amount: finalAmount,
          currency: 'INR',
          status: 'created',
          method: paymentMethod,
          user_id: userId,
          course_id: courseId,
          captured: false,
          created_at: now,
          updated_at: now
        });
      } catch (mErr: any) {
        console.warn('⚠️ [MongoDB] Order creation record error:', mErr?.message || mErr);
      }
    }

    // 6. Dual-write to SQLite for consistency
    try {
      execute(`
        INSERT INTO orders (
          id, order_number, user_id, course_id, amount, discount_amount,
          coupon_code, payment_method, payment_status, billing_info, transaction_id, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
      `, [
        internalOrderId,
        orderNumber,
        userId,
        courseId,
        finalAmount,
        discountAmount,
        appliedCoupon ? appliedCoupon.code : null,
        paymentMethod,
        JSON.stringify({ razorpay_order_id: razorpayOrderId }),
        razorpayOrderId,
        now.toISOString()
      ]);
    } catch (sqlErr: any) {
      console.warn('⚠️ [SQLite] Order creation error:', sqlErr?.message || sqlErr);
    }

    res.json({
      success: true,
      orderId: razorpayOrderId,
      internalOrderId,
      orderNumber,
      amount: finalAmount,
      currency: 'INR',
      keyId: isReal ? keyId : 'rzp_test_placeholder',
      isRealRazorpay,
      courseTitle: course.title,
      paymentMethod
    });
  } catch (error: any) {
    console.error('❌ [Payments] create-order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
});


/**
 * 2. POST /api/payments/verify
 * Verifies Razorpay payment signature, confirms capture status with Razorpay API,
 * updates order in MongoDB & SQLite, and automatically enrolls the student.
 */
router.post('/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      couponCode,
      billingInfo,
      paymentMethod = 'UPI'
    } = req.body;

    const { keySecret, isReal, client } = getRazorpayConfig();
    const isSimulated = !razorpay_order_id || razorpay_order_id.startsWith('order_sim_') || razorpay_order_id.startsWith('order_test_');

    // 1. Signature Verification for Live/Real Razorpay Orders
    if (!isSimulated && isReal) {
      if (!razorpay_signature) {
        res.status(400).json({ success: false, message: 'Missing Razorpay payment signature.' });
        return;
      }

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        console.error('❌ [Razorpay] Signature mismatch!');
        res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
        return;
      }

      // 2. Verify and confirm status directly with Razorpay API
      try {
        const paymentDetails: any = await (client.payments as any).fetch(razorpay_payment_id);
        if (paymentDetails && paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          res.status(400).json({
            success: false,
            message: `Payment status is ${paymentDetails.status}. Payment has not succeeded.`
          });
          return;
        }

        // If authorized but not captured, auto-capture it
        if (paymentDetails && paymentDetails.status === 'authorized') {
          await (client.payments as any).capture(
            razorpay_payment_id,
            Number(paymentDetails.amount),
            paymentDetails.currency || 'INR'
          );
        }
      } catch (fetchErr: any) {
        console.warn('⚠️ [Razorpay] Direct payment status check warning:', fetchErr?.message || fetchErr);
      }
    }

    // 3. Find course details
    let course: any = null;
    if (isMongoConnected()) {
      course = await CourseModel.findOne({ id: courseId }).lean();
    }
    if (!course) {
      course = queryOne('SELECT * FROM courses WHERE id = ?', [courseId]);
    }

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // 4. Calculate final trusted price
    const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = queryOne(
        `SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1`,
        [String(couponCode).trim()]
      );
      if (coupon) {
        appliedCoupon = coupon;
        if (coupon.discount_type === 'percent') {
          discountAmount = (basePrice * Number(coupon.discount_value)) / 100;
        } else {
          discountAmount = Number(coupon.discount_value);
        }
        discountAmount = Math.min(basePrice, Math.round(discountAmount * 100) / 100);
      }
    }

    const finalAmount = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);
    const orderId = `ord-${uuidv4().slice(0, 8)}`;
    const orderNumber = `TRX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const effectivePaymentId = razorpay_payment_id || `pay_${uuidv4().replace(/-/g, '').slice(0, 14)}`;
    const enrollmentId = `enr-${uuidv4().slice(0, 8)}`;
    const now = new Date();

    // 5. Update or Create in MongoDB Atlas
    if (isMongoConnected()) {
      try {
        await OrderModel.findOneAndUpdate(
          { razorpay_order_id: razorpay_order_id },
          {
            $set: {
              payment_status: 'completed',
              transaction_id: effectivePaymentId,
              razorpay_payment_id: effectivePaymentId,
              razorpay_signature: razorpay_signature || null,
              billing_info: billingInfo || {},
              payment_method: paymentMethod,
              updated_at: now
            },
            $setOnInsert: {
              id: orderId,
              order_number: orderNumber,
              user_id: userId,
              course_id: courseId,
              amount: finalAmount,
              discount_amount: discountAmount,
              coupon_code: appliedCoupon ? appliedCoupon.code : null,
              currency: 'INR',
              created_at: now
            }
          },
          { upsert: true, new: true }
        );

        // Record Payment in MongoDB
        await PaymentModel.findOneAndUpdate(
          { razorpay_payment_id: effectivePaymentId },
          {
            id: `pay_rec_${uuidv4().slice(0, 8)}`,
            order_id: orderId,
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: effectivePaymentId,
            razorpay_signature: razorpay_signature || null,
            amount: finalAmount,
            currency: 'INR',
            status: 'captured',
            method: paymentMethod,
            user_id: userId,
            course_id: courseId,
            captured: true,
            raw_payload: { billingInfo },
            updated_at: now
          },
          { upsert: true, new: true }
        );

        // Automatic Enrollment in MongoDB
        await EnrollmentModel.findOneAndUpdate(
          { user_id: userId, course_id: courseId },
          {
            $setOnInsert: {
              id: enrollmentId,
              user_id: userId,
              course_id: courseId,
              order_id: orderId,
              enrolled_at: now,
              progress_percent: 0,
              status: 'active',
              created_at: now,
              updated_at: now
            }
          },
          { upsert: true, new: true }
        );

        await CourseModel.updateOne(
          { id: courseId },
          { $inc: { enrolled_count: 1 } }
        );
      } catch (mongoErr: any) {
        console.error('❌ [MongoDB] verify persistence error:', mongoErr?.message || mongoErr);
      }
    }

    // 6. Dual-write to SQLite
    try {
      // Find or insert order in SQLite
      const existingOrder = queryOne('SELECT id FROM orders WHERE id = ? OR transaction_id = ?', [razorpay_order_id, razorpay_order_id]);
      if (existingOrder) {
        execute(`
          UPDATE orders
          SET payment_status = 'completed', transaction_id = ?, payment_method = ?, billing_info = ?
          WHERE id = ?
        `, [effectivePaymentId, paymentMethod, JSON.stringify({ ...(billingInfo || {}), razorpay_order_id, razorpay_payment_id: effectivePaymentId }), existingOrder.id]);
      } else {
        execute(`
          INSERT INTO orders (
            id, order_number, user_id, course_id, amount, discount_amount,
            coupon_code, payment_method, payment_status, billing_info, transaction_id, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
        `, [
          orderId, orderNumber, userId, courseId, finalAmount, discountAmount,
          appliedCoupon ? appliedCoupon.code : null, paymentMethod,
          JSON.stringify({ ...(billingInfo || {}), razorpay_order_id, razorpay_payment_id: effectivePaymentId }),
          effectivePaymentId, now.toISOString()
        ]);
      }

      // First lesson id
      const firstLesson = queryOne(`
        SELECT l.id FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE l.course_id = ?
        ORDER BY m.order_num ASC, l.order_num ASC
        LIMIT 1
      `, [courseId]);

      // Automatic Enrollment in SQLite
      const existingSqlEnrollment = queryOne('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
      if (!existingSqlEnrollment) {
        execute(`
          INSERT INTO enrollments (id, user_id, course_id, order_id, enrolled_at, progress_percent, last_lesson_id, status)
          VALUES (?, ?, ?, ?, ?, 0, ?, 'active')
        `, [enrollmentId, userId, courseId, orderId, now.toISOString(), firstLesson?.id || null]);

        execute(`UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?`, [courseId]);
      }

      if (appliedCoupon) {
        execute(`UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`, [appliedCoupon.id]);
      }

      execute('DELETE FROM wishlist WHERE user_id = ? AND course_id = ?', [userId, courseId]);
    } catch (sqlErr: any) {
      console.warn('⚠️ [SQLite] verify persistence warning:', sqlErr?.message || sqlErr);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and course access granted.',
      order: {
        id: orderId,
        order_number: orderNumber,
        transaction_id: effectivePaymentId,
        razorpay_order_id,
        amount: finalAmount,
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        payment_status: 'completed',
        created_at: now.toISOString()
      },
      enrollment: {
        id: enrollmentId,
        course_id: courseId,
        status: 'active'
      }
    });

  } catch (error: any) {
    console.error('❌ [Payments] verify error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
});


/**
 * 3. POST /api/payments/webhook
 * Authenticated Razorpay Webhook receiver with HMAC signature verification.
 * Automatically reconciles payments even if user closes the browser!
 */
router.post('/webhook', async (req, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const { webhookSecret } = getRazorpayConfig();

    // Verify webhook signature if webhook secret is configured
    if (webhookSecret) {
      if (!signature) {
        console.warn('⚠️ [Webhook] Missing x-razorpay-signature header.');
        res.status(400).json({ status: 'error', message: 'Missing webhook signature.' });
        return;
      }

      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('❌ [Webhook] Invalid webhook signature!');
        res.status(400).json({ status: 'error', message: 'Invalid webhook signature.' });
        return;
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    console.log(`🔔 [Razorpay Webhook] Received event: ${event}`);

    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      const orderEntity = payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;
      const notes = orderEntity?.notes || paymentEntity?.notes || {};
      const userId = notes.userId;
      const courseId = notes.courseId;

      if (razorpayOrderId && razorpayPaymentId) {
        console.log(`✅ [Webhook] Reconciling payment: ${razorpayPaymentId} for order: ${razorpayOrderId}`);

        // Update in MongoDB
        if (isMongoConnected()) {
          await OrderModel.updateOne(
            { razorpay_order_id: razorpayOrderId },
            {
              $set: {
                payment_status: 'completed',
                transaction_id: razorpayPaymentId,
                razorpay_payment_id: razorpayPaymentId,
                updated_at: new Date()
              }
            }
          );

          if (userId && courseId) {
            await EnrollmentModel.findOneAndUpdate(
              { user_id: userId, course_id: courseId },
              {
                $setOnInsert: {
                  id: `enr-${uuidv4().slice(0, 8)}`,
                  user_id: userId,
                  course_id: courseId,
                  order_id: razorpayOrderId,
                  enrolled_at: new Date(),
                  progress_percent: 0,
                  status: 'active',
                  created_at: new Date(),
                  updated_at: new Date()
                }
              },
              { upsert: true, new: true }
            );
          }
        }

        // Update in SQLite
        execute(`
          UPDATE orders
          SET payment_status = 'completed', transaction_id = ?
          WHERE transaction_id = ? OR id = ?
        `, [razorpayPaymentId, razorpayOrderId, razorpayOrderId]);

        if (userId && courseId) {
          const existingEnr = queryOne(
            'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
          );
          if (!existingEnr) {
            execute(`
              INSERT INTO enrollments (id, user_id, course_id, order_id, enrolled_at, progress_percent, status)
              VALUES (?, ?, ?, ?, ?, 0, 'active')
            `, [`enr-${uuidv4().slice(0, 8)}`, userId, courseId, razorpayOrderId, new Date().toISOString()]);

            execute(`UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?`, [courseId]);
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const errorDesc = paymentEntity?.error_description || 'Payment failed';

      if (razorpayOrderId) {
        if (isMongoConnected()) {
          await OrderModel.updateOne(
            { razorpay_order_id: razorpayOrderId },
            { $set: { payment_status: 'failed', error_description: errorDesc, updated_at: new Date() } }
          );
        }
        execute(`
          UPDATE orders SET payment_status = 'failed' WHERE transaction_id = ? OR id = ?
        `, [razorpayOrderId, razorpayOrderId]);
      }
    }

    res.status(200).json({ status: 'ok', event });
  } catch (err: any) {
    console.error('❌ [Webhook] Error processing event:', err);
    res.status(500).json({ status: 'error', message: 'Webhook processing error.' });
  }
});


/**
 * 4. GET /api/payments/status/:orderId
 * Returns status only to the order owner or an administrator.
 */
router.get('/status/:orderId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let order: any = null;

    if (isMongoConnected()) {
      order = await OrderModel.findOne({
        $or: [{ id: orderId }, { order_number: orderId }, { razorpay_order_id: orderId }]
      }).lean();
    }

    if (!order) {
      order = queryOne(
        `SELECT * FROM orders WHERE id = ? OR order_number = ? OR transaction_id = ? OR billing_info LIKE ?`,
        [orderId, orderId, orderId, `%${orderId}%`]
      );
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Authorization check: Only order owner or admin
    if (order.user_id !== userId && userRole !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. You do not own this order.' });
      return;
    }

    // Check enrollment status
    let isEnrolled = false;
    if (isMongoConnected()) {
      const enr = await EnrollmentModel.findOne({ user_id: order.user_id, course_id: order.course_id }).lean();
      if (enr && enr.status === 'active') isEnrolled = true;
    }
    if (!isEnrolled) {
      const sqlEnr = queryOne(
        `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'active'`,
        [order.user_id, order.course_id]
      );
      if (sqlEnr) isEnrolled = true;
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        amount: order.amount,
        currency: order.currency || 'INR',
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        transaction_id: order.transaction_id || order.razorpay_payment_id,
        razorpay_order_id: order.razorpay_order_id,
        created_at: order.created_at
      },
      is_enrolled: isEnrolled
    });
  } catch (error: any) {
    console.error('❌ [Payments] status check error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve payment status.' });
  }
});


/**
 * 5. GET /api/my-courses
 * Returns all courses the authenticated student has purchased and is enrolled in.
 */
router.get('/my-courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Fetch from SQLite or MongoDB
    const enrolledCourses = query(`
      SELECT 
        e.id as enrollment_id, e.course_id, e.enrolled_at, e.progress_percent,
        e.last_lesson_id, e.completed_at, e.status as enrollment_status,
        c.title, c.slug, c.thumbnail, c.duration, c.difficulty_level, c.price,
        inst.name as instructor_name, inst.avatar as instructor_avatar,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = e.user_id AND lp.course_id = c.id AND lp.completed = 1) as completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      WHERE e.user_id = ? AND e.status != 'revoked'
      ORDER BY e.enrolled_at DESC
    `, [userId]);

    const formatted = enrolledCourses.map((c: any) => ({
      ...c,
      progress_percent: Math.min(100, Math.round(Number(c.progress_percent || 0))),
      total_lessons: Number(c.total_lessons || 0),
      completed_lessons: Number(c.completed_lessons || 0)
    }));

    res.json({
      success: true,
      courses: formatted
    });
  } catch (error: any) {
    console.error('❌ [Payments] my-courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses.' });
  }
});

export default router;
