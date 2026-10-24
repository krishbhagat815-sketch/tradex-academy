"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_js_1 = require("../middleware/auth.js");
const index_js_1 = require("../models/index.js");
const router = (0, express_1.Router)();
// Student Dashboard Overview
router.get('/dashboard', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Enrolled courses with course details and progress
        const enrollments = await index_js_1.EnrollmentModel.find({
            user_id: userId,
            status: { $ne: 'revoked' }
        })
            .sort({ enrolled_at: -1 })
            .lean();
        const formattedCourses = await Promise.all(enrollments.map(async (e) => {
            const course = await index_js_1.CourseModel.findOne({ id: e.course_id }).lean();
            const instructor = course?.instructor_id
                ? await index_js_1.InstructorModel.findOne({ id: course.instructor_id }).lean()
                : null;
            let total_lessons = 0;
            let last_lesson_title = '';
            if (course?.modules && Array.isArray(course.modules)) {
                for (const m of course.modules) {
                    if (m.lessons && Array.isArray(m.lessons)) {
                        total_lessons += m.lessons.length;
                        if (e.last_lesson_id) {
                            const foundLesson = m.lessons.find((l) => l.id === e.last_lesson_id);
                            if (foundLesson)
                                last_lesson_title = foundLesson.title;
                        }
                    }
                }
            }
            const completed_lessons = await index_js_1.LessonProgressModel.countDocuments({
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
                last_lesson_title,
                completed_at: e.completed_at,
                enrollment_status: e.status,
                title: course?.title || '',
                slug: course?.slug || '',
                thumbnail: course?.thumbnail || '',
                duration: course?.duration || '',
                difficulty_level: course?.difficulty_level || '',
                instructor_name: instructor?.name || 'TradeX Academy',
                instructor_avatar: instructor?.avatar || '',
                total_lessons,
                completed_lessons
            };
        }));
        const totalEnrolled = formattedCourses.length;
        const completedCoursesCount = formattedCourses.filter(c => c.progress_percent >= 100 || c.enrollment_status === 'completed').length;
        const inProgressCoursesCount = totalEnrolled - completedCoursesCount;
        // Count certificates
        const certificatesCount = await index_js_1.CertificateModel.countDocuments({ user_id: userId });
        // Recent orders
        const orders = await index_js_1.OrderModel.find({ user_id: userId })
            .sort({ created_at: -1 })
            .limit(5)
            .lean();
        const recentOrders = await Promise.all(orders.map(async (o) => {
            const c = await index_js_1.CourseModel.findOne({ id: o.course_id }).select('title').lean();
            return {
                id: o.id,
                order_number: o.order_number,
                amount: o.amount,
                payment_status: o.payment_status,
                created_at: o.created_at,
                course_title: c?.title || 'Trading Course'
            };
        }));
        res.json({
            success: true,
            stats: {
                totalEnrolled,
                completedCourses: completedCoursesCount,
                inProgressCourses: inProgressCoursesCount,
                certificatesEarned: certificatesCount
            },
            enrolled_courses: formattedCourses,
            recent_orders: recentOrders
        });
    }
    catch (error) {
        console.error('Student dashboard error:', error);
        res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
    }
});
// Update Lesson Progress
router.post('/progress', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, lessonId, completed = true } = req.body;
        if (!courseId || !lessonId) {
            res.status(400).json({ success: false, message: 'courseId and lessonId are required.' });
            return;
        }
        const now = new Date();
        if (completed) {
            const existing = await index_js_1.LessonProgressModel.findOne({ user_id: userId, lesson_id: lessonId });
            if (!existing) {
                await index_js_1.LessonProgressModel.create({
                    id: `prg-${(0, uuid_1.v4)().slice(0, 8)}`,
                    user_id: userId,
                    lesson_id: lessonId,
                    course_id: courseId,
                    completed: 1,
                    completed_at: now
                });
            }
        }
        else {
            await index_js_1.LessonProgressModel.deleteOne({ user_id: userId, lesson_id: lessonId });
        }
        // Calculate total lessons from course
        const course = await index_js_1.CourseModel.findOne({ id: courseId }).lean();
        let totalLessons = 0;
        if (course?.modules && Array.isArray(course.modules)) {
            for (const m of course.modules) {
                if (m.lessons && Array.isArray(m.lessons)) {
                    totalLessons += m.lessons.length;
                }
            }
        }
        if (totalLessons === 0)
            totalLessons = 1;
        const completedLessons = await index_js_1.LessonProgressModel.countDocuments({
            user_id: userId,
            course_id: courseId,
            completed: 1
        });
        const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
        const isCompleted = progressPercent >= 100;
        // Update enrollment
        await index_js_1.EnrollmentModel.findOneAndUpdate({ user_id: userId, course_id: courseId }, {
            progress_percent: progressPercent,
            last_lesson_id: lessonId,
            status: isCompleted ? 'completed' : 'active',
            ...(isCompleted ? { completed_at: now } : {}),
            updated_at: now
        });
        // Check certificate issuance if 100% completed
        let issuedCertificate = null;
        if (isCompleted) {
            const existingCert = await index_js_1.CertificateModel.findOne({ user_id: userId, course_id: courseId }).lean();
            if (!existingCert) {
                const certId = `cert-${(0, uuid_1.v4)().slice(0, 8)}`;
                const certCode = `CERT-TRX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
                const userRow = await index_js_1.UserModel.findOne({ id: userId }).lean();
                const instructor = course?.instructor_id
                    ? await index_js_1.InstructorModel.findOne({ id: course.instructor_id }).lean()
                    : null;
                const newCert = await index_js_1.CertificateModel.create({
                    id: certId,
                    certificate_code: certCode,
                    user_id: userId,
                    course_id: courseId,
                    student_name: userRow?.name || 'Valued Student',
                    course_title: course?.title || 'Certificate of Completion',
                    instructor_name: instructor?.name || 'TradeX Academy',
                    issued_at: now
                });
                issuedCertificate = {
                    certificate_code: certCode,
                    issued_at: now
                };
            }
            else {
                issuedCertificate = existingCert;
            }
        }
        res.json({
            success: true,
            progress_percent: progressPercent,
            completed_lessons: completedLessons,
            total_lessons: totalLessons,
            is_completed: isCompleted,
            certificate: issuedCertificate
        });
    }
    catch (error) {
        console.error('Progress update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update progress.' });
    }
});
// Save or Update Notes for a Lesson
router.post('/notes', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, lessonId, content } = req.body;
        if (!courseId || !lessonId) {
            res.status(400).json({ success: false, message: 'courseId and lessonId are required.' });
            return;
        }
        const now = new Date();
        await index_js_1.NoteModel.findOneAndUpdate({ user_id: userId, lesson_id: lessonId }, {
            id: `not-${(0, uuid_1.v4)().slice(0, 8)}`,
            user_id: userId,
            course_id: courseId,
            lesson_id: lessonId,
            content: content || '',
            updated_at: now
        }, { upsert: true, new: true });
        res.json({ success: true, message: 'Note saved successfully.' });
    }
    catch (error) {
        console.error('Save note error:', error);
        res.status(500).json({ success: false, message: 'Failed to save note.' });
    }
});
// Get Student Wishlist
router.get('/wishlist', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await index_js_1.WishlistModel.find({ user_id: userId }).sort({ created_at: -1 }).lean();
        const wishlistCourses = await Promise.all(items.map(async (w) => {
            const c = await index_js_1.CourseModel.findOne({ id: w.course_id }).lean();
            const inst = c?.instructor_id ? await index_js_1.InstructorModel.findOne({ id: c.instructor_id }).lean() : null;
            const isEnrolled = await index_js_1.EnrollmentModel.exists({
                user_id: userId,
                course_id: w.course_id,
                status: { $ne: 'revoked' }
            });
            return {
                wishlist_id: w.id,
                wishlisted_at: w.created_at,
                id: c?.id || w.course_id,
                title: c?.title || '',
                slug: c?.slug || '',
                short_description: c?.short_description || '',
                thumbnail: c?.thumbnail || '',
                price: c?.price || 0,
                discount_price: c?.discount_price,
                difficulty_level: c?.difficulty_level || '',
                duration: c?.duration || '',
                rating: c?.rating || 5.0,
                review_count: c?.review_count || 0,
                instructor_name: inst?.name || 'TradeX Academy',
                is_enrolled: isEnrolled ? 1 : 0
            };
        }));
        res.json({ success: true, wishlist: wishlistCourses });
    }
    catch (error) {
        console.error('Fetch wishlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
    }
});
// Toggle Course in Wishlist
router.post('/wishlist/:courseId', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;
        const existing = await index_js_1.WishlistModel.findOne({ user_id: userId, course_id: courseId });
        if (existing) {
            await index_js_1.WishlistModel.deleteOne({ id: existing.id });
            res.json({ success: true, message: 'Removed from wishlist.', is_wishlisted: false });
        }
        else {
            await index_js_1.WishlistModel.create({
                id: `wsh-${(0, uuid_1.v4)().slice(0, 8)}`,
                user_id: userId,
                course_id: courseId,
                created_at: new Date()
            });
            res.json({ success: true, message: 'Added to wishlist.', is_wishlisted: true });
        }
    }
    catch (error) {
        console.error('Toggle wishlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle wishlist.' });
    }
});
// Get Student Certificates
router.get('/certificates', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const certs = await index_js_1.CertificateModel.find({ user_id: userId }).sort({ issued_at: -1 }).lean();
        const formatted = await Promise.all(certs.map(async (cert) => {
            const c = await index_js_1.CourseModel.findOne({ id: cert.course_id }).select('thumbnail slug').lean();
            return {
                ...cert,
                course_thumbnail: c?.thumbnail || '',
                course_slug: c?.slug || ''
            };
        }));
        res.json({ success: true, certificates: formatted });
    }
    catch (error) {
        console.error('Fetch certificates error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
    }
});
// Get Student Order History
router.get('/orders', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await index_js_1.OrderModel.find({ user_id: userId }).sort({ created_at: -1 }).lean();
        const formattedOrders = await Promise.all(orders.map(async (o) => {
            const c = await index_js_1.CourseModel.findOne({ id: o.course_id }).select('title thumbnail slug').lean();
            return {
                ...o,
                course_title: c?.title || 'Course',
                course_thumbnail: c?.thumbnail || '',
                course_slug: c?.slug || '',
                billing_info: typeof o.billing_info === 'string' ? JSON.parse(o.billing_info) : (o.billing_info || {})
            };
        }));
        res.json({ success: true, orders: formattedOrders });
    }
    catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
});
exports.default = router;
