import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  OrderModel,
  PaymentModel,
  EnrollmentModel,
  CourseModel,
  CouponModel,
  WishlistModel,
  LessonModel
} from '../models/index.js';

dotenv.config();

const router = Router();

// Helper to get active Razorpay client and keys dynamically
function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

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

  return { keyId, keySecret, isReal, client };
}

// Validate Coupon
router.post('/validate-coupon', async (req, res: Response) => {
  try {
    const { couponCode, courseId } = req.body;

    if (!couponCode) {
      res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
      return;
    }

    const coupon = await CouponModel.findOne({
      code: { $regex: new RegExp(`^${couponCode.trim()}$`, 'i') },
      is_active: 1
    }).lean();

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
      const course = await CourseModel.findOne({ id: courseId }).select('price discount_price').lean();
      if (course) {
        coursePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
      }
    }

    if (coupon.min_order_amount && coursePrice < Number(coupon.min_order_amount)) {
      res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order amount of ₹${coupon.min_order_amount}.`
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

// Create Razorpay Order
router.post('/create-razorpay-order', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, couponCode, paymentMethod = 'upi' } = req.body;

    if (!courseId) {
      res.status(400).json({ success: false, message: 'Course ID is required.' });
      return;
    }

    const course = await CourseModel.findOne({ id: courseId }).lean();
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // Check if user already enrolled
    const existingEnrollment = await EnrollmentModel.findOne({
      user_id: userId,
      course_id: courseId,
      status: { $ne: 'revoked' }
    });

    if (existingEnrollment) {
      res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
      return;
    }

    const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: { $regex: new RegExp(`^${couponCode.trim()}$`, 'i') },
        is_active: 1
      });

      if (coupon) {
        if (coupon.discount_type === 'percent') {
          discountAmount = (basePrice * Number(coupon.discount_value)) / 100;
        } else {
          discountAmount = Number(coupon.discount_value);
        }
        discountAmount = Math.min(basePrice, Math.round(discountAmount * 100) / 100);
      }
    }

    const finalAmount = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);

    if (finalAmount === 0) {
      res.status(400).json({ success: false, message: 'Course is free. Use standard checkout process.' });
      return;
    }

    const amountInPaise = Math.round(finalAmount * 100);
    const receipt = `receipt_${uuidv4().slice(0, 8)}`;

    const { keyId, isReal, client } = getRazorpayConfig();
    let orderId = `order_sim_${uuidv4().replace(/-/g, '').slice(0, 14)}`;
    let isRealRazorpayOrder = false;

    if (isReal) {
      try {
        const options = {
          amount: amountInPaise,
          currency: 'INR',
          receipt: receipt,
          payment_capture: 1
        };
        const order = await client.orders.create(options);
        orderId = order.id;
        isRealRazorpayOrder = true;
      } catch (liveErr: any) {
        console.warn('Live Razorpay order creation failed (falling back to test order):', liveErr?.message || liveErr);
      }
    }

    res.json({
      success: true,
      orderId,
      amount: finalAmount,
      currency: 'INR',
      keyId: isReal ? keyId : 'rzp_test_placeholder',
      isRealRazorpay: isRealRazorpayOrder,
      paymentMethod,
      courseTitle: course.title
    });
  } catch (error: any) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
});

// Verify Razorpay Payment (and Process Checkout)
router.post('/verify-payment', authenticateToken, async (req: AuthRequest, res: Response) => {
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

    const { keySecret, isReal } = getRazorpayConfig();
    const isSimulated =
      !razorpay_order_id ||
      razorpay_order_id.startsWith('order_sim_') ||
      razorpay_order_id.startsWith('order_test_') ||
      (!razorpay_signature && (process.env.NODE_ENV === 'development' || !isReal));

    if (!isSimulated && isReal && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
        return;
      }
    }

    const course = await CourseModel.findOne({ id: courseId }).lean();
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const existingEnrollment = await EnrollmentModel.findOne({
      user_id: userId,
      course_id: courseId,
      status: 'active'
    });

    if (existingEnrollment) {
      res.status(200).json({
        success: true,
        message: 'You are already enrolled in this course.',
        order: {
          id: existingEnrollment.order_id || `ord-${uuidv4().slice(0, 8)}`,
          payment_status: 'completed'
        },
        enrollment: existingEnrollment
      });
      return;
    }

    const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: { $regex: new RegExp(`^${couponCode.trim()}$`, 'i') },
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
    const now = new Date();
    const effectivePaymentId = razorpay_payment_id || `pay_${uuidv4().replace(/-/g, '').slice(0, 14)}`;

    // 1. Safely Upsert Order in MongoDB
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id || `order_sim_${uuidv4().replace(/-/g, '').slice(0, 14)}` },
      {
        $set: {
          payment_status: 'completed',
          transaction_id: effectivePaymentId,
          razorpay_payment_id: effectivePaymentId,
          razorpay_signature: razorpay_signature || null,
          billing_info: { ...(billingInfo || {}), razorpay_order_id, razorpay_payment_id: effectivePaymentId },
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

    // 2. Safely Upsert Payment Record in MongoDB
    await PaymentModel.findOneAndUpdate(
      { razorpay_payment_id: effectivePaymentId },
      {
        $set: {
          order_id: updatedOrder?.id || orderId,
          user_id: userId,
          course_id: courseId,
          amount: finalAmount,
          currency: 'INR',
          method: paymentMethod,
          status: 'captured',
          razorpay_order_id: razorpay_order_id || null,
          razorpay_payment_id: effectivePaymentId,
          razorpay_signature: razorpay_signature || null,
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

    // 3. Find First Lesson
    let firstLessonId: string | null = null;
    if (course.modules && course.modules.length > 0 && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
      firstLessonId = course.modules[0].lessons[0].id;
    } else {
      const firstLesson = await LessonModel.findOne({ course_id: courseId }).sort({ order_num: 1 }).lean();
      firstLessonId = firstLesson?.id || null;
    }

    // 4. Safely Upsert Enrollment in MongoDB (avoids duplicate key error on user_id + course_id)
    const enrollmentId = `enr-${uuidv4().slice(0, 8)}`;
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

    // 5. Increment course enrolled_count
    await CourseModel.updateOne({ id: courseId }, { $inc: { enrolled_count: 1 } });

    // 6. Update coupon usage
    if (appliedCoupon) {
      await CouponModel.updateOne({ id: appliedCoupon.id }, { $inc: { used_count: 1 } });
    }

    // 7. Remove from wishlist
    await WishlistModel.deleteOne({ user_id: userId, course_id: courseId });

    res.status(200).json({
      success: true,
      message: 'Payment verified and course access granted.',
      order: {
        id: updatedOrder?.id || orderId,
        order_number: updatedOrder?.order_number || orderNumber,
        transaction_id: effectivePaymentId,
        amount: updatedOrder?.amount != null ? updatedOrder.amount : finalAmount,
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        payment_status: 'completed',
        created_at: (updatedOrder?.created_at || now).toISOString()
      },
      enrollment: {
        id: updatedEnrollment?.id || enrollmentId,
        course_id: courseId,
        first_lesson_id: updatedEnrollment?.last_lesson_id || firstLessonId
      }
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Payment verification failed.' });
  }
});

// Process Checkout & Payment (Fallback for free courses)
router.post('/process', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, couponCode, billingInfo, paymentMethod = 'free' } = req.body;

    if (!courseId) {
      res.status(400).json({ success: false, message: 'Course ID is required.' });
      return;
    }

    const course = await CourseModel.findOne({ id: courseId }).lean();
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const existingEnrollment = await EnrollmentModel.findOne({
      user_id: userId,
      course_id: courseId,
      status: { $ne: 'revoked' }
    });

    if (existingEnrollment) {
      res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
      return;
    }

    const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: { $regex: new RegExp(`^${couponCode.trim()}$`, 'i') },
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

    if (finalAmount > 0) {
      res.status(400).json({ success: false, message: 'This course is not free. Please use standard checkout.' });
      return;
    }

    const orderId = `ord-${uuidv4().slice(0, 8)}`;
    const orderNumber = `TRX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId = `tx_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const now = new Date();

    // 1. Create Order
    await OrderModel.create({
      id: orderId,
      order_number: orderNumber,
      user_id: userId,
      course_id: courseId,
      amount: finalAmount,
      discount_amount: discountAmount,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      payment_method: paymentMethod,
      payment_status: 'completed',
      billing_info: billingInfo || {},
      transaction_id: transactionId,
      created_at: now,
      updated_at: now
    });

    // 2. Find first lesson
    let firstLessonId: string | null = null;
    if (course.modules && course.modules.length > 0 && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
      firstLessonId = course.modules[0].lessons[0].id;
    } else {
      const firstLesson = await LessonModel.findOne({ course_id: courseId }).sort({ order_num: 1 }).lean();
      firstLessonId = firstLesson?.id || null;
    }

    // 3. Create Enrollment
    const enrollmentId = `enr-${uuidv4().slice(0, 8)}`;
    await EnrollmentModel.create({
      id: enrollmentId,
      user_id: userId,
      course_id: courseId,
      order_id: orderId,
      enrolled_at: now,
      progress_percent: 0,
      last_lesson_id: firstLessonId,
      status: 'active',
      created_at: now,
      updated_at: now
    });

    // 4. Increment course enrolled_count
    await CourseModel.updateOne({ id: courseId }, { $inc: { enrolled_count: 1 } });

    // 5. Update coupon usage
    if (appliedCoupon) {
      await CouponModel.updateOne({ id: appliedCoupon.id }, { $inc: { used_count: 1 } });
    }

    // 6. Remove from wishlist
    await WishlistModel.deleteOne({ user_id: userId, course_id: courseId });

    res.status(201).json({
      success: true,
      message: 'Checkout completed successfully and course access granted.',
      order: {
        id: orderId,
        order_number: orderNumber,
        transaction_id: transactionId,
        amount: finalAmount,
        discount_amount: discountAmount,
        payment_status: 'completed',
        created_at: now.toISOString()
      },
      enrollment: {
        id: enrollmentId,
        course_id: courseId,
        first_lesson_id: firstLessonId
      }
    });
  } catch (error: any) {
    console.error('Checkout process error:', error);
    res.status(500).json({ success: false, message: 'Checkout processing failed. Please try again.' });
  }
});

export default router;
