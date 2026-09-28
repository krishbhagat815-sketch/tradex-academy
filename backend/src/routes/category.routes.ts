import { Router, Response } from 'express';
import { query } from '../db/database.js';

const router = Router();

// List All Categories with live active course counts
router.get('/', async (_req, res: Response) => {
  try {
    const categories = query(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.icon, c.order_num,
        (SELECT COUNT(*) FROM courses cr WHERE cr.category_id = c.id AND cr.status = 'published') as course_count
      FROM categories c
      ORDER BY c.order_num ASC
    `);

    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

export default router;
