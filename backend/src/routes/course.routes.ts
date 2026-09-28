import { Router, Response } from 'express';
import { query, queryOne } from '../db/database.js';
import { optionalAuth, authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Browse & Search Courses
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      category,
      level,
      price,
      rating,
      sort = 'popular',
      featured,
      limit = 50,
      page = 1
    } = req.query;

    let sql = `
      SELECT 
        c.id, c.title, c.slug, c.short_description, c.category_id, c.instructor_id,
        c.thumbnail, c.preview_video_url, c.price, c.discount_price, c.difficulty_level,
        c.duration, c.language, c.status, c.featured, c.popular, c.is_new,
        c.enrolled_count, c.rating, c.review_count, c.created_at,
        cat.name as category_name, cat.slug as category_slug,
        inst.name as instructor_name, inst.avatar as instructor_avatar, inst.title as instructor_title,
        (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as module_count,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as lesson_count
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      WHERE c.status = 'published'
    `;

    const params: any[] = [];

    if (search) {
      sql += ` AND (LOWER(c.title) LIKE ? OR LOWER(c.short_description) LIKE ? OR LOWER(c.tags) LIKE ?)`;
      const term = `%${String(search).toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'all') {
      sql += ` AND (cat.slug = ? OR cat.id = ?)`;
      params.push(category, category);
    }

    if (level && level !== 'all') {
      sql += ` AND c.difficulty_level = ?`;
      params.push(level);
    }

    if (price === 'free') {
      sql += ` AND (c.price = 0 OR c.discount_price = 0)`;
    } else if (price === 'paid') {
      sql += ` AND (COALESCE(c.discount_price, c.price) > 0)`;
    }

    if (rating) {
      sql += ` AND c.rating >= ?`;
      params.push(Number(rating));
    }

    if (featured === '1' || featured === 'true') {
      sql += ` AND c.featured = 1`;
    }

    // Sorting
    switch (sort) {
      case 'newest':
        sql += ` ORDER BY c.created_at DESC`;
        break;
      case 'price-asc':
        sql += ` ORDER BY COALESCE(c.discount_price, c.price) ASC`;
        break;
      case 'price-desc':
        sql += ` ORDER BY COALESCE(c.discount_price, c.price) DESC`;
        break;
      case 'rating':
        sql += ` ORDER BY c.rating DESC, c.review_count DESC`;
        break;
      case 'popular':
      default:
        sql += ` ORDER BY c.enrolled_count DESC, c.rating DESC`;
        break;
    }

    const offset = (Number(page) - 1) * Number(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const courses = query(sql, params).map((c: any) => {
      const originalPrice = Number(c.price);
      const currentPrice = c.discount_price != null ? Number(c.discount_price) : originalPrice;
      const discountPercent = originalPrice > 0 && currentPrice < originalPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;

      return {
        ...c,
        price: originalPrice,
        discount_price: c.discount_price != null ? currentPrice : null,
        discount_percentage: discountPercent,
        module_count: Number(c.module_count || 0),
        lesson_count: Number(c.lesson_count || 0)
      };
    });

    // If user is authenticated, check their wishlist
    let wishlistCourseIds = new Set<string>();
    if (req.user) {
      const wishlistRows = query('SELECT course_id FROM wishlist WHERE user_id = ?', [req.user.id]);
      wishlistCourseIds = new Set(wishlistRows.map(r => r.course_id));
    }

    const coursesWithWishlist = courses.map(c => ({
      ...c,
      is_wishlisted: wishlistCourseIds.has(c.id)
    }));

    res.json({
      success: true,
      count: coursesWithWishlist.length,
      courses: coursesWithWishlist
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
  }
});

// Single Course Details Page
router.get('/:idOrSlug', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    const course = queryOne(`
      SELECT 
        c.*,
        cat.name as category_name, cat.slug as category_slug,
        inst.name as instructor_name, inst.avatar as instructor_avatar,
        inst.title as instructor_title, inst.bio as instructor_bio,
        inst.rating as instructor_rating, inst.students_count as instructor_students,
        inst.courses_count as instructor_courses, inst.social_links as instructor_social
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      WHERE c.id = ? OR c.slug = ?
    `, [idOrSlug, idOrSlug]);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    let isEnrolled = false;
    let enrollmentData: any = null;
    let isWishlisted = false;

    if (req.user) {
      const enrollment = queryOne(`
        SELECT id, enrolled_at, progress_percent, last_lesson_id, status
        FROM enrollments 
        WHERE user_id = ? AND course_id = ? AND status != 'revoked'
      `, [req.user.id, course.id]);

      if (enrollment || req.user.role === 'admin') {
        isEnrolled = true;
        enrollmentData = enrollment;
      }

      const wish = queryOne('SELECT id FROM wishlist WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
      isWishlisted = !!wish;
    }

    // Fetch modules and lessons
    const modules = query(`
      SELECT id, title, description, order_num
      FROM modules
      WHERE course_id = ?
      ORDER BY order_num ASC
    `, [course.id]);

    const lessons = query(`
      SELECT id, module_id, title, description, video_url, media_type, media_name, media_size, video_duration, is_preview, order_num, resources, quizzes
      FROM lessons
      WHERE course_id = ?
      ORDER BY order_num ASC
    `, [course.id]);

    // Group lessons by module, masking video_url if user not enrolled and not preview
    const curriculum = modules.map((m: any) => {
      const moduleLessons = lessons
        .filter((l: any) => l.module_id === m.id)
        .map((l: any) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          video_duration: l.video_duration,
          is_preview: Boolean(l.is_preview),
          media_type: l.media_type || 'url',
          media_name: l.media_name,
          media_size: l.media_size,
          video_url: (isEnrolled || l.is_preview) ? l.video_url : null,
          resources: isEnrolled ? JSON.parse(l.resources || '[]') : [],
          has_quiz: JSON.parse(l.quizzes || '[]').length > 0
        }));

      return {
        ...m,
        lessons: moduleLessons
      };
    });

    // Related courses in same category
    const related = query(`
      SELECT 
        c.id, c.title, c.slug, c.thumbnail, c.price, c.discount_price,
        c.difficulty_level, c.duration, c.rating, c.review_count,
        inst.name as instructor_name
      FROM courses c
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      WHERE c.category_id = ? AND c.id != ? AND c.status = 'published'
      LIMIT 3
    `, [course.category_id, course.id]);

    // Reviews for this course
    const reviews = query(`
      SELECT 
        r.id, r.rating, r.review_text, r.created_at,
        u.name as student_name, u.avatar as student_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [course.id]);

    const originalPrice = Number(course.price);
    const currentPrice = course.discount_price != null ? Number(course.discount_price) : originalPrice;
    const discountPercent = originalPrice > 0 && currentPrice < originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    res.json({
      success: true,
      course: {
        ...course,
        price: originalPrice,
        discount_price: course.discount_price != null ? currentPrice : null,
        discount_percentage: discountPercent,
        learning_outcomes: JSON.parse(course.learning_outcomes || '[]'),
        requirements: JSON.parse(course.requirements || '[]'),
        target_audience: JSON.parse(course.target_audience || '[]'),
        tags: JSON.parse(course.tags || '[]'),
        instructor_social: JSON.parse(course.instructor_social || '{}'),
        is_enrolled: isEnrolled,
        enrollment: enrollmentData,
        is_wishlisted: isWishlisted,
        curriculum,
        related_courses: related,
        reviews
      }
    });
  } catch (error: any) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course details.' });
  }
});

