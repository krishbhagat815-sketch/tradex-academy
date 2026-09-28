"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_js_1 = require("../db/database.js");
const router = (0, express_1.Router)();
// Verify & View Certificate by unique code
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const cert = (0, database_js_1.queryOne)(`
      SELECT 
        c.*,
        crs.thumbnail as course_thumbnail, crs.duration as course_duration,
        u.avatar as student_avatar
      FROM certificates c
      JOIN courses crs ON c.course_id = crs.id
      JOIN users u ON c.user_id = u.id
      WHERE UPPER(c.certificate_code) = UPPER(?)
    `, [code.trim()]);
        if (!cert) {
            res.status(404).json({ success: false, message: 'Certificate not found or invalid.' });
            return;
        }
        res.json({
            success: true,
            certificate: cert
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify certificate.' });
    }
});
exports.default = router;
