import { Router, Response } from 'express';
import { CategoryModel, CourseModel } from '../models/index.js';

const router = Router();

// List All Categories with live active course counts
router.get('/', async (_req, res: Response) => {
  try {
    const categories = await CategoryModel.find().sort({ order_num: 1 }).lean();

    const categoriesWithCount = await Promise.all(
      categories.map(async (c: any) => {
        const course_count = await CourseModel.countDocuments({ category_id: c.id, status: 'published' });
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          icon: c.icon || '',
          order_num: Number(c.order_num || 0),
          course_count
        };
      })
    );

    res.json({ success: true, categories: categoriesWithCount });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

export default router;
