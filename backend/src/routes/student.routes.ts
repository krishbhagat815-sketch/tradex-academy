import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Student Dashboard Overview
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Enrolled courses with course details and progress
    const enrolledCourses = query(`
      SELECT 
        e.id as enrollment_id, e.course_id, e.enrolled_at, e.progress_percent,
        e.last_lesson_id, e.completed_at, e.status as enrollment_status,
        c.title, c.slug, c.thumbnail, c.duration, c.difficulty_level,
        inst.name as instructor_name, inst.avatar as instructor_avatar,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = e.user_id AND lp.course_id = c.id AND lp.completed = 1) as completed_lessons,
        (SELECT l2.title FROM lessons l2 WHERE l2.id = e.last_lesson_id) as last_lesson_title
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      WHERE e.user_id = ? AND e.status != 'revoked'
      ORDER BY e.enrolled_at DESC
    `, [userId]);

    const formattedCourses = enrolledCourses.map(c => ({
      ...c,
      progress_percent: Math.min(100, Math.round(Number(c.progress_percent || 0))),
      total_lessons: Number(c.total_lessons || 0),
      completed_lessons: Number(c.completed_lessons || 0)
    }));

    const totalEnrolled = formattedCourses.length;
    const completedCoursesCount = formattedCourses.filter(c => c.progress_percent >= 100 || c.enrollment_status === 'completed').length;
    const inProgressCoursesCount = totalEnrolled - completedCoursesCount;

    // Count certificates
    const certificatesCount = queryOne(`
      SELECT COUNT(*) as count FROM certificates WHERE user_id = ?
    `, [userId])?.count || 0;

    // Recent orders
    const recentOrders = query(`
      SELECT o.id, o.order_number, o.amount, o.payment_status, o.created_at, c.title as course_title
      FROM orders o
      JOIN courses c ON o.course_id = c.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT 5
    `, [userId]);

    res.json({
      success: true,
      stats: {
        totalEnrolled,
        completedCourses: completedCoursesCount,
        inProgressCourses: inProgressCoursesCount,
        certificatesEarned: Number(certificatesCount)
      },
      enrolled_courses: formattedCourses,
      recent_orders: recentOrders
    });
  } catch (error: any) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
});

// Update Lesson Progress
router.post('/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, lessonId, completed = true } = req.body;

    if (!courseId || !lessonId) {
      res.status(400).json({ success: false, message: 'courseId and lessonId are required.' });
      return;
    }

    const now = new Date().toISOString();

    if (completed) {
      const existing = queryOne('SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?', [userId, lessonId]);
      if (!existing) {
        const prgId = `prg-${uuidv4().slice(0, 8)}`;
        execute(`
          INSERT INTO lesson_progress (id, user_id, lesson_id, course_id, completed, completed_at)
          VALUES (?, ?, ?, ?, 1, ?)
        `, [prgId, userId, lessonId, courseId, now]);
      }
    } else {
      execute('DELETE FROM lesson_progress WHERE user_id = ? AND lesson_id = ?', [userId, lessonId]);
    }

    // Calculate updated percentage
    const totalLessonsRow = queryOne('SELECT COUNT(*) as count FROM lessons WHERE course_id = ?', [courseId]);
    const totalLessons = Number(totalLessonsRow?.count || 1);

    const completedLessonsRow = queryOne(`
      SELECT COUNT(*) as count FROM lesson_progress 
      WHERE user_id = ? AND course_id = ? AND completed = 1
    `, [userId, courseId]);
    const completedLessons = Number(completedLessonsRow?.count || 0);

    const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
    const isCompleted = progressPercent >= 100;

    // Update enrollment
    execute(`
      UPDATE enrollments
      SET progress_percent = ?,
          last_lesson_id = ?,
          status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'active' END,
          completed_at = CASE WHEN ? >= 100 AND completed_at IS NULL THEN ? ELSE completed_at END
      WHERE user_id = ? AND course_id = ?
    `, [progressPercent, lessonId, progressPercent, progressPercent, now, userId, courseId]);

    // Check certificate issuance if 100% completed
    let issuedCertificate: any = null;
    if (isCompleted) {
      const existingCert = queryOne('SELECT certificate_code, issued_at FROM certificates WHERE user_id = ? AND course_id = ?', [userId, courseId]);
      if (!existingCert) {
        const certId = `cert-${uuidv4().slice(0, 8)}`;
        const certCode = `CERT-TRX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const userRow = queryOne('SELECT name FROM users WHERE id = ?', [userId]);
        const courseRow = queryOne(`
          SELECT c.title, inst.name as instructor_name
          FROM courses c
          LEFT JOIN instructors inst ON c.instructor_id = inst.id
          WHERE c.id = ?
        `, [courseId]);

        execute(`
          INSERT INTO certificates (id, certificate_code, user_id, course_id, student_name, course_title, instructor_name, issued_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          certId, certCode, userId, courseId,
          userRow?.name || 'Valued Student',
          courseRow?.title || 'Certificate of Completion',
          courseRow?.instructor_name || 'TradeX Academy',
          now
        ]);

        issuedCertificate = {
          certificate_code: certCode,
          issued_at: now
        };
      } else {
        issuedCertificate = existingCert;
      }
    }

    res.json({
      success: true,
      progress_percent: progressPercent,
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
      is_completed: isCompleted,
      certificate: issuedCertificate
    });
  } catch (error: any) {
    console.error('Progress update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress.' });
  }
});

