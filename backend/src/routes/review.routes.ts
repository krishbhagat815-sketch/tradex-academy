import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get Approved Reviews for a Course
router.get('/course/:courseId', async (req, res: Response) => {
  try {
    const { courseId } = req.params;

    const reviews = query(`
      SELECT 
        r.id, r.course_id, r.rating, r.review_text, r.created_at,
        u.name as student_name, u.avatar as student_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
    `, [courseId]);

    // Rating breakdown stats
    const statsRow = queryOne(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating
      FROM reviews
      WHERE course_id = ? AND status = 'approved'
    `, [courseId]);

    res.json({
      success: true,
      reviews,
      stats: {
        total: Number(statsRow?.total || 0),
        average: statsRow?.avg_rating ? Math.round(Number(statsRow.avg_rating) * 10) / 10 : 5.0
      }
    });
  } catch (error: any) {
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
    const enrollment = queryOne(`
      SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status != 'revoked'
    `, [userId, courseId]);

    if (!enrollment && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only enrolled students can review this course.' });
      return;
    }

    const now = new Date().toISOString();
    const existing = queryOne('SELECT id FROM reviews WHERE user_id = ? AND course_id = ?', [userId, courseId]);

    if (existing) {
      execute(`
        UPDATE reviews
        SET rating = ?, review_text = ?, updated_at = ?
        WHERE id = ?
      `, [numRating, reviewText.trim(), now, existing.id]);
    } else {
      execute(`
        INSERT INTO reviews (id, course_id, user_id, rating, review_text, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)
      `, [`rev-${uuidv4().slice(0, 8)}`, courseId, userId, numRating, reviewText.trim(), now, now]);
    }

    // Recalculate course average rating and review_count
    const stats = queryOne(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews WHERE course_id = ? AND status = 'approved'
    `, [courseId]);

    const avgRating = stats?.avg_rating ? Math.round(Number(stats.avg_rating) * 10) / 10 : 5.0;
    const reviewCount = Number(stats?.count || 0);

    execute(`
      UPDATE courses
      SET rating = ?, review_count = ?
      WHERE id = ?
    `, [avgRating, reviewCount, courseId]);

    res.json({
      success: true,
      message: 'Your review has been submitted successfully!',
      rating: numRating,
      course_rating: avgRating,
      course_reviews_count: reviewCount
    });
  } catch (error: any) {
    console.error('Review submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

export default router;
