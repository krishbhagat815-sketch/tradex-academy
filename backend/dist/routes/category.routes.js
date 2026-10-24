"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../models/index.js");
const router = (0, express_1.Router)();
// List All Categories with live active course counts
router.get('/', async (_req, res) => {
    try {
        const categories = await index_js_1.CategoryModel.find().sort({ order_num: 1 }).lean();
        const categoriesWithCount = await Promise.all(categories.map(async (c) => {
            const course_count = await index_js_1.CourseModel.countDocuments({ category_id: c.id, status: 'published' });
            return {
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description || '',
                icon: c.icon || '',
                order_num: Number(c.order_num || 0),
                course_count
            };
        }));
        res.json({ success: true, categories: categoriesWithCount });
    }
    catch (error) {
        console.error('Fetch categories error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
});
exports.default = router;
