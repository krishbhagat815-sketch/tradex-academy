"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../models/index.js");
const router = (0, express_1.Router)();
// Verify & View Certificate by unique code
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const cert = await index_js_1.CertificateModel.findOne({
            certificate_code: { $regex: new RegExp(`^${code.trim()}$`, 'i') }
        }).lean();
        if (!cert) {
            res.status(404).json({ success: false, message: 'Certificate not found or invalid.' });
            return;
        }
        const course = await index_js_1.CourseModel.findOne({ id: cert.course_id }).lean();
        const user = await index_js_1.UserModel.findOne({ id: cert.user_id }).lean();
        res.json({
            success: true,
            certificate: {
                ...cert,
                course_thumbnail: course?.thumbnail || '',
                course_duration: course?.duration || '',
                student_avatar: user?.avatar || ''
            }
        });
    }
    catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify certificate.' });
    }
});
exports.default = router;
