"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_js_1 = require("../db/database.js");
const router = (0, express_1.Router)();
// List All Categories with live active course counts
router.get('/', async (_req, res) => {
    try {
        const categories = (0, database_js_1.query)(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.icon, c.order_num,
        (SELECT COUNT(*) FROM courses cr WHERE cr.category_id = c.id AND cr.status = 'published') as course_count
      FROM categories c
      ORDER BY c.order_num ASC
    `);
        res.json({ success: true, categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
});
exports.default = router;