// Save or Update Notes for a Lesson
router.post('/notes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, lessonId, content } = req.body;

    if (!courseId || !lessonId) {
      res.status(400).json({ success: false, message: 'courseId and lessonId are required.' });
      return;
    }

    const now = new Date().toISOString();
    const existing = queryOne('SELECT id FROM notes WHERE user_id = ? AND lesson_id = ?', [userId, lessonId]);

    if (existing) {
      execute('UPDATE notes SET content = ?, updated_at = ? WHERE id = ?', [content || '', now, existing.id]);
    } else {
      execute(`
        INSERT INTO notes (id, user_id, course_id, lesson_id, content, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [`not-${uuidv4().slice(0, 8)}`, userId, courseId, lessonId, content || '', now]);
    }

    res.json({ success: true, message: 'Note saved successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to save note.' });
  }
});

// Get Student Wishlist
router.get('/wishlist', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const wishlistCourses = query(`
      SELECT 
        w.id as wishlist_id, w.created_at as wishlisted_at,
        c.id, c.title, c.slug, c.short_description, c.thumbnail, c.price, c.discount_price,
        c.difficulty_level, c.duration, c.rating, c.review_count,
        inst.name as instructor_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = ? AND e.course_id = c.id AND e.status != 'revoked') as is_enrolled
      FROM wishlist w
      JOIN courses c ON w.course_id = c.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId, userId]);

    res.json({ success: true, wishlist: wishlistCourses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
});

// Toggle Course in Wishlist
router.post('/wishlist/:courseId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId } = req.params;

    const existing = queryOne('SELECT id FROM wishlist WHERE user_id = ? AND course_id = ?', [userId, courseId]);

    if (existing) {
      execute('DELETE FROM wishlist WHERE id = ?', [existing.id]);
      res.json({ success: true, message: 'Removed from wishlist.', is_wishlisted: false });
    } else {
      const now = new Date().toISOString();
      execute('INSERT INTO wishlist (id, user_id, course_id, created_at) VALUES (?, ?, ?, ?)', [
        `wsh-${uuidv4().slice(0, 8)}`, userId, courseId, now
      ]);
      res.json({ success: true, message: 'Added to wishlist.', is_wishlisted: true });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle wishlist.' });
  }
});

// Get Student Certificates
router.get('/certificates', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const certificates = query(`
      SELECT 
        cert.*,
        c.thumbnail as course_thumbnail, c.slug as course_slug
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.user_id = ?
      ORDER BY cert.issued_at DESC
    `, [userId]);

    res.json({ success: true, certificates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
  }
});

// Get Student Order History
router.get('/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const orders = query(`
      SELECT 
        o.*,
        c.title as course_title, c.thumbnail as course_thumbnail, c.slug as course_slug
      FROM orders o
      JOIN courses c ON o.course_id = c.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    const formattedOrders = orders.map(o => ({
      ...o,
      billing_info: JSON.parse(o.billing_info || '{}')
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

export default router;