// Enrolled Learning Player Endpoint
router.get('/:id/learn', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check enrollment or admin
    let enrollment = queryOne(`
      SELECT id, enrolled_at, progress_percent, last_lesson_id, status, completed_at
      FROM enrollments
      WHERE user_id = ? AND course_id = ? AND status != 'revoked'
    `, [userId, id]);

    if (!enrollment && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'You must be enrolled in this course to access the player.' });
      return;
    }

    const course = queryOne(`
      SELECT 
        c.id, c.title, c.slug, c.thumbnail, c.duration,
        inst.name as instructor_name, inst.avatar as instructor_avatar
      FROM courses c
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      WHERE c.id = ?
    `, [id]);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const modules = query(`
      SELECT id, title, description, order_num
      FROM modules
      WHERE course_id = ?
      ORDER BY order_num ASC
    `, [id]);

    const lessons = query(`
      SELECT id, module_id, title, description, video_url, media_type, media_name, media_size, video_duration, is_preview, order_num, resources, quizzes
      FROM lessons
      WHERE course_id = ?
      ORDER BY order_num ASC
    `, [id]);

    // User's completed lessons
    const completedProgress = query(`
      SELECT lesson_id, completed_at
      FROM lesson_progress
      WHERE user_id = ? AND course_id = ? AND completed = 1
    `, [userId, id]);

    const completedLessonIds = new Set(completedProgress.map(p => p.lesson_id));

    // User's notes for this course
    const notes = query(`
      SELECT lesson_id, content, updated_at
      FROM notes
      WHERE user_id = ? AND course_id = ?
    `, [userId, id]);

    const notesMap: Record<string, string> = {};
    notes.forEach(n => {
      notesMap[n.lesson_id] = n.content;
    });

    const curriculum = modules.map((m: any) => {
      const moduleLessons = lessons
        .filter((l: any) => l.module_id === m.id)
        .map((l: any) => ({
          id: l.id,
          module_id: l.module_id,
          title: l.title,
          description: l.description,
          video_url: l.video_url,
          media_type: l.media_type || 'url',
          media_name: l.media_name,
          media_size: l.media_size,
          video_duration: l.video_duration,
          is_preview: Boolean(l.is_preview),
          resources: JSON.parse(l.resources || '[]'),
          quizzes: JSON.parse(l.quizzes || '[]'),
          is_completed: completedLessonIds.has(l.id),
          note: notesMap[l.id] || ''
        }));

      return {
        ...m,
        lessons: moduleLessons
      };
    });

    // Check certificate if completed
    const certificate = queryOne(`
      SELECT certificate_code, issued_at
      FROM certificates
      WHERE user_id = ? AND course_id = ?
    `, [userId, id]);

    res.json({
      success: true,
      course,
      enrollment: enrollment || {
        progress_percent: 0,
        status: 'active',
        last_lesson_id: lessons[0]?.id || null
      },
      completed_lesson_ids: Array.from(completedLessonIds),
      certificate: certificate || null,
      curriculum
    });
  } catch (error: any) {
    console.error('Error fetching learning player data:', error);
    res.status(500).json({ success: false, message: 'Failed to load course player.' });
  }
});

export default router;
