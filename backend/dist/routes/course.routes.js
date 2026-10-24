"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const index_js_1 = require("../models/index.js");
const router = (0, express_1.Router)();
// Browse & Search Courses
router.get('/', auth_js_1.optionalAuth, async (req, res) => {
    try {
        const { search, category, level, price, rating, sort = 'popular', featured, limit = 50, page = 1 } = req.query;
        const filter = { status: 'published' };
        if (search) {
            const term = String(search).trim();
            const regex = new RegExp(term, 'i');
            filter.$or = [
                { title: regex },
                { short_description: regex },
                { tags: { $in: [regex] } }
            ];
        }
        if (category && category !== 'all') {
            const cat = await index_js_1.CategoryModel.findOne({
                $or: [{ slug: String(category) }, { id: String(category) }]
            }).lean();
            if (cat) {
                filter.category_id = cat.id;
            }
            else {
                filter.category_id = String(category);
            }
        }
        if (level && level !== 'all') {
            filter.difficulty_level = String(level);
        }
        if (price === 'free') {
            filter.$or = [
                { price: 0 },
                { discount_price: 0 }
            ];
        }
        else if (price === 'paid') {
            filter.price = { $gt: 0 };
        }
        if (rating) {
            filter.rating = { $gte: Number(rating) };
        }
        if (featured === '1' || featured === 'true') {
            filter.featured = true;
        }
        // Sort order
        let sortOption = { enrolled_count: -1, rating: -1 };
        switch (sort) {
            case 'newest':
                sortOption = { created_at: -1 };
                break;
            case 'price-asc':
                sortOption = { price: 1 };
                break;
            case 'price-desc':
                sortOption = { price: -1 };
                break;
            case 'rating':
                sortOption = { rating: -1, review_count: -1 };
                break;
            case 'popular':
            default:
                sortOption = { enrolled_count: -1, rating: -1 };
                break;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const courses = await index_js_1.CourseModel.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .lean();
        // Fetch user wishlist if authenticated
        let wishlistCourseIds = new Set();
        if (req.user) {
            const wishlistRows = await index_js_1.WishlistModel.find({ user_id: req.user.id }).select('course_id').lean();
            wishlistCourseIds = new Set(wishlistRows.map((r) => r.course_id));
        }
        const formattedCourses = await Promise.all(courses.map(async (c) => {
            const cat = c.category_id ? await index_js_1.CategoryModel.findOne({ id: c.category_id }).lean() : null;
            const inst = c.instructor_id ? await index_js_1.InstructorModel.findOne({ id: c.instructor_id }).lean() : null;
            const originalPrice = Number(c.price || 0);
            const currentPrice = c.discount_price != null ? Number(c.discount_price) : originalPrice;
            const discountPercent = originalPrice > 0 && currentPrice < originalPrice
                ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                : 0;
            let module_count = 0;
            let lesson_count = 0;
            if (c.modules && Array.isArray(c.modules)) {
                module_count = c.modules.length;
                for (const m of c.modules) {
                    if (m.lessons && Array.isArray(m.lessons)) {
                        lesson_count += m.lessons.length;
                    }
                }
            }
            return {
                ...c,
                category_name: cat?.name || '',
                category_slug: cat?.slug || '',
                instructor_name: inst?.name || 'TradeX Academy',
                instructor_avatar: inst?.avatar || '',
                instructor_title: inst?.title || '',
                price: originalPrice,
                discount_price: c.discount_price != null ? currentPrice : null,
                discount_percentage: discountPercent,
                module_count,
                lesson_count,
                is_wishlisted: wishlistCourseIds.has(c.id)
            };
        }));
        res.json({
            success: true,
            count: formattedCourses.length,
            courses: formattedCourses
        });
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
    }
});
// Single Course Details Page
router.get('/:idOrSlug', auth_js_1.optionalAuth, async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const course = await index_js_1.CourseModel.findOne({
            $or: [{ id: idOrSlug }, { slug: idOrSlug }]
        }).lean();
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        const cat = course.category_id ? await index_js_1.CategoryModel.findOne({ id: course.category_id }).lean() : null;
        const inst = course.instructor_id ? await index_js_1.InstructorModel.findOne({ id: course.instructor_id }).lean() : null;
        let isEnrolled = false;
        let enrollmentData = null;
        let isWishlisted = false;
        if (req.user) {
            const enrollment = await index_js_1.EnrollmentModel.findOne({
                user_id: req.user.id,
                course_id: course.id,
                status: { $ne: 'revoked' }
            }).lean();
            if (enrollment || req.user.role === 'admin') {
                isEnrolled = true;
                enrollmentData = enrollment;
            }
            isWishlisted = await index_js_1.WishlistModel.exists({
                user_id: req.user.id,
                course_id: course.id
            }) ? true : false;
        }
        // Build curriculum from embedded modules & lessons, masking video_url if user not enrolled
        const rawModules = Array.isArray(course.modules) ? course.modules : [];
        const curriculum = rawModules.map((m) => {
            const rawLessons = Array.isArray(m.lessons) ? m.lessons : [];
            const moduleLessons = rawLessons.map((l) => ({
                id: l.id,
                title: l.title,
                description: l.description,
                video_duration: l.video_duration || '10:00',
                is_preview: Boolean(l.is_preview),
                media_type: l.media_type || 'url',
                media_name: l.media_name || '',
                media_size: l.media_size || '',
                video_url: (isEnrolled || l.is_preview) ? l.video_url : null,
                resources: isEnrolled ? (Array.isArray(l.resources) ? l.resources : []) : [],
                has_quiz: (Array.isArray(l.quizzes) ? l.quizzes.length : 0) > 0
            }));
            return {
                id: m.id,
                title: m.title,
                description: m.description,
                order_num: m.order_num,
                lessons: moduleLessons
            };
        });
        // Related courses in same category
        const related = await index_js_1.CourseModel.find({
            category_id: course.category_id,
            id: { $ne: course.id },
            status: 'published'
        })
            .limit(3)
            .select('id title slug thumbnail price discount_price difficulty_level duration rating review_count instructor_id')
            .lean();
        const relatedFormatted = await Promise.all(related.map(async (r) => {
            const rInst = r.instructor_id ? await index_js_1.InstructorModel.findOne({ id: r.instructor_id }).lean() : null;
            return {
                ...r,
                instructor_name: rInst?.name || 'TradeX Academy'
            };
        }));
        // Reviews for this course
        const reviews = await index_js_1.ReviewModel.find({
            course_id: course.id,
            status: 'approved'
        })
            .sort({ created_at: -1 })
            .limit(10)
            .lean();
        const reviewsFormatted = await Promise.all(reviews.map(async (rev) => {
            const u = await index_js_1.UserModel.findOne({ id: rev.user_id }).select('name avatar').lean();
            return {
                id: rev.id,
                rating: rev.rating,
                review_text: rev.review_text,
                created_at: rev.created_at,
                student_name: u?.name || 'Student',
                student_avatar: u?.avatar || ''
            };
        }));
        const originalPrice = Number(course.price || 0);
        const currentPrice = course.discount_price != null ? Number(course.discount_price) : originalPrice;
        const discountPercent = originalPrice > 0 && currentPrice < originalPrice
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;
        res.json({
            success: true,
            course: {
                ...course,
                category_name: cat?.name || '',
                category_slug: cat?.slug || '',
                instructor_name: inst?.name || 'TradeX Academy',
                instructor_avatar: inst?.avatar || '',
                instructor_title: inst?.title || '',
                instructor_bio: inst?.bio || '',
                instructor_rating: inst?.rating || 4.9,
                instructor_students: inst?.students_count || 0,
                instructor_courses: inst?.courses_count || 0,
                instructor_social: typeof inst?.social_links === 'string' ? JSON.parse(inst.social_links) : (inst?.social_links || {}),
                price: originalPrice,
                discount_price: course.discount_price != null ? currentPrice : null,
                discount_percentage: discountPercent,
                learning_outcomes: Array.isArray(course.learning_outcomes) ? course.learning_outcomes : [],
                requirements: Array.isArray(course.requirements) ? course.requirements : [],
                target_audience: Array.isArray(course.target_audience) ? course.target_audience : [],
                tags: Array.isArray(course.tags) ? course.tags : [],
                is_enrolled: isEnrolled,
                enrollment: enrollmentData,
                is_wishlisted: isWishlisted,
                curriculum,
                related_courses: relatedFormatted,
                reviews: reviewsFormatted
            }
        });
    }
    catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch course details.' });
    }
});
// Enrolled Learning Player Endpoint
router.get('/:id/learn', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check enrollment or admin
        let enrollment = await index_js_1.EnrollmentModel.findOne({
            user_id: userId,
            course_id: id,
            status: { $ne: 'revoked' }
        }).lean();
        if (!enrollment && req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'You must be enrolled in this course to access the player.' });
            return;
        }
        const course = await index_js_1.CourseModel.findOne({ id }).lean();
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        const inst = course.instructor_id ? await index_js_1.InstructorModel.findOne({ id: course.instructor_id }).lean() : null;
        // User's completed lessons
        const completedProgress = await index_js_1.LessonProgressModel.find({
            user_id: userId,
            course_id: id,
            completed: 1
        }).lean();
        const completedLessonIds = new Set(completedProgress.map((p) => p.lesson_id));
        // User's notes for this course
        const notes = await index_js_1.NoteModel.find({ user_id: userId, course_id: id }).lean();
        const notesMap = {};
        notes.forEach((n) => {
            notesMap[n.lesson_id] = n.content;
        });
        const rawModules = Array.isArray(course.modules) ? course.modules : [];
        const allLessons = [];
        const curriculum = rawModules.map((m) => {
            const rawLessons = Array.isArray(m.lessons) ? m.lessons : [];
            const moduleLessons = rawLessons.map((l) => {
                allLessons.push(l);
                return {
                    id: l.id,
                    module_id: m.id,
                    title: l.title,
                    description: l.description,
                    video_url: l.video_url,
                    media_type: l.media_type || 'url',
                    media_name: l.media_name || '',
                    media_size: l.media_size || '',
                    video_duration: l.video_duration || '10:00',
                    is_preview: Boolean(l.is_preview),
                    resources: Array.isArray(l.resources) ? l.resources : [],
                    quizzes: Array.isArray(l.quizzes) ? l.quizzes : [],
                    is_completed: completedLessonIds.has(l.id),
                    note: notesMap[l.id] || ''
                };
            });
            return {
                id: m.id,
                title: m.title,
                description: m.description,
                order_num: m.order_num,
                lessons: moduleLessons
            };
        });
        // Check certificate if completed
        const certificate = await index_js_1.CertificateModel.findOne({ user_id: userId, course_id: id }).lean();
        res.json({
            success: true,
            course: {
                id: course.id,
                title: course.title,
                slug: course.slug,
                thumbnail: course.thumbnail,
                duration: course.duration,
                instructor_name: inst?.name || 'TradeX Academy',
                instructor_avatar: inst?.avatar || ''
            },
            enrollment: enrollment || {
                progress_percent: 0,
                status: 'active',
                last_lesson_id: allLessons[0]?.id || null
            },
            completed_lesson_ids: Array.from(completedLessonIds),
            certificate: certificate ? { certificate_code: certificate.certificate_code, issued_at: certificate.issued_at } : null,
            curriculum
        });
    }
    catch (error) {
        console.error('Error fetching learning player data:', error);
        res.status(500).json({ success: false, message: 'Failed to load course player.' });
    }
});
exports.default = router;
