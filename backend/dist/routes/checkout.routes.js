"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const database_js_1 = require("../db/database.js");
const auth_js_1 = require("../middleware/auth.js");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const mongodb_js_1 = require("../db/mongodb.js");
const index_js_1 = require("../models/index.js");
const router = (0, express_1.Router)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Helper to get active Razorpay client and keys dynamically
function getRazorpayConfig() {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';
    const isReal = Boolean(keyId &&
        !keyId.includes('placeholder') &&
        keyId !== 'your_razorpay_key_id' &&
        keySecret &&
        !keySecret.includes('placeholder'));
    const client = new razorpay_1.default({
        key_id: isReal ? keyId : 'rzp_test_placeholder',
        key_secret: isReal ? keySecret : 'rzp_test_secret_placeholder',
    });
    return { keyId, keySecret, isReal, client };
}
// Validate Coupon
router.post('/validate-coupon', async (req, res) => {
    try {
        const { couponCode, courseId } = req.body;
        if (!couponCode) {
            res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
            return;
        }
        const coupon = (0, database_js_1.queryOne)(`
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
            const course = (0, database_js_1.queryOne)('SELECT price, discount_price FROM courses WHERE id = ?', [courseId]);
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
        }
        else {
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
    }
    catch (error) {
        console.error('Coupon validation error:', error);
        res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
    }
});
// Create Razorpay Order
router.post('/create-razorpay-order', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, couponCode, paymentMethod = 'upi' } = req.body;
        if (!courseId) {
            res.status(400).json({ success: false, message: 'Course ID is required.' });
            return;
        }
        const course = (0, database_js_1.queryOne)('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        // Check if user already enrolled
        const existingEnrollment = (0, database_js_1.queryOne)(`
      SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status != 'revoked'
    `, [userId, courseId]);
        if (existingEnrollment) {
            res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
            return;
        }
        const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
        let discountAmount = 0;
        if (couponCode) {
            const coupon = (0, database_js_1.queryOne)(`
        SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1
      `, [couponCode.trim()]);
            if (coupon) {
                if (coupon.discount_type === 'percent') {
                    discountAmount = (basePrice * Number(coupon.discount_value)) / 100;
                }
                else {
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
        const receipt = `receipt_${(0, uuid_1.v4)().slice(0, 8)}`;
        const { keyId, keySecret, isReal, client } = getRazorpayConfig();
        let orderId = `order_sim_${(0, uuid_1.v4)().replace(/-/g, '').slice(0, 14)}`;
        let isRealRazorpayOrder = false;
        // Check if real key is present and try creating real Razorpay order
        if (isReal) {
            try {
                const options = {
                    amount: amountInPaise,
                    currency: "INR",
                    receipt: receipt,
                    payment_capture: 1
                };
                const order = await client.orders.create(options);
                orderId = order.id;
                isRealRazorpayOrder = true;
            }
            catch (liveErr) {
                console.warn('Live Razorpay order creation failed (falling back to test order):', liveErr?.message || liveErr);
            }
        }
        res.json({
            success: true,
            orderId,
            amount: finalAmount,
            currency: "INR",
            keyId: isReal ? keyId : 'rzp_test_placeholder',
            isRealRazorpay: isRealRazorpayOrder,
            paymentMethod,
            courseTitle: course.title
        });
    }
    catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order.' });
    }
});
// Verify Razorpay Payment (and Process Checkout)
router.post('/verify-payment', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, couponCode, billingInfo, paymentMethod = 'UPI' } = req.body;
        const { keySecret, isReal } = getRazorpayConfig();
        const isSimulated = !razorpay_order_id || razorpay_order_id.startsWith('order_sim_') || razorpay_order_id.startsWith('order_test_');
        // Verify signature only for live/real Razorpay orders
        if (!isSimulated && isReal && razorpay_signature) {
            const generated_signature = crypto_1.default
                .createHmac('sha256', keySecret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');
            if (generated_signature !== razorpay_signature) {
                res.status(400).json({ success: false, message: 'Payment verification failed.' });
                return;
            }
        }
        const course = (0, database_js_1.queryOne)('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        const existingEnrollment = (0, database_js_1.queryOne)(`
      SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status != 'revoked'
    `, [userId, courseId]);
        if (existingEnrollment) {
            res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
            return;
        }
        const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
        let discountAmount = 0;
        let appliedCoupon = null;
        if (couponCode) {
            const coupon = (0, database_js_1.queryOne)(`
        SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1
      `, [couponCode.trim()]);
            if (coupon) {
                appliedCoupon = coupon;
                if (coupon.discount_type === 'percent') {
                    discountAmount = (basePrice * Number(coupon.discount_value)) / 100;
                }
                else {
                    discountAmount = Number(coupon.discount_value);
                }
                discountAmount = Math.min(basePrice, Math.round(discountAmount * 100) / 100);
            }
        }
        const finalAmount = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);
        const orderId = `ord-${(0, uuid_1.v4)().slice(0, 8)}`;
        const orderNumber = `TRX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const now = new Date().toISOString();
        const effectivePaymentId = razorpay_payment_id || `pay_${(0, uuid_1.v4)().replace(/-/g, '').slice(0, 14)}`;
        // 1. Create Order
        (0, database_js_1.execute)(`
      INSERT INTO orders (
        id, order_number, user_id, course_id, amount, discount_amount,
        coupon_code, payment_method, payment_status, billing_info, transaction_id, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
    `, [
            orderId, orderNumber, userId, courseId, finalAmount, discountAmount,
            appliedCoupon ? appliedCoupon.code : null, paymentMethod,
            JSON.stringify({ ...(billingInfo || {}), razorpay_order_id, razorpay_payment_id: effectivePaymentId }), effectivePaymentId, now
        ]);
        // 2. Create Enrollment
        const enrollmentId = `enr-${(0, uuid_1.v4)().slice(0, 8)}`;
        const firstLesson = (0, database_js_1.queryOne)(`
      SELECT l.id FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE l.course_id = ?
      ORDER BY m.order_num ASC, l.order_num ASC
      LIMIT 1
    `, [courseId]);
        (0, database_js_1.execute)(`
      INSERT INTO enrollments (id, user_id, course_id, order_id, enrolled_at, progress_percent, last_lesson_id, status)
      VALUES (?, ?, ?, ?, ?, 0, ?, 'active')
    `, [enrollmentId, userId, courseId, orderId, now, firstLesson?.id || null]);
        // 3. Increment course enrolled_count
        (0, database_js_1.execute)(`
      UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?
    `, [courseId]);
        // 4. Update coupon usage
        if (appliedCoupon) {
            (0, database_js_1.execute)(`
        UPDATE coupons SET used_count = used_count + 1 WHERE id = ?
      `, [appliedCoupon.id]);
        }
        // 5. Remove from wishlist if exists
        (0, database_js_1.execute)('DELETE FROM wishlist WHERE user_id = ? AND course_id = ?', [userId, courseId]);
        // 6. Sync to MongoDB Atlas
        if ((0, mongodb_js_1.isMongoConnected)()) {
            try {
                await index_js_1.OrderModel.findOneAndUpdate({ razorpay_order_id: razorpay_order_id }, {
                    $set: {
                        payment_status: 'completed',
                        transaction_id: effectivePaymentId,
                        razorpay_payment_id: effectivePaymentId,
                        razorpay_signature: razorpay_signature || null,
                        billing_info: billingInfo || {},
                        payment_method: paymentMethod,
                        updated_at: new Date()
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
                        created_at: new Date()
                    }
                }, { upsert: true, new: true });
                await index_js_1.PaymentModel.findOneAndUpdate({ razorpay_payment_id: effectivePaymentId }, {
                    id: `pay_rec_${(0, uuid_1.v4)().slice(0, 8)}`,
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
                    updated_at: new Date()
                }, { upsert: true, new: true });
                await index_js_1.EnrollmentModel.findOneAndUpdate({ user_id: userId, course_id: courseId }, {
                    $setOnInsert: {
                        id: enrollmentId,
                        user_id: userId,
                        course_id: courseId,
                        order_id: orderId,
                        enrolled_at: new Date(),
                        progress_percent: 0,
                        status: 'active',
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                }, { upsert: true, new: true });
                await index_js_1.CourseModel.updateOne({ id: courseId }, { $inc: { enrolled_count: 1 } });
            }
            catch (mongoErr) {
                console.warn('⚠️ [MongoDB] checkout route persistence warning:', mongoErr?.message || mongoErr);
            }
        }
        res.status(201).json({
            success: true,
            message: 'Payment verified and course access granted.',
            order: {
                id: orderId,
                order_number: orderNumber,
                transaction_id: effectivePaymentId,
                amount: finalAmount,
                discount_amount: discountAmount,
                payment_method: paymentMethod,
                payment_status: 'completed',
                created_at: now
            },
            enrollment: {
                id: enrollmentId,
                course_id: courseId,
                first_lesson_id: firstLesson?.id || null
            }
        });
    }
    catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, message: 'Payment verification failed.' });
    }
});
// Process Checkout & Payment (Fallback for free courses)
router.post('/process', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, couponCode, billingInfo, paymentMethod = 'free' } = req.body;
        if (!courseId) {
            res.status(400).json({ success: false, message: 'Course ID is required.' });
            return;
        }
        const course = (0, database_js_1.queryOne)('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        // Check if user already enrolled
        const existingEnrollment = (0, database_js_1.queryOne)(`
      SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status != 'revoked'
    `, [userId, courseId]);
        if (existingEnrollment) {
            res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
            return;
        }
        const basePrice = course.discount_price != null ? Number(course.discount_price) : Number(course.price);
        let discountAmount = 0;
        let appliedCoupon = null;
        if (couponCode) {
            const coupon = (0, database_js_1.queryOne)(`
        SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1
      `, [couponCode.trim()]);
            if (coupon) {
                appliedCoupon = coupon;
                if (coupon.discount_type === 'percent') {
                    discountAmount = (basePrice * Number(coupon.discount_value)) / 100;
                }
                else {
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
        const orderId = `ord-${(0, uuid_1.v4)().slice(0, 8)}`;
        const orderNumber = `TRX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const transactionId = `tx_${(0, uuid_1.v4)().replace(/-/g, '').slice(0, 16)}`;
        const now = new Date().toISOString();
        // 1. Create Order
        (0, database_js_1.execute)(`
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
        const enrollmentId = `enr-${(0, uuid_1.v4)().slice(0, 8)}`;
        const firstLesson = (0, database_js_1.queryOne)(`
      SELECT l.id FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE l.course_id = ?
      ORDER BY m.order_num ASC, l.order_num ASC
      LIMIT 1
    `, [courseId]);
        (0, database_js_1.execute)(`
      INSERT INTO enrollments (id, user_id, course_id, order_id, enrolled_at, progress_percent, last_lesson_id, status)
      VALUES (?, ?, ?, ?, ?, 0, ?, 'active')
    `, [enrollmentId, userId, courseId, orderId, now, firstLesson?.id || null]);
        // 3. Increment course enrolled_count
        (0, database_js_1.execute)(`
      UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?
    `, [courseId]);
        // 4. Update coupon usage
        if (appliedCoupon) {
            (0, database_js_1.execute)(`
        UPDATE coupons SET used_count = used_count + 1 WHERE id = ?
      `, [appliedCoupon.id]);
        }
        // 5. Remove from wishlist if exists
        (0, database_js_1.execute)('DELETE FROM wishlist WHERE user_id = ? AND course_id = ?', [userId, courseId]);
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
                created_at: now
            },
            enrollment: {
                id: enrollmentId,
                course_id: courseId,
                first_lesson_id: firstLesson?.id || null
            }
        });
    }
    catch (error) {
        console.error('Checkout process error:', error);
        res.status(500).json({ success: false, message: 'Checkout processing failed. Please try again.' });
    }
});
exports.default = router;
