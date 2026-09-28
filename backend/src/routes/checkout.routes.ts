import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, execute } from '../db/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validate Coupon
router.post('/validate-coupon', async (req, res: Response) => {
  try {
    const { couponCode, courseId } = req.body;

    if (!couponCode) {
      res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
      return;
    }

    const coupon = queryOne(`
      SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1
    `, [couponCode.trim()]);

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
      return;
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      res.status(400).json({ success: false, message: 'This coupon code has expired.' });
      return;
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
      return;
    }

    let coursePrice = 0;
    if (courseId) {
      const course = queryOne('SELECT price, discount_price FROM courses WHERE id = ?', [courseId]);
      if (course) {
        coursePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
      }
    }

    if (coupon.min_order_amount && coursePrice < Number(coupon.min_order_amount)) {
      res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order amount of $${coupon.min_order_amount}.`
      });
      return;
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percent') {
      discountAmount = (coursePrice * Number(coupon.discount_value)) / 100;
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    discountAmount = Math.min(coursePrice, Math.round(discountAmount * 100) / 100);
    const finalPrice = Math.max(0, Math.round((coursePrice - discountAmount) * 100) / 100);

    res.json({
      success: true,
      message: `Coupon applied: ${coupon.code}`,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        discount_amount: discountAmount,
        original_price: coursePrice,
        final_price: finalPrice
      }
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
  }
});

// Process Checkout & Payment
router.post('/process', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, couponCode, billingInfo, paymentMethod = 'card' } = req.body;

    if (!courseId) {
      res.status(400).json({ success: false, message: 'Course ID is required.' });
      return;
    }

    const course = queryOne('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // Check if user already enrolled
    const existingEnrollment = queryOne(`
      SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status != 'revoked'
    `, [userId, courseId]);

    if (existingEnrollment) {
      res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
      return;
    }

    const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = queryOne(`
        SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1
      `, [couponCode.trim()]);

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
    const transactionId = `tx_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const now = new Date().toISOString();

    // 1. Create Order
    execute(`
      INSERT INTO orders (
        id, order_number, user_id, course_id, amount, discount_amount,
        coupon_code, payment_method, payment_status, billing_info, transaction_id, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
    `, [
      orderId, orderNumber, userId, courseId, finalAmount, discountAmount,
      appliedCoupon ? appliedCoupon.code : null, paymentMethod,
      JSON.stringify(billingInfo || {}), transactionId, now
    ]);

    // 2. Create Enrollment
    const enrollmentId = `enr-${uuidv4().slice(0, 8)}`;
    const firstLesson = queryOne(`
      SELECT l.id FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE l.course_id = ?
      ORDER BY m.order_num ASC, l.order_num ASC
      LIMIT 1
    `, [courseId]);

    execute(`
      INSERT INTO enrollments (id, user_id, course_id, order_id, enrolled_at, progress_percent, last_lesson_id, status)
      VALUES (?, ?, ?, ?, ?, 0, ?, 'active')
    `, [enrollmentId, userId, courseId, orderId, now, firstLesson?.id || null]);

    // 3. Increment course enrolled_count
    execute(`
      UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?
    `, [courseId]);

    // 4. Update coupon usage
    if (appliedCoupon) {
      execute(`
        UPDATE coupons SET used_count = used_count + 1 WHERE id = ?
      `, [appliedCoupon.id]);
    }

    // 5. Remove from wishlist if exists
    execute('DELETE FROM wishlist WHERE user_id = ? AND course_id = ?', [userId, courseId]);

    res.status(201).json({
      success: true,
      message: 'Payment completed successfully and course access granted.',
      order: {
        id: orderId,
        order_number: orderNumber,
        transaction_id: transactionId,
        amount: finalAmount,
        discount_amount: discountAmount,
        payment_status: 'completed',
        created_at: now
      },
      enrollment: {
        id: enrollmentId,
        course_id: courseId,
        first_lesson_id: firstLesson?.id || null
      }
    });
  } catch (error: any) {
    console.error('Checkout process error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed. Please try again.' });
  }
});

export default router;
