"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_js_1 = require("../db/database.js");
const auth_js_1 = require("../middleware/auth.js");
const index_js_1 = require("../models/index.js");
const mongodb_js_1 = require("../db/mongodb.js");
const router = (0, express_1.Router)();
// Protect all admin routes
router.use(auth_js_1.authenticateToken, auth_js_1.requireAdmin);
// ==========================================
// 1. DASHBOARD OVERVIEW & ANALYTICS
// ==========================================
router.get('/stats', async (_req, res) => {
    try {
        const totalCourses = (0, database_js_1.queryOne)('SELECT COUNT(*) as count FROM courses')?.count || 0;
        const publishedCourses = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM courses WHERE status = 'published'")?.count || 0;
        const draftCourses = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM courses WHERE status = 'draft'")?.count || 0;
        const totalStudents = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM users WHERE role = 'student'")?.count || 0;
        const totalEnrollments = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM enrollments WHERE status != 'revoked'")?.count || 0;
        const completedEnrollments = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM enrollments WHERE status = 'completed'")?.count || 0;
        const totalRevenueRow = (0, database_js_1.queryOne)("SELECT SUM(amount) as sum FROM orders WHERE payment_status = 'completed'");
        const totalRevenue = Number(totalRevenueRow?.sum || 0);
        const pendingOrdersRow = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending'");
        const pendingOrders = Number(pendingOrdersRow?.count || 0);
        // Sales by Category
        const salesByCategory = (0, database_js_1.query)(`
      SELECT 
        cat.name as category_name,
        COUNT(o.id) as sales_count,
        COALESCE(SUM(o.amount), 0) as revenue
      FROM categories cat
      JOIN courses c ON c.category_id = cat.id
      LEFT JOIN orders o ON o.course_id = c.id AND o.payment_status = 'completed'
      GROUP BY cat.id, cat.name
      ORDER BY revenue DESC
    `);
        // Top Selling Courses
        const topCourses = (0, database_js_1.query)(`
      SELECT 
        c.id, c.title, c.thumbnail, c.price, c.discount_price,
        c.enrolled_count, c.rating,
        COALESCE(SUM(o.amount), 0) as total_revenue
      FROM courses c
      LEFT JOIN orders o ON o.course_id = c.id AND o.payment_status = 'completed'
      GROUP BY c.id
      ORDER BY total_revenue DESC, c.enrolled_count DESC
      LIMIT 5
    `);
        // Recent 5 Orders
        const recentOrders = (0, database_js_1.query)(`
      SELECT 
        o.id, o.order_number, o.amount, o.discount_amount, o.payment_method,
        o.payment_status, o.created_at,
        u.name as student_name, u.email as student_email,
        c.title as course_title
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN courses c ON o.course_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);
        // Recent 5 Enrollments
        const recentEnrollments = (0, database_js_1.query)(`
      SELECT 
        e.id, e.enrolled_at, e.progress_percent, e.status,
        u.name as student_name, u.email as student_email, u.avatar as student_avatar,
        c.title as course_title
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrolled_at DESC
      LIMIT 6
    `);
        // Real Counseling Bookings Metrics
        const totalBookings = (0, database_js_1.queryOne)('SELECT COUNT(*) as count FROM counseling_bookings')?.count || 0;
        const pendingBookings = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM counseling_bookings WHERE status = 'pending'")?.count || 0;
        const confirmedBookings = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM counseling_bookings WHERE status = 'confirmed'")?.count || 0;
        const completedBookings = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM counseling_bookings WHERE status = 'completed'")?.count || 0;
        // Recent 6 Counseling Bookings
        const recentBookings = (0, database_js_1.query)(`
      SELECT * FROM counseling_bookings
      ORDER BY created_at DESC
      LIMIT 6
    `);
        // Dynamic Monthly Revenue Trend from Real Orders
        const dbMonthly = (0, database_js_1.query)(`
      SELECT 
        substr(created_at, 1, 7) as month_key,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(id) as orders_count
      FROM orders
      WHERE payment_status = 'completed'
      GROUP BY month_key
      ORDER BY month_key ASC
    `);
        let revenueTrend = [];
        if (dbMonthly && dbMonthly.length > 0) {
            revenueTrend = dbMonthly.map((m) => {
                const dateObj = new Date(m.month_key + '-01');
                const monthName = isNaN(dateObj.getTime()) ? m.month_key : dateObj.toLocaleString('default', { month: 'short' });
                return {
                    month: monthName,
                    revenue: Math.round(Number(m.revenue)),
                    enrollments: Number(m.orders_count)
                };
            });
        }
        else {
            // Dynamic baseline reflecting actual database values
            const currentMonth = new Date().toLocaleString('default', { month: 'short' });
            revenueTrend = [
                { month: 'Last Month', revenue: Math.round(totalRevenue * 0.4), enrollments: Math.max(1, Math.round(Number(totalEnrollments) * 0.4)) },
                { month: currentMonth, revenue: Math.round(totalRevenue), enrollments: Number(totalEnrollments) }
            ];
        }
        res.json({
            success: true,
            stats: {
                totalCourses: Number(totalCourses),
                publishedCourses: Number(publishedCourses),
                draftCourses: Number(draftCourses),
                totalStudents: Number(totalStudents),
                totalEnrollments: Number(totalEnrollments),
                completedEnrollments: Number(completedEnrollments),
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                pendingOrders: Number(pendingOrders),
                totalBookings: Number(totalBookings),
                pendingBookings: Number(pendingBookings),
                confirmedBookings: Number(confirmedBookings),
                completedBookings: Number(completedBookings)
            },
            dbHealth: {
                sqlite: 'connected',
                mongodb: (0, mongodb_js_1.isMongoConnected)() ? 'connected (Atlas)' : 'fallback'
            },
            revenueTrend,
            salesByCategory,
            topCourses,
            recentOrders,
            recentEnrollments,
            recentBookings
        });
    }
    catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
    }
});
// ==========================================
// 2. COURSE MANAGEMENT (CRUD)
// ==========================================
router.get('/courses', async (_req, res) => {
    try {
        const courses = (0, database_js_1.query)(`
      SELECT 
        c.*,
        cat.name as category_name,
        inst.name as instructor_name,
        (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as module_count,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as lesson_count,
        COALESCE((SELECT SUM(o.amount) FROM orders o WHERE o.course_id = c.id AND o.payment_status = 'completed'), 0) as total_revenue
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      ORDER BY c.created_at DESC
    `);
        const formatted = courses.map(c => ({
            ...c,
            price: Number(c.price),
            discount_price: c.discount_price != null ? Number(c.discount_price) : null,
            learning_outcomes: JSON.parse(c.learning_outcomes || '[]'),
            requirements: JSON.parse(c.requirements || '[]'),
            target_audience: JSON.parse(c.target_audience || '[]'),
            tags: JSON.parse(c.tags || '[]'),
            module_count: Number(c.module_count || 0),
            lesson_count: Number(c.lesson_count || 0),
            total_revenue: Math.round(Number(c.total_revenue || 0) * 100) / 100
        }));
        res.json({ success: true, courses: formatted });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
    }
});
// Single course full details for editing (including modules and lessons)
router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const course = (0, database_js_1.queryOne)('SELECT * FROM courses WHERE id = ?', [id]);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        const modules = (0, database_js_1.query)(`
      SELECT * FROM modules WHERE course_id = ? ORDER BY order_num ASC
    `, [id]);
        const lessons = (0, database_js_1.query)(`
      SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num ASC
    `, [id]);
        const curriculum = modules.map(m => ({
            ...m,
            lessons: lessons
                .filter(l => l.module_id === m.id)
                .map(l => ({
                ...l,
                resources: JSON.parse(l.resources || '[]'),
                quizzes: JSON.parse(l.quizzes || '[]')
            }))
        }));
        res.json({
            success: true,
            course: {
                ...course,
                price: Number(course.price),
                discount_price: course.discount_price != null ? Number(course.discount_price) : null,
                learning_outcomes: JSON.parse(course.learning_outcomes || '[]'),
                requirements: JSON.parse(course.requirements || '[]'),
                target_audience: JSON.parse(course.target_audience || '[]'),
                tags: JSON.parse(course.tags || '[]'),
                curriculum
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch course.' });
    }
});
// Create Course
router.post('/courses', async (req, res) => {
    try {
        const { title, slug, short_description, description, category_id, instructor_id, thumbnail, preview_video_url, price, discount_price, difficulty_level = 'Beginner', duration = '10 hours', language = 'English', learning_outcomes = [], requirements = [], target_audience = [], tags = [], status = 'draft', featured = 0, popular = 0, is_new = 1 } = req.body;
        if (!title) {
            res.status(400).json({ success: false, message: 'Course title is required.' });
            return;
        }
        const courseId = `crs-${(0, uuid_1.v4)().slice(0, 8)}`;
        const courseSlug = slug
            ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      INSERT INTO courses (
        id, title, slug, short_description, description, category_id, instructor_id,
        thumbnail, preview_video_url, price, discount_price, difficulty_level, duration,
        language, learning_outcomes, requirements, target_audience, tags, status,
        featured, popular, is_new, enrolled_count, rating, review_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 5.0, 0, ?, ?)
    `, [
            courseId, title.trim(), courseSlug, short_description || '', description || '',
            category_id || null, instructor_id || null,
            thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
            preview_video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            Number(price || 0), discount_price != null && discount_price !== '' ? Number(discount_price) : null,
            difficulty_level, duration, language,
            JSON.stringify(Array.isArray(learning_outcomes) ? learning_outcomes : []),
            JSON.stringify(Array.isArray(requirements) ? requirements : []),
            JSON.stringify(Array.isArray(target_audience) ? target_audience : []),
            JSON.stringify(Array.isArray(tags) ? tags : []),
            status, Number(featured ? 1 : 0), Number(popular ? 1 : 0), Number(is_new ? 1 : 0),
            now, now
        ]);
        res.status(201).json({
            success: true,
            message: 'Course created successfully.',
            courseId
        });
    }
    catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ success: false, message: 'Failed to create course.' });
    }
});
// Update Course
router.put('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, short_description, description, category_id, instructor_id, thumbnail, preview_video_url, price, discount_price, difficulty_level, duration, language, learning_outcomes, requirements, target_audience, tags, status, featured, popular, is_new } = req.body;
        const course = (0, database_js_1.queryOne)('SELECT id FROM courses WHERE id = ?', [id]);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      UPDATE courses
      SET title = COALESCE(?, title),
          slug = COALESCE(?, slug),
          short_description = COALESCE(?, short_description),
          description = COALESCE(?, description),
          category_id = COALESCE(?, category_id),
          instructor_id = COALESCE(?, instructor_id),
          thumbnail = COALESCE(?, thumbnail),
          preview_video_url = COALESCE(?, preview_video_url),
          price = COALESCE(?, price),
          discount_price = ?,
          difficulty_level = COALESCE(?, difficulty_level),
          duration = COALESCE(?, duration),
          language = COALESCE(?, language),
          learning_outcomes = COALESCE(?, learning_outcomes),
          requirements = COALESCE(?, requirements),
          target_audience = COALESCE(?, target_audience),
          tags = COALESCE(?, tags),
          status = COALESCE(?, status),
          featured = COALESCE(?, featured),
          popular = COALESCE(?, popular),
          is_new = COALESCE(?, is_new),
          updated_at = ?
      WHERE id = ?
    `, [
            title ? title.trim() : null,
            slug ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : null,
            short_description,
            description,
            category_id,
            instructor_id,
            thumbnail,
            preview_video_url,
            price !== undefined ? Number(price) : null,
            discount_price !== undefined && discount_price !== '' && discount_price !== null ? Number(discount_price) : null,
            difficulty_level,
            duration,
            language,
            learning_outcomes ? JSON.stringify(learning_outcomes) : null,
            requirements ? JSON.stringify(requirements) : null,
            target_audience ? JSON.stringify(target_audience) : null,
            tags ? JSON.stringify(tags) : null,
            status,
            featured !== undefined ? Number(featured ? 1 : 0) : null,
            popular !== undefined ? Number(popular ? 1 : 0) : null,
            is_new !== undefined ? Number(is_new ? 1 : 0) : null,
            now,
            id
        ]);
        res.json({ success: true, message: 'Course updated successfully.' });
    }
    catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ success: false, message: 'Failed to update course.' });
    }
});
// Delete Course
router.delete('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        (0, database_js_1.execute)('DELETE FROM lessons WHERE course_id = ?', [id]);
        (0, database_js_1.execute)('DELETE FROM modules WHERE course_id = ?', [id]);
        (0, database_js_1.execute)('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ success: true, message: 'Course and curriculum deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete course.' });
    }
});
// ==========================================
// 3. CURRICULUM: MODULES & LESSONS
// ==========================================
router.post('/courses/:id/modules', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        if (!title) {
            res.status(400).json({ success: false, message: 'Module title is required.' });
            return;
        }
        const countRow = (0, database_js_1.queryOne)('SELECT COUNT(*) as count FROM modules WHERE course_id = ?', [id]);
        const nextOrder = Number(countRow?.count || 0) + 1;
        const moduleId = `mod-${(0, uuid_1.v4)().slice(0, 8)}`;
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      INSERT INTO modules (id, course_id, title, description, order_num, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [moduleId, id, title.trim(), description || '', nextOrder, now]);
        res.status(201).json({
            success: true,
            message: 'Module added successfully.',
            module: { id: moduleId, course_id: id, title: title.trim(), description: description || '', order_num: nextOrder }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add module.' });
    }
});
router.put('/modules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, order_num } = req.body;
        (0, database_js_1.execute)(`
      UPDATE modules
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          order_num = COALESCE(?, order_num)
      WHERE id = ?
    `, [title, description, order_num, id]);
        res.json({ success: true, message: 'Module updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update module.' });
    }
});
router.delete('/modules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        (0, database_js_1.execute)('DELETE FROM lessons WHERE module_id = ?', [id]);
        (0, database_js_1.execute)('DELETE FROM modules WHERE id = ?', [id]);
        res.json({ success: true, message: 'Module and its lessons deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete module.' });
    }
});
router.post('/modules/:moduleId/lessons', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, description, video_url, media_type = 'url', media_name, media_size, video_duration = '12:00', is_preview = 0, resources = [], quizzes = [] } = req.body;
        if (!title) {
            res.status(400).json({ success: false, message: 'Lesson title is required.' });
            return;
        }
        const mod = (0, database_js_1.queryOne)('SELECT course_id FROM modules WHERE id = ?', [moduleId]);
        if (!mod) {
            res.status(404).json({ success: false, message: 'Module not found.' });
            return;
        }
        const countRow = (0, database_js_1.queryOne)('SELECT COUNT(*) as count FROM lessons WHERE module_id = ?', [moduleId]);
        const nextOrder = Number(countRow?.count || 0) + 1;
        const lessonId = `lsn-${(0, uuid_1.v4)().slice(0, 8)}`;
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      INSERT INTO lessons (
        id, module_id, course_id, title, description, video_url, media_type, media_name, media_size,
        video_duration, is_preview, order_num, resources, quizzes, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            lessonId, moduleId, mod.course_id, title.trim(), description || '',
            video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            media_type || 'url', media_name || null, media_size || null,
            video_duration || '10:00', Number(is_preview ? 1 : 0), nextOrder,
            JSON.stringify(resources || []), JSON.stringify(quizzes || []), now
        ]);
        if (mod.course_id) {
            await (0, mongodb_js_1.syncSingleCourseToMongo)(mod.course_id);
        }
        res.status(201).json({
            success: true,
            message: 'Lesson added successfully.',
            lessonId
        });
    }
    catch (error) {
        console.error('Create lesson error:', error);
        res.status(500).json({ success: false, message: error?.message || 'Failed to create lesson.' });
    }
});
router.put('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, video_url, media_type, media_name, media_size, video_duration, is_preview, order_num, resources, quizzes } = req.body;
        (0, database_js_1.execute)(`
      UPDATE lessons
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          video_url = COALESCE(?, video_url),
          media_type = COALESCE(?, media_type),
          media_name = COALESCE(?, media_name),
          media_size = COALESCE(?, media_size),
          video_duration = COALESCE(?, video_duration),
          is_preview = COALESCE(?, is_preview),
          order_num = COALESCE(?, order_num),
          resources = COALESCE(?, resources),
          quizzes = COALESCE(?, quizzes)
      WHERE id = ?
    `, [
            title !== undefined ? title : null,
            description !== undefined ? description : null,
            video_url !== undefined ? video_url : null,
            media_type !== undefined ? media_type : null,
            media_name !== undefined ? media_name : null,
            media_size !== undefined ? media_size : null,
            video_duration !== undefined ? video_duration : null,
            is_preview !== undefined ? Number(is_preview ? 1 : 0) : null,
            order_num !== undefined ? order_num : null,
            resources ? JSON.stringify(resources) : null,
            quizzes ? JSON.stringify(quizzes) : null,
            id
        ]);
        const lessonRow = (0, database_js_1.queryOne)('SELECT course_id FROM lessons WHERE id = ?', [id]);
        if (lessonRow?.course_id) {
            await (0, mongodb_js_1.syncSingleCourseToMongo)(lessonRow.course_id);
        }
        res.json({ success: true, message: 'Lesson updated successfully.' });
    }
    catch (error) {
        console.error('Update lesson error:', error);
        res.status(500).json({ success: false, message: error?.message || 'Failed to update lesson.' });
    }
});
router.delete('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lessonRow = (0, database_js_1.queryOne)('SELECT course_id FROM lessons WHERE id = ?', [id]);
        (0, database_js_1.execute)('DELETE FROM lessons WHERE id = ?', [id]);
        if (lessonRow?.course_id) {
            await (0, mongodb_js_1.syncSingleCourseToMongo)(lessonRow.course_id);
        }
        res.json({ success: true, message: 'Lesson deleted.' });
    }
    catch (error) {
        console.error('Delete lesson error:', error);
        res.status(500).json({ success: false, message: error?.message || 'Failed to delete lesson.' });
    }
});
// ==========================================
// 4. ENROLLMENTS MANAGEMENT
// ==========================================
router.get('/enrollments', async (req, res) => {
    try {
        const { search, courseId } = req.query;
        let sql = `
      SELECT 
        e.id, e.user_id, e.course_id, e.enrolled_at, e.progress_percent,
        e.completed_at, e.status,
        u.name as student_name, u.email as student_email, u.avatar as student_avatar,
        c.title as course_title, c.thumbnail as course_thumbnail
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `;
        const params = [];
        if (search) {
            sql += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(c.title) LIKE ?)`;
            const term = `%${String(search).toLowerCase().trim()}%`;
            params.push(term, term, term);
        }
        if (courseId) {
            sql += ` AND e.course_id = ?`;
            params.push(courseId);
        }
        sql += ` ORDER BY e.enrolled_at DESC`;
        const enrollments = (0, database_js_1.query)(sql, params).map(e => ({
            ...e,
            progress_percent: Math.min(100, Math.round(Number(e.progress_percent || 0)))
        }));
        res.json({ success: true, enrollments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch enrollments.' });
    }
});
// Manual Enrollment by Admin
router.post('/enrollments/manual', async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        if (!userId || !courseId) {
            res.status(400).json({ success: false, message: 'Student and Course are required.' });
            return;
        }
        const existing = (0, database_js_1.queryOne)('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
        if (existing) {
            (0, database_js_1.execute)("UPDATE enrollments SET status = 'active' WHERE id = ?", [existing.id]);
            res.json({ success: true, message: 'Enrollment reactivated.' });
            return;
        }
        const enrollmentId = `enr-${(0, uuid_1.v4)().slice(0, 8)}`;
        const now = new Date().toISOString();
        const firstLesson = (0, database_js_1.queryOne)(`
      SELECT l.id FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE l.course_id = ?
      ORDER BY m.order_num ASC, l.order_num ASC
      LIMIT 1
    `, [courseId]);
        (0, database_js_1.execute)(`
      INSERT INTO enrollments (id, user_id, course_id, enrolled_at, progress_percent, last_lesson_id, status)
      VALUES (?, ?, ?, ?, 0, ?, 'active')
    `, [enrollmentId, userId, courseId, now, firstLesson?.id || null]);
        (0, database_js_1.execute)('UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?', [courseId]);
        res.status(201).json({ success: true, message: 'Student enrolled manually successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to manually enroll student.' });
    }
});
// Revoke or Permanently Delete Enrollment
router.delete('/enrollments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent } = req.query;
        if (permanent === 'true') {
            const existing = (0, database_js_1.queryOne)('SELECT course_id FROM enrollments WHERE id = ?', [id]);
            (0, database_js_1.execute)('DELETE FROM enrollments WHERE id = ?', [id]);
            if (existing?.course_id) {
                (0, database_js_1.execute)('UPDATE courses SET enrolled_count = MAX(0, enrolled_count - 1) WHERE id = ?', [existing.course_id]);
            }
            if ((0, mongodb_js_1.isMongoConnected)()) {
                await index_js_1.EnrollmentModel.deleteOne({ id }).catch(() => { });
            }
            res.json({ success: true, message: 'Enrollment removed completely.' });
            return;
        }
        (0, database_js_1.execute)("UPDATE enrollments SET status = 'revoked' WHERE id = ?", [id]);
        if ((0, mongodb_js_1.isMongoConnected)()) {
            await index_js_1.EnrollmentModel.findOneAndUpdate({ id }, { status: 'revoked' }).catch(() => { });
        }
        res.json({ success: true, message: 'Enrollment revoked successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to revoke enrollment.' });
    }
});
// Update Enrollment (e.g. Reactivate, Mark Completed, Update Progress)
router.put('/enrollments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progress_percent } = req.body;
        const existing = (0, database_js_1.queryOne)('SELECT * FROM enrollments WHERE id = ?', [id]);
        if (!existing) {
            res.status(404).json({ success: false, message: 'Enrollment not found.' });
            return;
        }
        const newStatus = status || existing.status;
        const newProgress = progress_percent !== undefined
            ? Math.min(100, Math.max(0, Number(progress_percent)))
            : Math.min(100, Math.max(0, Number(existing.progress_percent || 0)));
        const completedAt = newStatus === 'completed'
            ? (existing.completed_at || new Date().toISOString())
            : (newStatus !== 'completed' ? null : existing.completed_at);
        (0, database_js_1.execute)(`
      UPDATE enrollments
      SET status = ?,
          progress_percent = ?,
          completed_at = ?
      WHERE id = ?
    `, [newStatus, newProgress, completedAt, id]);
        if ((0, mongodb_js_1.isMongoConnected)()) {
            await index_js_1.EnrollmentModel.findOneAndUpdate({ id }, { status: newStatus, progress_percent: newProgress, completed_at: completedAt }).catch(() => { });
        }
        res.json({
            success: true,
            message: `Enrollment updated to ${newStatus}.`,
            enrollment: {
                id,
                status: newStatus,
                progress_percent: newProgress,
                completed_at: completedAt
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update enrollment.' });
    }
});
// ==========================================
// 5. ORDERS & TRANSACTIONS MANAGEMENT
// ==========================================
router.get('/orders', async (req, res) => {
    try {
        const { search, status } = req.query;
        let sql = `
      SELECT 
        o.*,
        u.name as student_name, u.email as student_email,
        c.title as course_title, c.thumbnail as course_thumbnail
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN courses c ON o.course_id = c.id
      WHERE 1=1
    `;
        const params = [];
        if (search) {
            sql += ` AND (LOWER(o.order_number) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)`;
            const term = `%${String(search).toLowerCase().trim()}%`;
            params.push(term, term, term);
        }
        if (status && status !== 'all') {
            sql += ` AND o.payment_status = ?`;
            params.push(status);
        }
        sql += ` ORDER BY o.created_at DESC`;
        const orders = (0, database_js_1.query)(sql, params).map(o => ({
            ...o,
            billing_info: JSON.parse(o.billing_info || '{}')
        }));
        res.json({ success: true, orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
});
// Refund Order
router.post('/orders/:id/refund', async (req, res) => {
    try {
        const { id } = req.params;
        const order = (0, database_js_1.queryOne)('SELECT user_id, course_id FROM orders WHERE id = ?', [id]);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found.' });
            return;
        }
        (0, database_js_1.execute)("UPDATE orders SET payment_status = 'refunded' WHERE id = ?", [id]);
        (0, database_js_1.execute)("UPDATE enrollments SET status = 'revoked' WHERE user_id = ? AND course_id = ?", [order.user_id, order.course_id]);
        res.json({ success: true, message: 'Order refunded and course access revoked.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to refund order.' });
    }
});
// ==========================================
// 6. COUPON MANAGEMENT
// ==========================================
router.get('/coupons', async (_req, res) => {
    try {
        const coupons = (0, database_js_1.query)('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json({ success: true, coupons });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
    }
});
router.post('/coupons', async (req, res) => {
    try {
        const { code, discount_type, discount_value, min_order_amount = 0, expires_at, usage_limit = 100 } = req.body;
        if (!code || !discount_value) {
            res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
            return;
        }
        const couponId = `cpn-${(0, uuid_1.v4)().slice(0, 8)}`;
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, expires_at, usage_limit, used_count, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?)
    `, [
            couponId, code.trim().toUpperCase(), discount_type || 'percent',
            Number(discount_value), Number(min_order_amount), expires_at || null,
            Number(usage_limit), now
        ]);
        res.status(201).json({ success: true, message: 'Coupon created successfully.', couponId });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create coupon.' });
    }
});
router.put('/coupons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active, discount_value, usage_limit, expires_at } = req.body;
        (0, database_js_1.execute)(`
      UPDATE coupons
      SET is_active = COALESCE(?, is_active),
          discount_value = COALESCE(?, discount_value),
          usage_limit = COALESCE(?, usage_limit),
          expires_at = COALESCE(?, expires_at)
      WHERE id = ?
    `, [is_active !== undefined ? Number(is_active ? 1 : 0) : null, discount_value, usage_limit, expires_at, id]);
        res.json({ success: true, message: 'Coupon updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update coupon.' });
    }
});
router.delete('/coupons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        (0, database_js_1.execute)('DELETE FROM coupons WHERE id = ?', [id]);
        res.json({ success: true, message: 'Coupon deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
    }
});
// ==========================================
// 7. REVIEWS MANAGEMENT
// ==========================================
router.get('/reviews', async (_req, res) => {
    try {
        const reviews = (0, database_js_1.query)(`
      SELECT 
        r.*,
        u.name as student_name, u.email as student_email, u.avatar as student_avatar,
        c.title as course_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN courses c ON r.course_id = c.id
      ORDER BY r.created_at DESC
    `);
        res.json({ success: true, reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
});
router.put('/reviews/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' | 'hidden'
        (0, database_js_1.execute)('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: `Review status changed to ${status}.` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update review status.' });
    }
});
router.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        (0, database_js_1.execute)('DELETE FROM reviews WHERE id = ?', [id]);
        res.json({ success: true, message: 'Review deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete review.' });
    }
});
// ==========================================
// 8. STUDENT & USER MANAGEMENT
// ==========================================
router.get('/students', async (req, res) => {
    try {
        const { search } = req.query;
        let sql = `
      SELECT 
        u.id, u.name, u.email, u.avatar, u.status, u.created_at,
        (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id AND e.status != 'revoked') as enrolled_count,
        COALESCE((SELECT SUM(o.amount) FROM orders o WHERE o.user_id = u.id AND o.payment_status = 'completed'), 0) as total_spent
      FROM users u
      WHERE u.role = 'student'
    `;
        const params = [];
        if (search) {
            sql += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)`;
            const term = `%${String(search).toLowerCase().trim()}%`;
            params.push(term, term);
        }
        sql += ` ORDER BY u.created_at DESC`;
        const students = (0, database_js_1.query)(sql, params).map(s => ({
            ...s,
            enrolled_count: Number(s.enrolled_count || 0),
            total_spent: Math.round(Number(s.total_spent || 0) * 100) / 100
        }));
        res.json({ success: true, students });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch students.' });
    }
});
// Get single student details with enrolled courses and orders
router.get('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const student = (0, database_js_1.queryOne)(`
      SELECT id, name, email, avatar, headline, bio, status, created_at, updated_at
      FROM users
      WHERE id = ? AND role = 'student'
    `, [id]);
        if (!student) {
            res.status(404).json({ success: false, message: 'Student not found.' });
            return;
        }
        const enrollments = (0, database_js_1.query)(`
      SELECT e.*, c.title as course_title, c.thumbnail as course_thumbnail
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `, [id]);
        const orders = (0, database_js_1.query)(`
      SELECT o.*, c.title as course_title
      FROM orders o
      JOIN courses c ON o.course_id = c.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [id]);
        res.json({
            success: true,
            student: {
                ...student,
                enrollments,
                orders
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
    }
});
// Update student profile and credentials
router.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, status, headline, bio, avatar } = req.body;
        const existing = (0, database_js_1.queryOne)('SELECT id, email, password, avatar FROM users WHERE id = ? AND role = "student"', [id]);
        if (!existing) {
            res.status(404).json({ success: false, message: 'Student not found.' });
            return;
        }
        if (!name || !email) {
            res.status(400).json({ success: false, message: 'Name and email are required.' });
            return;
        }
        // Check email uniqueness if email changed
        const emailConflict = (0, database_js_1.queryOne)('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?', [email.trim(), id]);
        if (emailConflict) {
            res.status(400).json({ success: false, message: 'This email is already in use by another user.' });
            return;
        }
        const now = new Date().toISOString();
        let newPasswordHash = existing.password;
        if (password && password.trim().length >= 6) {
            newPasswordHash = bcryptjs_1.default.hashSync(password.trim(), 10);
        }
        else if (password && password.trim().length > 0 && password.trim().length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
            return;
        }
        const newStatus = status === 'suspended' ? 'suspended' : 'active';
        const newAvatar = avatar !== undefined && avatar !== null && avatar.trim() !== '' ? avatar.trim() : existing.avatar;
        (0, database_js_1.execute)(`
      UPDATE users
      SET name = ?,
          email = ?,
          password = ?,
          status = ?,
          headline = COALESCE(?, headline),
          bio = COALESCE(?, bio),
          avatar = COALESCE(?, avatar),
          updated_at = ?
      WHERE id = ?
    `, [name.trim(), email.trim().toLowerCase(), newPasswordHash, newStatus, headline ?? '', bio ?? '', newAvatar, now, id]);
        // Dual-write to MongoDB if connected
        if ((0, mongodb_js_1.isMongoConnected)()) {
            const updateDoc = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                status: newStatus,
                updated_at: new Date()
            };
            if (password && password.trim().length >= 6) {
                updateDoc.password = newPasswordHash;
            }
            if (headline !== undefined)
                updateDoc.headline = headline;
            if (bio !== undefined)
                updateDoc.bio = bio;
            if (newAvatar !== undefined)
                updateDoc.avatar = newAvatar;
            await index_js_1.UserModel.findOneAndUpdate({ id }, updateDoc).catch(e => console.error('Mongo student update error:', e));
        }
        const updated = (0, database_js_1.queryOne)(`
      SELECT id, name, email, avatar, headline, bio, status, created_at, updated_at
      FROM users WHERE id = ?
    `, [id]);
        res.json({
            success: true,
            message: 'Student updated successfully.',
            student: updated
        });
    }
    catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ success: false, message: 'Failed to update student.' });
    }
});
router.put('/students/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' | 'suspended'
        (0, database_js_1.execute)('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        if ((0, mongodb_js_1.isMongoConnected)()) {
            await index_js_1.UserModel.findOneAndUpdate({ id }, { status }).catch(() => { });
        }
        res.json({ success: true, message: `Student status updated to ${status}.` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update student status.' });
    }
});
// ==========================================
// 9. INSTRUCTOR MANAGEMENT
// ==========================================
router.get('/instructors', async (_req, res) => {
    try {
        const instructors = (0, database_js_1.query)(`
      SELECT 
        i.*,
        (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = i.id) as courses_count,
        (SELECT COALESCE(SUM(c.enrolled_count), 0) FROM courses c WHERE c.instructor_id = i.id) as students_count
      FROM instructors i
      ORDER BY i.name ASC
    `);
        const formatted = instructors.map(inst => ({
            ...inst,
            social_links: JSON.parse(inst.social_links || '{}')
        }));
        res.json({ success: true, instructors: formatted });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch instructors.' });
    }
});
router.post('/instructors', async (req, res) => {
    try {
        const { name, email, avatar, title, bio, expertise, social_links } = req.body;
        if (!name || !email) {
            res.status(400).json({ success: false, message: 'Name and email are required.' });
            return;
        }
        const instId = `inst-${(0, uuid_1.v4)().slice(0, 8)}`;
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      INSERT INTO instructors (id, name, email, avatar, title, bio, expertise, rating, students_count, courses_count, social_links, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 0, 0, ?, ?)
    `, [
            instId, name.trim(), email.trim(),
            avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
            title || 'Course Instructor', bio || '', expertise || '',
            JSON.stringify(social_links || {}), now
        ]);
        res.status(201).json({ success: true, message: 'Instructor added successfully.', instId });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create instructor.' });
    }
});
router.put('/instructors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, avatar, title, bio, expertise, social_links } = req.body;
        (0, database_js_1.execute)(`
      UPDATE instructors
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          avatar = COALESCE(?, avatar),
          title = COALESCE(?, title),
          bio = COALESCE(?, bio),
          expertise = COALESCE(?, expertise),
          social_links = COALESCE(?, social_links)
      WHERE id = ?
    `, [name, email, avatar, title, bio, expertise, social_links ? JSON.stringify(social_links) : null, id]);
        res.json({ success: true, message: 'Instructor updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update instructor.' });
    }
});
router.delete('/instructors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        (0, database_js_1.execute)('DELETE FROM instructors WHERE id = ?', [id]);
        res.json({ success: true, message: 'Instructor deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete instructor.' });
    }
});
// ==========================================
// 10. CATEGORIES MANAGEMENT
// ==========================================
router.post('/categories', async (req, res) => {
    try {
        const { name, slug, description, icon = 'BookOpen' } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Category name is required.' });
            return;
        }
        const catId = `cat-${(0, uuid_1.v4)().slice(0, 8)}`;
        const catSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const countRow = (0, database_js_1.queryOne)('SELECT COUNT(*) as count FROM categories');
        const orderNum = Number(countRow?.count || 0) + 1;
        (0, database_js_1.execute)(`
      INSERT INTO categories (id, name, slug, description, icon, course_count, order_num)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `, [catId, name.trim(), catSlug, description || '', icon, orderNum]);
        res.status(201).json({ success: true, message: 'Category created successfully.', catId });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
});
router.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, icon } = req.body;
        (0, database_js_1.execute)(`
      UPDATE categories
      SET name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          description = COALESCE(?, description),
          icon = COALESCE(?, icon)
      WHERE id = ?
    `, [name, slug, description, icon, id]);
        res.json({ success: true, message: 'Category updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update category.' });
    }
});
router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        (0, database_js_1.execute)('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ success: true, message: 'Category deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete category.' });
    }
});
// ==========================================
// 11. CONTENT MANAGEMENT (CMS)
// ==========================================
router.get('/content', async (_req, res) => {
    try {
        const rows = (0, database_js_1.query)('SELECT key, value, updated_at FROM site_content');
        const content = {};
        rows.forEach(r => {
            try {
                content[r.key] = JSON.parse(r.value);
            }
            catch {
                content[r.key] = r.value;
            }
        });
        res.json({ success: true, content });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch CMS content.' });
    }
});
router.put('/content/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const value = req.body;
        const now = new Date().toISOString();
        const existing = (0, database_js_1.queryOne)('SELECT key FROM site_content WHERE key = ?', [key]);
        if (existing) {
            (0, database_js_1.execute)('UPDATE site_content SET value = ?, updated_at = ? WHERE key = ?', [
                JSON.stringify(value), now, key
            ]);
        }
        else {
            (0, database_js_1.execute)('INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)', [
                key, JSON.stringify(value), now
            ]);
        }
        res.json({ success: true, message: `Content section '${key}' updated successfully.` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update CMS content.' });
    }
});
// ==========================================
// 12. COUNSELING & MENTORSHIP BOOKINGS (CRUD)
// ==========================================
router.get('/bookings', async (req, res) => {
    try {
        const { status, search } = req.query;
        let sql = 'SELECT * FROM counseling_bookings WHERE 1=1';
        const params = [];
        if (status && status !== 'all') {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (search) {
            sql += ' AND (client_name LIKE ? OR client_email LIKE ? OR client_phone LIKE ? OR counseling_type LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }
        sql += ' ORDER BY created_at DESC';
        const bookings = (0, database_js_1.query)(sql, params);
        res.json({ success: true, bookings });
    }
    catch (error) {
        console.error('Admin get bookings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
    }
});
router.post('/bookings', async (req, res) => {
    try {
        const { client_name, client_email, client_phone, counseling_type, topic, preferred_date, preferred_time_slot, experience_level, notes, status, meeting_link, admin_notes } = req.body;
        if (!client_name || !client_email || !client_phone || !counseling_type || !preferred_date || !preferred_time_slot) {
            res.status(400).json({ success: false, message: 'Required fields missing for booking.' });
            return;
        }
        const bookingId = `bkg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      INSERT INTO counseling_bookings (
        id, user_id, client_name, client_email, client_phone,
        counseling_type, topic, preferred_date, preferred_time_slot,
        experience_level, notes, status, meeting_link, admin_notes,
        created_at, updated_at
      )
      VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            bookingId,
            client_name.trim(),
            client_email.trim().toLowerCase(),
            client_phone.trim(),
            counseling_type,
            topic || '',
            preferred_date,
            preferred_time_slot,
            experience_level || 'Beginner',
            notes || '',
            status || 'pending',
            meeting_link || '',
            admin_notes || '',
            now,
            now
        ]);
        if ((0, mongodb_js_1.isMongoConnected)()) {
            try {
                await index_js_1.CounselingBookingModel.create({
                    id: bookingId,
                    client_name: client_name.trim(),
                    client_email: client_email.trim().toLowerCase(),
                    client_phone: client_phone.trim(),
                    counseling_type,
                    topic: topic || '',
                    preferred_date,
                    preferred_time_slot,
                    experience_level: experience_level || 'Beginner',
                    notes: notes || '',
                    status: status || 'pending',
                    meeting_link: meeting_link || '',
                    admin_notes: admin_notes || '',
                    created_at: new Date(now),
                    updated_at: new Date(now)
                });
            }
            catch (e) {
                console.warn('Mongo booking create sync warning:', e);
            }
        }
        const createdBooking = (0, database_js_1.queryOne)('SELECT * FROM counseling_bookings WHERE id = ?', [bookingId]);
        res.status(201).json({ success: true, booking: createdBooking, message: 'Booking created successfully.' });
    }
    catch (error) {
        console.error('Admin create booking error:', error);
        res.status(500).json({ success: false, message: error?.message || 'Failed to create booking.' });
    }
});
router.put('/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, meeting_link, admin_notes, preferred_date, preferred_time_slot, notes, counseling_type } = req.body;
        const existing = (0, database_js_1.queryOne)('SELECT * FROM counseling_bookings WHERE id = ?', [id]);
        if (!existing) {
            res.status(404).json({ success: false, message: 'Booking not found.' });
            return;
        }
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      UPDATE counseling_bookings
      SET 
        status = COALESCE(?, status),
        meeting_link = COALESCE(?, meeting_link),
        admin_notes = COALESCE(?, admin_notes),
        preferred_date = COALESCE(?, preferred_date),
        preferred_time_slot = COALESCE(?, preferred_time_slot),
        notes = COALESCE(?, notes),
        counseling_type = COALESCE(?, counseling_type),
        updated_at = ?
      WHERE id = ?
    `, [
            status !== undefined ? status : null,
            meeting_link !== undefined ? meeting_link : null,
            admin_notes !== undefined ? admin_notes : null,
            preferred_date !== undefined ? preferred_date : null,
            preferred_time_slot !== undefined ? preferred_time_slot : null,
            notes !== undefined ? notes : null,
            counseling_type !== undefined ? counseling_type : null,
            now,
            id
        ]);
        if ((0, mongodb_js_1.isMongoConnected)()) {
            try {
                const updateData = { updated_at: new Date(now) };
                if (status !== undefined)
                    updateData.status = status;
                if (meeting_link !== undefined)
                    updateData.meeting_link = meeting_link;
                if (admin_notes !== undefined)
                    updateData.admin_notes = admin_notes;
                if (preferred_date !== undefined)
                    updateData.preferred_date = preferred_date;
                if (preferred_time_slot !== undefined)
                    updateData.preferred_time_slot = preferred_time_slot;
                if (notes !== undefined)
                    updateData.notes = notes;
                if (counseling_type !== undefined)
                    updateData.counseling_type = counseling_type;
                await index_js_1.CounselingBookingModel.updateOne({ id }, { $set: updateData });
            }
            catch (e) {
                console.warn('Mongo booking update sync warning:', e);
            }
        }
        const updatedBooking = (0, database_js_1.queryOne)('SELECT * FROM counseling_bookings WHERE id = ?', [id]);
        res.json({ success: true, booking: updatedBooking, message: 'Booking updated successfully.' });
    }
    catch (error) {
        console.error('Admin update booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to update booking.' });
    }
});
router.delete('/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        (0, database_js_1.execute)('DELETE FROM counseling_bookings WHERE id = ?', [id]);
        if ((0, mongodb_js_1.isMongoConnected)()) {
            try {
                await index_js_1.CounselingBookingModel.deleteOne({ id });
            }
            catch (e) {
                console.warn('Mongo booking delete sync warning:', e);
            }
        }
        res.json({ success: true, message: 'Booking removed successfully.' });
    }
    catch (error) {
        console.error('Admin delete booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete booking.' });
    }
});
exports.default = router;
