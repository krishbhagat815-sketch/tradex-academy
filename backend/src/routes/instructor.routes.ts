import { Router, Response } from 'express';
import { query, queryOne } from '../db/database.js';

const router = Router();

// List Instructors
router.get('/', async (_req, res: Response) => {
  try {
    const instructors = query(`
      SELECT 
        i.*,
        (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = i.id AND c.status = 'published') as courses_count,
        (SELECT COALESCE(SUM(c.enrolled_count), 0) FROM courses c WHERE c.instructor_id = i.id) as students_count
      FROM instructors i
      ORDER BY i.rating DESC
    `);

    const formatted = instructors.map(inst => ({
      ...inst,
      social_links: JSON.parse(inst.social_links || '{}')
    }));

    res.json({ success: true, instructors: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch instructors.' });
  }
});

// Single Instructor with their courses
router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = queryOne(`
      SELECT * FROM instructors WHERE id = ?
    `, [id]);

    if (!instructor) {
      res.status(404).json({ success: false, message: 'Instructor not found.' });
      return;
    }

    const courses = query(`
      SELECT 
        c.id, c.title, c.slug, c.thumbnail, c.price, c.discount_price,
        c.difficulty_level, c.duration, c.rating, c.review_count, c.enrolled_count
      FROM courses c
      WHERE c.instructor_id = ? AND c.status = 'published'
      ORDER BY c.enrolled_count DESC
    `, [id]);

    res.json({
      success: true,
      instructor: {
        ...instructor,
        social_links: JSON.parse(instructor.social_links || '{}'),
        courses
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch instructor details.' });
  }
});

export default router;
