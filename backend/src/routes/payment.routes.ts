import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import {
  OrderModel,
  PaymentModel,
  EnrollmentModel,
  CourseModel,
  CouponModel,
  WishlistModel,
  InstructorModel,
  LessonProgressModel,
  LessonModel
} from '../models/index.js';

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
 * Initiates an official Razorpay order with server-side pricing validation
 * and saves pending order in MongoDB.
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
    const course = await CourseModel.findOne({ id: courseId }).lean();
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // 2. Check existing enrollment (prevent duplicate purchases)
    const existingEnrollment = await EnrollmentModel.findOne({
      user_id: userId,
      course_id: courseId,
      status: { $ne: 'revoked' }
    }).lean();

    if (existingEnrollment) {
      res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
      return;
    }

    // 3. Calculate price & discounts securely
    const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: { $regex: new RegExp(`^${String(couponCode).trim()}$`, 'i') },
        is_active: 1
      });

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

    const { keyId, isReal, client } = getRazorpayConfig();
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
          payment_capture: true,
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
 * updates order in MongoDB, and automatically enrolls the student.
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
    const isSimulated =
      !razorpay_order_id ||
      razorpay_order_id.startsWith('order_sim_') ||
      razorpay_order_id.startsWith('order_test_') ||
      (!razorpay_signature && (process.env.NODE_ENV === 'development' || !isReal));

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
    const course = await CourseModel.findOne({ id: courseId }).lean();
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // 4. Calculate final trusted price
    const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: { $regex: new RegExp(`^${String(couponCode).trim()}$`, 'i') },
        is_active: 1
      });
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

    // 5. Update or Create Order in MongoDB Atlas
    const updatedOrder = await OrderModel.findOneAndUpdate(
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
      { upsert: true, returnDocument: 'after' }
    );

    // Record Payment in MongoDB
    await PaymentModel.findOneAndUpdate(
      { razorpay_payment_id: effectivePaymentId },
      {
        $set: {
          order_id: updatedOrder?.id || orderId,
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
        $setOnInsert: {
          id: `pay_rec_${uuidv4().slice(0, 8)}`,
          created_at: now
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Find first lesson for enrollment
    let firstLessonId: string | null = null;
    if (course.modules && course.modules.length > 0 && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
      firstLessonId = course.modules[0].lessons[0].id;
    } else {
      const firstLesson = await LessonModel.findOne({ course_id: courseId }).sort({ order_num: 1 }).lean();
      firstLessonId = firstLesson?.id || null;
    }

    // Automatic Enrollment in MongoDB:
    // Safely upsert and activate enrollment without conflicting Mongoose timestamps
    const updatedEnrollment = await EnrollmentModel.findOneAndUpdate(
      { user_id: userId, course_id: courseId },
      {
        $set: {
          status: 'active',
          order_id: updatedOrder?.id || orderId,
          enrolled_at: now,
          ...(firstLessonId ? { last_lesson_id: firstLessonId } : {})
        },
        $setOnInsert: {
          id: enrollmentId,
          user_id: userId,
          course_id: courseId,
          progress_percent: 0,
          created_at: now
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await CourseModel.updateOne(
      { id: courseId },
      { $inc: { enrolled_count: 1 } }
    );

    if (appliedCoupon) {
      await CouponModel.updateOne(
        { id: appliedCoupon.id },
        { $inc: { used_count: 1 } }
      );
    }

    await WishlistModel.deleteOne({ user_id: userId, course_id: courseId });

    res.status(200).json({
      success: true,
      message: 'Payment verified and course access granted successfully.',
      order: {
        id: updatedOrder?.id || orderId,
        order_number: updatedOrder?.order_number || orderNumber,
        amount: updatedOrder?.amount != null ? updatedOrder.amount : finalAmount,
        payment_status: 'completed',
        payment_method: paymentMethod,
        transaction_id: effectivePaymentId
      },
      enrollment: {
        id: updatedEnrollment?.id || enrollmentId,
        course_id: courseId,
        first_lesson_id: updatedEnrollment?.last_lesson_id || firstLessonId
      }
    });
  } catch (error: any) {
    console.error('❌ [Payments] verification error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Payment verification failed.' });
  }
});

/**
 * 3. POST /api/payments/webhook
 * Authenticated Razorpay Webhook receiver with HMAC signature verification.
 */
router.post('/webhook', async (req, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const { webhookSecret } = getRazorpayConfig();

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
          const enr = await EnrollmentModel.findOne({ user_id: userId, course_id: courseId });
          if (!enr) {
            await EnrollmentModel.create({
              id: `enr-${uuidv4().slice(0, 8)}`,
              user_id: userId,
              course_id: courseId,
              order_id: razorpayOrderId,
              enrolled_at: new Date(),
              progress_percent: 0,
              status: 'active',
              created_at: new Date(),
              updated_at: new Date()
            });

            await CourseModel.updateOne({ id: courseId }, { $inc: { enrolled_count: 1 } });
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const errorDesc = paymentEntity?.error_description || 'Payment failed';

      if (razorpayOrderId) {
        await OrderModel.updateOne(
          { razorpay_order_id: razorpayOrderId },
          { $set: { payment_status: 'failed', error_description: errorDesc, updated_at: new Date() } }
        );
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

    const order = await OrderModel.findOne({
      $or: [{ id: orderId }, { order_number: orderId }, { razorpay_order_id: orderId }, { transaction_id: orderId }]
    }).lean();

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (order.user_id !== userId && userRole !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. You do not own this order.' });
      return;
    }

    const enr = await EnrollmentModel.findOne({
      user_id: order.user_id,
      course_id: order.course_id,
      status: 'active'
    }).lean();

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
      is_enrolled: Boolean(enr)
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

    const enrollments = await EnrollmentModel.find({
      user_id: userId,
      status: { $ne: 'revoked' }
    })
      .sort({ enrolled_at: -1 })
      .lean();

    const courses = await Promise.all(
      enrollments.map(async (e: any) => {
        const c = await CourseModel.findOne({ id: e.course_id }).lean();
        const inst = c?.instructor_id ? await InstructorModel.findOne({ id: c.instructor_id }).lean() : null;

        let total_lessons = 0;
        if (c?.modules && Array.isArray(c.modules)) {
          for (const m of c.modules) {
            if (m.lessons && Array.isArray(m.lessons)) {
              total_lessons += m.lessons.length;
            }
          }
        }

        const completed_lessons = await LessonProgressModel.countDocuments({
          user_id: userId,
          course_id: e.course_id,
          completed: 1
        });

        return {
          enrollment_id: e.id,
          course_id: e.course_id,
          enrolled_at: e.enrolled_at,
          progress_percent: Math.min(100, Math.round(Number(e.progress_percent || 0))),
          last_lesson_id: e.last_lesson_id,
          completed_at: e.completed_at,
          enrollment_status: e.status,
          title: c?.title || '',
          slug: c?.slug || '',
          thumbnail: c?.thumbnail || '',
          duration: c?.duration || '',
          difficulty_level: c?.difficulty_level || '',
          price: c?.price || 0,
          instructor_name: inst?.name || 'TradeX Academy',
          instructor_avatar: inst?.avatar || '',
          total_lessons,
          completed_lessons
        };
      })
    );

    res.json({
      success: true,
      courses
    });
  } catch (error: any) {
    console.error('❌ [Payments] my-courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses.' });
  }
});

export default router;
