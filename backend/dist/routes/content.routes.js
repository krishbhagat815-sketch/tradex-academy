"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../models/index.js");
const router = (0, express_1.Router)();
// Public CMS Content for Landing Page
router.get('/', async (_req, res) => {
    try {
        const rows = await index_js_1.SiteContentModel.find().lean();
        const content = {};
        rows.forEach((r) => {
            try {
                content[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
            }
            catch {
                content[r.key] = r.value;
            }
        });
        // Also get live platform counts
        const totalStudents = await index_js_1.UserModel.countDocuments({ role: 'student' }) || 45000;
        const totalCourses = await index_js_1.CourseModel.countDocuments({ status: 'published' }) || 12;
        const totalEnrollments = await index_js_1.EnrollmentModel.countDocuments({ status: { $ne: 'revoked' } }) || 12800;
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
        console.error('Fetch site content error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch site content.' });
    }
});
// Public Settings (including WhatsApp configuration)
router.get('/settings', async (_req, res) => {
    try {
        const row = await index_js_1.SiteContentModel.findOne({ key: 'settings' }).lean();
        let settings = {
            platformName: 'The Safe Trading Academy',
            supportEmail: 'support@tradex.com',
            supportPhone: '+91 7435961016',
            currencySymbol: '₹',
            whatsapp_enabled: true,
            whatsapp_number: '917435961016',
            whatsapp_default_message: 'Hello, I would like to know more about your courses.'
        };
        if (row?.value) {
            try {
                const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
                settings = { ...settings, ...parsed };
            }
            catch { }
        }
        res.json({ success: true, settings });
    }
    catch (error) {
        console.error('Fetch settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
    }
});
exports.default = router;
