import { Router, Response } from 'express';
import { InstructorModel, CourseModel } from '../models/index.js';

const router = Router();

// List Instructors
router.get('/', async (_req, res: Response) => {
  try {
    const instructors = await InstructorModel.find().sort({ rating: -1 }).lean();

    const formatted = await Promise.all(
      instructors.map(async (inst: any) => {
        const courses = await CourseModel.find({ instructor_id: inst.id, status: 'published' }).lean();
        const courses_count = courses.length;
        const students_count = courses.reduce((sum: number, c: any) => sum + Number(c.enrolled_count || 0), 0);

        return {
          ...inst,
          courses_count,
          students_count,
          social_links: typeof inst.social_links === 'string' ? JSON.parse(inst.social_links) : (inst.social_links || {})
        };
      })
    );

    res.json({ success: true, instructors: formatted });
  } catch (error: any) {
    console.error('Fetch instructors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructors.' });
  }
});

// Single Instructor with their courses
router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = await InstructorModel.findOne({ id }).lean();

    if (!instructor) {
      res.status(404).json({ success: false, message: 'Instructor not found.' });
      return;
    }

    const courses = await CourseModel.find({ instructor_id: id, status: 'published' })
      .sort({ enrolled_count: -1 })
      .select('id title slug thumbnail price discount_price difficulty_level duration rating review_count enrolled_count')
      .lean();

    res.json({
      success: true,
      instructor: {
        ...instructor,
        social_links: typeof instructor.social_links === 'string' ? JSON.parse(instructor.social_links) : (instructor.social_links || {}),
        courses
      }
    });
  } catch (error: any) {
    console.error('Fetch instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructor details.' });
  }
});

export default router;
