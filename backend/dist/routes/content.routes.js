"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_js_1 = require("../db/database.js");
const router = (0, express_1.Router)();
// Public CMS Content for Landing Page
router.get('/', async (_req, res) => {
    try {
        const rows = (0, database_js_1.query)('SELECT key, value FROM site_content');
        const content = {};
        rows.forEach(r => {
            try {
                content[r.key] = JSON.parse(r.value);
            }
            catch {
                content[r.key] = r.value;
            }
        });
        // Also get live platform counts
        const totalStudents = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM users WHERE role = 'student'")?.count || 45000;
        const totalCourses = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM courses WHERE status = 'published'")?.count || 12;
        const totalEnrollments = (0, database_js_1.queryOne)("SELECT COUNT(*) as count FROM enrollments WHERE status != 'revoked'")?.count || 12800;
        res.json({
            success: true,
            content,
            live_stats: {
                total_students: Number(totalStudents),
                total_courses: Number(totalCourses),
                total_enrollments: Number(totalEnrollments)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch site content.' });
    }
});
exports.default = router;
