import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { ReviewModel, UserModel, EnrollmentModel, CourseModel } from '../models/index.js';

const router = Router();

// Get Approved Reviews for a Course
router.get('/course/:courseId', async (req, res: Response) => {
  try {
    const { courseId } = req.params;

    const reviews = await ReviewModel.find({ course_id: courseId, status: 'approved' })
      .sort({ created_at: -1 })
      .lean();

    const formattedReviews = await Promise.all(
      reviews.map(async (r: any) => {
        const user = await UserModel.findOne({ id: r.user_id }).lean();
        return {
          id: r.id,
          course_id: r.course_id,
          rating: r.rating,
          review_text: r.review_text,
          created_at: r.created_at,
          student_name: user?.name || 'Student',
          student_avatar: user?.avatar || ''
        };
      })
    );

    const total = reviews.length;
    const avgRating = total > 0
      ? Math.round((reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 5), 0) / total) * 10) / 10
      : 5.0;

    res.json({
      success: true,
      reviews: formattedReviews,
      stats: {
        total,
        average: avgRating
      }
    });
  } catch (error: any) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// Enrolled Student Submit/Update Review
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, rating, reviewText } = req.body;

    if (!courseId || !rating || !reviewText) {
      res.status(400).json({ success: false, message: 'courseId, rating (1-5), and reviewText are required.' });
      return;
    }

    const numRating = Math.max(1, Math.min(5, Number(rating)));

    // Verify enrollment
    const enrollment = await EnrollmentModel.findOne({
      user_id: userId,
      course_id: courseId,
      status: { $ne: 'revoked' }
    });

    if (!enrollment && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only enrolled students can review this course.' });
      return;
    }

    const existing = await ReviewModel.findOne({ user_id: userId, course_id: courseId });

    if (existing) {
      existing.rating = numRating;
      existing.review_text = reviewText.trim();
      existing.updated_at = new Date();
      await existing.save();
    } else {
      await ReviewModel.create({
        id: `rev-${uuidv4().slice(0, 8)}`,
        course_id: courseId,
        user_id: userId,
        rating: numRating,
        review_text: reviewText.trim(),
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Recalculate course average rating and review_count
    const allApprovedReviews = await ReviewModel.find({ course_id: courseId, status: 'approved' });
    const count = allApprovedReviews.length;
    const avgRating = count > 0
      ? Math.round((allApprovedReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 5), 0) / count) * 10) / 10
      : 5.0;

    await CourseModel.findOneAndUpdate(
      { id: courseId },
      { rating: avgRating, review_count: count, updated_at: new Date() }
    );

    res.json({
      success: true,
      message: 'Review submitted successfully.'
    });
  } catch (error: any) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

export default router;
