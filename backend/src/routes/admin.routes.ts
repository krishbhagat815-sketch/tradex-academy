import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import {
  UserModel,
  CourseModel,
  ModuleModel,
  LessonModel,
  EnrollmentModel,
  OrderModel,
  CouponModel,
  ReviewModel,
  InstructorModel,
  CategoryModel,
  SiteContentModel,
  CounselingBookingModel
} from '../models/index.js';
import { syncCourseCurriculum } from '../db/mongodb.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// ==========================================
// 1. DASHBOARD OVERVIEW & ANALYTICS
// ==========================================
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const totalCourses = await CourseModel.countDocuments();
    const publishedCourses = await CourseModel.countDocuments({ status: 'published' });
    const draftCourses = await CourseModel.countDocuments({ status: 'draft' });

    const totalStudents = await UserModel.countDocuments({ role: 'student' });
    const totalEnrollments = await EnrollmentModel.countDocuments({ status: { $ne: 'revoked' } });
    const completedEnrollments = await EnrollmentModel.countDocuments({ status: 'completed' });

    // Completed orders excluding revoked enrollments
    const revokedEnrollments = await EnrollmentModel.find({ status: 'revoked' }).select('order_id user_id course_id').lean();
    const revokedKeys = new Set<string>();
    revokedEnrollments.forEach((e: any) => {
      if (e.order_id) revokedKeys.add(e.order_id);
      revokedKeys.add(`${e.user_id}_${e.course_id}`);
    });

    const completedOrders = await OrderModel.find({ payment_status: 'completed' }).lean();
    const validOrders = completedOrders.filter((o: any) => !revokedKeys.has(o.id) && !revokedKeys.has(`${o.user_id}_${o.course_id}`));

    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const pendingOrders = await OrderModel.countDocuments({ payment_status: 'pending' });

    // Real Counseling Bookings Metrics
    const totalBookings = await CounselingBookingModel.countDocuments();
    const pendingBookings = await CounselingBookingModel.countDocuments({ status: 'pending' });
    const confirmedBookings = await CounselingBookingModel.countDocuments({ status: 'confirmed' });
    const completedBookings = await CounselingBookingModel.countDocuments({ status: 'completed' });

    // Recent 6 Counseling Bookings
    const recentBookings = await CounselingBookingModel.find().sort({ created_at: -1 }).limit(6).lean();

    // Top Selling Courses
    const courses = await CourseModel.find().lean();
    const coursesWithRevenue = courses.map((c: any) => {
      const courseOrders = validOrders.filter((o: any) => o.course_id === c.id);
      const rev = courseOrders.reduce((s, o) => s + Number(o.amount || 0), 0);
      return {
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnail,
        price: c.price,
        discount_price: c.discount_price,
        enrolled_count: c.enrolled_count,
        rating: c.rating,
        total_revenue: Math.round(rev * 100) / 100
      };
    });
    coursesWithRevenue.sort((a, b) => b.total_revenue - a.total_revenue || b.enrolled_count - a.enrolled_count);
    const topCourses = coursesWithRevenue.slice(0, 5);

    // Sales by Category
    const categories = await CategoryModel.find().lean();
    const salesByCategory = categories.map((cat: any) => {
      const catCourseIds = new Set(courses.filter((c: any) => c.category_id === cat.id).map((c: any) => c.id));
      const catOrders = validOrders.filter((o: any) => catCourseIds.has(o.course_id));
      const rev = catOrders.reduce((s, o) => s + Number(o.amount || 0), 0);
      return {
        category_name: cat.name,
        sales_count: catOrders.length,
        revenue: Math.round(rev * 100) / 100
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Recent 6 Orders
    const rawRecentOrders = await OrderModel.find().sort({ created_at: -1 }).limit(6).lean();
    const recentOrders = await Promise.all(
      rawRecentOrders.map(async (o: any) => {
        const u = await UserModel.findOne({ id: o.user_id }).select('name email').lean();
        const c = await CourseModel.findOne({ id: o.course_id }).select('title').lean();
        return {
          id: o.id,
          order_number: o.order_number,
          amount: o.amount,
          discount_amount: o.discount_amount,
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          created_at: o.created_at,
          student_name: u?.name || 'Student',
          student_email: u?.email || '',
          course_title: c?.title || 'Course'
        };
      })
    );

    // Recent 6 Enrollments
    const rawRecentEnrollments = await EnrollmentModel.find().sort({ enrolled_at: -1 }).limit(6).lean();
    const recentEnrollments = await Promise.all(
      rawRecentEnrollments.map(async (e: any) => {
        const u = await UserModel.findOne({ id: e.user_id }).select('name email avatar').lean();
        const c = await CourseModel.findOne({ id: e.course_id }).select('title').lean();
        return {
          id: e.id,
          enrolled_at: e.enrolled_at,
          progress_percent: e.progress_percent,
          status: e.status,
          student_name: u?.name || 'Student',
          student_email: u?.email || '',
          student_avatar: u?.avatar || '',
          course_title: c?.title || 'Course'
        };
      })
    );

    // Dynamic Monthly Revenue Trend
    const monthlyMap: Record<string, { revenue: number; enrollments: number }> = {};
    validOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = !isNaN(d.getTime()) ? d.toISOString().slice(0, 7) : '2026-10';
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, enrollments: 0 };
      monthlyMap[key].revenue += Number(o.amount || 0);
      monthlyMap[key].enrollments += 1;
    });

    const monthKeys = Object.keys(monthlyMap).sort();
    let revenueTrend: any[] = [];
    if (monthKeys.length > 0) {
      revenueTrend = monthKeys.map(k => {
        const dateObj = new Date(k + '-01');
        const monthName = isNaN(dateObj.getTime()) ? k : dateObj.toLocaleString('default', { month: 'short' });
        return {
          month: monthName,
          revenue: Math.round(monthlyMap[k].revenue),
          enrollments: monthlyMap[k].enrollments
        };
      });
    } else {
      const currentMonth = new Date().toLocaleString('default', { month: 'short' });
      revenueTrend = [
        { month: 'Last Month', revenue: Math.round(totalRevenue * 0.4), enrollments: Math.max(1, Math.round(totalEnrollments * 0.4)) },
        { month: currentMonth, revenue: Math.round(totalRevenue), enrollments: totalEnrollments }
      ];
    }

    res.json({
      success: true,
      stats: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalStudents,
        totalEnrollments,
        completedEnrollments,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingOrders,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings
      },
      dbHealth: {
        mongodb: 'connected (Atlas)',
        engine: 'MongoDB Atlas Native'
      },
      revenueTrend,
      salesByCategory,
      topCourses,
      recentOrders,
      recentEnrollments,
      recentBookings
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
});

// ==========================================
// 2. COURSE MANAGEMENT (CRUD)
// ==========================================
router.get('/courses', async (_req: AuthRequest, res: Response) => {
  try {
    const courses = await CourseModel.find().sort({ created_at: -1 }).lean();

    const formatted = await Promise.all(
      courses.map(async (c: any) => {
        const cat = c.category_id ? await CategoryModel.findOne({ id: c.category_id }).lean() : null;
        const inst = c.instructor_id ? await InstructorModel.findOne({ id: c.instructor_id }).lean() : null;

        let module_count = 0;
        let lesson_count = 0;
        if (c.modules && Array.isArray(c.modules)) {
          module_count = c.modules.length;
          for (const m of c.modules) {
            if (m.lessons && Array.isArray(m.lessons)) {
              lesson_count += m.lessons.length;
            }
          }
        }

        const orders = await OrderModel.find({ course_id: c.id, payment_status: 'completed' }).select('amount').lean();
        const total_revenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

        return {
          ...c,
          category_name: cat?.name || '',
          instructor_name: inst?.name || '',
          module_count,
          lesson_count,
          total_revenue: Math.round(total_revenue * 100) / 100,
          learning_outcomes: Array.isArray(c.learning_outcomes) ? c.learning_outcomes : [],
          requirements: Array.isArray(c.requirements) ? c.requirements : [],
          target_audience: Array.isArray(c.target_audience) ? c.target_audience : [],
          tags: Array.isArray(c.tags) ? c.tags : []
        };
      })
    );

    res.json({ success: true, courses: formatted });
  } catch (error: any) {
    console.error('Admin fetch courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
  }
});

// Single course full details for editing (including modules and lessons)
router.get('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const course = await CourseModel.findOne({ id }).lean();
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // Return modules and lessons from embedded or ModuleModel/LessonModel
    const modules = await ModuleModel.find({ course_id: id }).sort({ order_num: 1 }).lean();
    const lessons = await LessonModel.find({ course_id: id }).sort({ order_num: 1 }).lean();

    let curriculum: any[] = [];
    if (modules.length > 0) {
      curriculum = modules.map((m: any) => ({
        ...m,
        lessons: lessons
          .filter((l: any) => l.module_id === m.id)
          .map((l: any) => ({
            ...l,
            resources: Array.isArray(l.resources) ? l.resources : (typeof l.resources === 'string' ? JSON.parse(l.resources || '[]') : []),
            quizzes: Array.isArray(l.quizzes) ? l.quizzes : (typeof l.quizzes === 'string' ? JSON.parse(l.quizzes || '[]') : [])
          }))
      }));
    } else if (course.modules && course.modules.length > 0) {
      curriculum = course.modules;
    }

    res.json({
      success: true,
      course: {
        ...course,
        learning_outcomes: Array.isArray(course.learning_outcomes) ? course.learning_outcomes : [],
        requirements: Array.isArray(course.requirements) ? course.requirements : [],
        target_audience: Array.isArray(course.target_audience) ? course.target_audience : [],
        tags: Array.isArray(course.tags) ? course.tags : [],
        curriculum
      }
    });
  } catch (error: any) {
    console.error('Admin fetch course detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course details.' });
  }
});

// Create Course
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      short_description,
      description,
      category_id,
      instructor_id,
      thumbnail,
      preview_video_url,
      price,
      discount_price,
      difficulty_level = 'Beginner',
      duration = '10 hours',
      language = 'English',
      learning_outcomes = [],
      requirements = [],
      target_audience = [],
      tags = [],
      status = 'draft',
      featured = 0,
      popular = 0,
      is_new = 1
    } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Course title is required.' });
      return;
    }

    const courseId = `crs-${uuidv4().slice(0, 8)}`;
    const courseSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const now = new Date();

    await CourseModel.create({
      id: courseId,
      title: title.trim(),
      slug: courseSlug,
      short_description: short_description || '',
      description: description || '',
      category_id: category_id || null,
      instructor_id: instructor_id || null,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      preview_video_url: preview_video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      price: Number(price || 0),
      discount_price: discount_price != null && discount_price !== '' ? Number(discount_price) : null,
      difficulty_level,
      duration,
      language,
      learning_outcomes: Array.isArray(learning_outcomes) ? learning_outcomes : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      target_audience: Array.isArray(target_audience) ? target_audience : [],
      tags: Array.isArray(tags) ? tags : [],
      status,
      featured: Boolean(featured),
      popular: Boolean(popular),
      is_new: Boolean(is_new),
      enrolled_count: 0,
      rating: 5.0,
      review_count: 0,
      modules: [],
      created_at: now,
      updated_at: now
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      courseId
    });
  } catch (error: any) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
});

// Update Course
router.put('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      short_description,
      description,
      category_id,
      instructor_id,
      thumbnail,
      preview_video_url,
      price,
      discount_price,
      difficulty_level,
      duration,
      language,
      learning_outcomes,
      requirements,
      target_audience,
      tags,
      status,
      featured,
      popular,
      is_new
    } = req.body;

    const course = await CourseModel.findOne({ id });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    if (title !== undefined) course.title = title.trim();
    if (slug !== undefined) course.slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (short_description !== undefined) course.short_description = short_description;
    if (description !== undefined) course.description = description;
    if (category_id !== undefined) course.category_id = category_id;
    if (instructor_id !== undefined) course.instructor_id = instructor_id;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (preview_video_url !== undefined) course.preview_video_url = preview_video_url;
    if (price !== undefined) course.price = Number(price);
    if (discount_price !== undefined) course.discount_price = discount_price != null && discount_price !== '' ? Number(discount_price) : null;
    if (difficulty_level !== undefined) course.difficulty_level = difficulty_level;
    if (duration !== undefined) course.duration = duration;
    if (language !== undefined) course.language = language;
    if (learning_outcomes !== undefined) course.learning_outcomes = Array.isArray(learning_outcomes) ? learning_outcomes : [];
    if (requirements !== undefined) course.requirements = Array.isArray(requirements) ? requirements : [];
    if (target_audience !== undefined) course.target_audience = Array.isArray(target_audience) ? target_audience : [];
    if (tags !== undefined) course.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) course.status = status;
    if (featured !== undefined) course.featured = Boolean(featured);
    if (popular !== undefined) course.popular = Boolean(popular);
    if (is_new !== undefined) course.is_new = Boolean(is_new);
    course.updated_at = new Date();

    await course.save();

    res.json({ success: true, message: 'Course updated successfully.' });
  } catch (error: any) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Failed to update course.' });
  }
});

// Delete Course
router.delete('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await CourseModel.deleteOne({ id });
    await ModuleModel.deleteMany({ course_id: id });
    await LessonModel.deleteMany({ course_id: id });

    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (error: any) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course.' });
  }
});

// ==========================================
// 3. CURRICULUM: MODULES & LESSONS
// ==========================================
router.post('/courses/:id/modules', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Module title is required.' });
      return;
    }

    const count = await ModuleModel.countDocuments({ course_id: id });
    const nextOrder = count + 1;
    const moduleId = `mod-${uuidv4().slice(0, 8)}`;
    const now = new Date();

    const createdModule = await ModuleModel.create({
      id: moduleId,
      course_id: id,
      title: title.trim(),
      description: description || '',
      order_num: nextOrder,
      created_at: now
    });

    await syncCourseCurriculum(id);

    res.status(201).json({
      success: true,
      message: 'Module added successfully.',
      module: { id: moduleId, course_id: id, title: title.trim(), description: description || '', order_num: nextOrder }
    });
  } catch (error: any) {
    console.error('Add module error:', error);
    res.status(500).json({ success: false, message: 'Failed to add module.' });
  }
});

router.put('/modules/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, order_num } = req.body;

    const mod = await ModuleModel.findOne({ id });
    if (!mod) {
      res.status(404).json({ success: false, message: 'Module not found.' });
      return;
    }

    if (title !== undefined) mod.title = title;
    if (description !== undefined) mod.description = description;
    if (order_num !== undefined) mod.order_num = Number(order_num);
    await mod.save();

    if (mod.course_id) {
      await syncCourseCurriculum(mod.course_id);
    }

    res.json({ success: true, message: 'Module updated successfully.' });
  } catch (error: any) {
    console.error('Update module error:', error);
    res.status(500).json({ success: false, message: 'Failed to update module.' });
  }
});

router.delete('/modules/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mod = await ModuleModel.findOne({ id });
    const courseId = mod?.course_id;

    await LessonModel.deleteMany({ module_id: id });
    await ModuleModel.deleteOne({ id });

    if (courseId) {
      await syncCourseCurriculum(courseId);
    }

    res.json({ success: true, message: 'Module and its lessons deleted.' });
  } catch (error: any) {
    console.error('Delete module error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete module.' });
  }
});

router.post('/modules/:moduleId/lessons', async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      description,
      video_url,
      media_type = 'url',
      media_name,
      media_size,
      video_duration = '12:00',
      is_preview = 0,
      resources = [],
      quizzes = []
    } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Lesson title is required.' });
      return;
    }

    const mod = await ModuleModel.findOne({ id: moduleId }).lean();
    if (!mod) {
      res.status(404).json({ success: false, message: 'Module not found.' });
      return;
    }

    const count = await LessonModel.countDocuments({ module_id: moduleId });
    const nextOrder = count + 1;
    const lessonId = `lsn-${uuidv4().slice(0, 8)}`;
    const now = new Date();

    await LessonModel.create({
      id: lessonId,
      module_id: moduleId,
      course_id: mod.course_id,
      title: title.trim(),
      description: description || '',
      video_url: video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      media_type: media_type || 'url',
      media_name: media_name || '',
      media_size: media_size || '',
      video_duration: video_duration || '10:00',
      is_preview: Boolean(is_preview),
      order_num: nextOrder,
      resources: Array.isArray(resources) ? resources : [],
      quizzes: Array.isArray(quizzes) ? quizzes : [],
      created_at: now
    });

    if (mod.course_id) {
      await syncCourseCurriculum(mod.course_id);
    }

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully.',
      lessonId
    });
  } catch (error: any) {
    console.error('Create lesson error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to create lesson.' });
  }
});

router.put('/lessons/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      video_url,
      media_type,
      media_name,
      media_size,
      video_duration,
      is_preview,
      order_num,
      resources,
      quizzes
    } = req.body;

    const lesson = await LessonModel.findOne({ id });
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson not found.' });
      return;
    }

    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (video_url !== undefined) lesson.video_url = video_url;
    if (media_type !== undefined) lesson.media_type = media_type;
    if (media_name !== undefined) lesson.media_name = media_name;
    if (media_size !== undefined) lesson.media_size = media_size;
    if (video_duration !== undefined) lesson.video_duration = video_duration;
    if (is_preview !== undefined) lesson.is_preview = Boolean(is_preview);
    if (order_num !== undefined) lesson.order_num = Number(order_num);
    if (resources !== undefined) lesson.resources = Array.isArray(resources) ? resources : [];
    if (quizzes !== undefined) lesson.quizzes = Array.isArray(quizzes) ? quizzes : [];

    await lesson.save();

    if (lesson.course_id) {
      await syncCourseCurriculum(lesson.course_id);
    }

    res.json({ success: true, message: 'Lesson updated successfully.' });
  } catch (error: any) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to update lesson.' });
  }
});

router.delete('/lessons/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await LessonModel.findOne({ id });
    const courseId = lesson?.course_id;

    await LessonModel.deleteOne({ id });

    if (courseId) {
      await syncCourseCurriculum(courseId);
    }

    res.json({ success: true, message: 'Lesson deleted.' });
  } catch (error: any) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to delete lesson.' });
  }
});

// ==========================================
// 4. ENROLLMENTS MANAGEMENT
// ==========================================
router.get('/enrollments', async (req: AuthRequest, res: Response) => {
  try {
    const { search, courseId } = req.query;

    const filter: any = {};
    if (courseId) filter.course_id = courseId;

    const enrollments = await EnrollmentModel.find(filter).sort({ enrolled_at: -1 }).lean();

    const formatted = await Promise.all(
      enrollments.map(async (e: any) => {
        const u = await UserModel.findOne({ id: e.user_id }).select('name email avatar').lean();
        const c = await CourseModel.findOne({ id: e.course_id }).select('title thumbnail').lean();

        return {
          id: e.id,
          user_id: e.user_id,
          course_id: e.course_id,
          enrolled_at: e.enrolled_at,
          progress_percent: Math.min(100, Math.round(Number(e.progress_percent || 0))),
          completed_at: e.completed_at,
          status: e.status,
          student_name: u?.name || 'Student',
          student_email: u?.email || '',
          student_avatar: u?.avatar || '',
          course_title: c?.title || 'Course',
          course_thumbnail: c?.thumbnail || ''
        };
      })
    );

    let filtered = formatted;
    if (search) {
      const term = String(search).toLowerCase().trim();
      filtered = formatted.filter(
        (e: any) =>
          e.student_name.toLowerCase().includes(term) ||
          e.student_email.toLowerCase().includes(term) ||
          e.course_title.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, enrollments: filtered });
  } catch (error: any) {
    console.error('Admin get enrollments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrollments.' });
  }
});

// Manual Enrollment by Admin
router.post('/enrollments/manual', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      res.status(400).json({ success: false, message: 'Student and Course are required.' });
      return;
    }

    const existing = await EnrollmentModel.findOne({ user_id: userId, course_id: courseId });
    if (existing) {
      existing.status = 'active';
      existing.updated_at = new Date();
      await existing.save();
      res.json({ success: true, message: 'Enrollment reactivated.' });
      return;
    }

    const enrollmentId = `enr-${uuidv4().slice(0, 8)}`;
    const now = new Date();

    const course = await CourseModel.findOne({ id: courseId }).lean();
    let firstLessonId: string | null = null;
    if (course?.modules && course.modules.length > 0 && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
      firstLessonId = course.modules[0].lessons[0].id;
    } else {
      const firstLsn = await LessonModel.findOne({ course_id: courseId }).sort({ order_num: 1 }).lean();
      firstLessonId = firstLsn?.id || null;
    }

    await EnrollmentModel.create({
      id: enrollmentId,
      user_id: userId,
      course_id: courseId,
      enrolled_at: now,
      progress_percent: 0,
      last_lesson_id: firstLessonId,
      status: 'active',
      created_at: now,
      updated_at: now
    });

    await CourseModel.updateOne({ id: courseId }, { $inc: { enrolled_count: 1 } });

    res.status(201).json({ success: true, message: 'Student enrolled manually successfully.' });
  } catch (error: any) {
    console.error('Manual enrollment error:', error);
    res.status(500).json({ success: false, message: 'Failed to manually enroll student.' });
  }
});

// Revoke or Permanently Delete Enrollment
router.delete('/enrollments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      const existing = await EnrollmentModel.findOne({ id });
      if (existing?.course_id) {
        await CourseModel.updateOne({ id: existing.course_id }, { $inc: { enrolled_count: -1 } });
      }
      await EnrollmentModel.deleteOne({ id });
      res.json({ success: true, message: 'Enrollment removed completely.' });
      return;
    }

    const existing = await EnrollmentModel.findOne({ id });
    if (existing) {
      existing.status = 'revoked';
      existing.updated_at = new Date();
      await existing.save();

      await OrderModel.updateMany(
        { user_id: existing.user_id, course_id: existing.course_id, payment_status: 'completed' },
        { payment_status: 'refunded', updated_at: new Date() }
      );
    }

    res.json({ success: true, message: 'Enrollment revoked successfully.' });
  } catch (error: any) {
    console.error('Revoke enrollment error:', error);
    res.status(500).json({ success: false, message: 'Failed to revoke enrollment.' });
  }
});

// Update Enrollment
router.put('/enrollments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progress_percent } = req.body;

    const existing = await EnrollmentModel.findOne({ id });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Enrollment not found.' });
      return;
    }

    const newStatus = status || existing.status;
    const newProgress = progress_percent !== undefined
      ? Math.min(100, Math.max(0, Number(progress_percent)))
      : Math.min(100, Math.max(0, Number(existing.progress_percent || 0)));
    const completedAt = newStatus === 'completed'
      ? (existing.completed_at || new Date())
      : (newStatus !== 'completed' ? null : existing.completed_at);

    existing.status = newStatus;
    existing.progress_percent = newProgress;
    existing.completed_at = completedAt as any;
    existing.updated_at = new Date();
    await existing.save();

    res.json({
      success: true,
      message: `Enrollment updated to ${newStatus}.`,
      enrollment: {
        id,
        status: newStatus,
        progress_percent: newProgress,
        completed_at: completedAt
      }
    });
  } catch (error: any) {
    console.error('Update enrollment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update enrollment.' });
  }
});

// ==========================================
// 5. ORDERS & TRANSACTIONS MANAGEMENT
// ==========================================
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const { search, status } = req.query;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.payment_status = status;
    }

    const orders = await OrderModel.find(filter).sort({ created_at: -1 }).lean();

    const formatted = await Promise.all(
      orders.map(async (o: any) => {
        const u = await UserModel.findOne({ id: o.user_id }).select('name email').lean();
        const c = await CourseModel.findOne({ id: o.course_id }).select('title thumbnail').lean();

        return {
          ...o,
          student_name: u?.name || 'Student',
          student_email: u?.email || '',
          course_title: c?.title || 'Course',
          course_thumbnail: c?.thumbnail || '',
          billing_info: typeof o.billing_info === 'string' ? JSON.parse(o.billing_info) : (o.billing_info || {})
        };
      })
    );

    let filtered = formatted;
    if (search) {
      const term = String(search).toLowerCase().trim();
      filtered = formatted.filter(
        (o: any) =>
          o.order_number.toLowerCase().includes(term) ||
          o.student_name.toLowerCase().includes(term) ||
          o.student_email.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, orders: filtered });
  } catch (error: any) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// Refund Order
router.post('/orders/:id/refund', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await OrderModel.findOne({ id });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    order.payment_status = 'refunded';
    order.updated_at = new Date();
    await order.save();

    await EnrollmentModel.updateMany(
      { user_id: order.user_id, course_id: order.course_id },
      { status: 'revoked', updated_at: new Date() }
    );

    res.json({ success: true, message: 'Order refunded and course access revoked.' });
  } catch (error: any) {
    console.error('Refund order error:', error);
    res.status(500).json({ success: false, message: 'Failed to refund order.' });
  }
});

// ==========================================
// 6. COUPON MANAGEMENT
// ==========================================
router.get('/coupons', async (_req: AuthRequest, res: Response) => {
  try {
    const coupons = await CouponModel.find().sort({ created_at: -1 }).lean();
    res.json({ success: true, coupons });
  } catch (error: any) {
    console.error('Admin get coupons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
  }
});

router.post('/coupons', async (req: AuthRequest, res: Response) => {
  try {
    const { code, discount_type, discount_value, min_order_amount = 0, expires_at, usage_limit = 100 } = req.body;

    if (!code || !discount_value) {
      res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
      return;
    }

    const couponId = `cpn-${uuidv4().slice(0, 8)}`;
    const now = new Date();

    await CouponModel.create({
      id: couponId,
      code: code.trim().toUpperCase(),
      discount_type: discount_type || 'percent',
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount),
      expires_at: expires_at || null,
      usage_limit: Number(usage_limit),
      used_count: 0,
      is_active: 1,
      created_at: now
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully.', couponId });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
});

router.put('/coupons/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active, discount_value, usage_limit, expires_at } = req.body;

    const coupon = await CouponModel.findOne({ id });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }

    if (is_active !== undefined) coupon.is_active = Number(is_active ? 1 : 0);
    if (discount_value !== undefined) coupon.discount_value = Number(discount_value);
    if (usage_limit !== undefined) coupon.usage_limit = Number(usage_limit);
    if (expires_at !== undefined) coupon.expires_at = expires_at;

    await coupon.save();

    res.json({ success: true, message: 'Coupon updated successfully.' });
  } catch (error: any) {
    console.error('Update coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
});

router.delete('/coupons/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await CouponModel.deleteOne({ id });
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

// ==========================================
// 7. REVIEWS MANAGEMENT
// ==========================================
router.get('/reviews', async (_req: AuthRequest, res: Response) => {
  try {
    const reviews = await ReviewModel.find().sort({ created_at: -1 }).lean();

    const formatted = await Promise.all(
      reviews.map(async (r: any) => {
        const u = await UserModel.findOne({ id: r.user_id }).select('name email avatar').lean();
        const c = await CourseModel.findOne({ id: r.course_id }).select('title').lean();
        return {
          ...r,
          student_name: u?.name || 'Student',
          student_email: u?.email || '',
          student_avatar: u?.avatar || '',
          course_title: c?.title || 'Course'
        };
      })
    );

    res.json({ success: true, reviews: formatted });
  } catch (error: any) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

router.put('/reviews/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await ReviewModel.updateOne({ id }, { status, updated_at: new Date() });
    res.json({ success: true, message: `Review status changed to ${status}.` });
  } catch (error: any) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review status.' });
  }
});

router.delete('/reviews/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await ReviewModel.deleteOne({ id });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

// ==========================================
// 8. STUDENT & USER MANAGEMENT
// ==========================================
router.get('/students', async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;

    const filter: any = { role: 'student' };
    if (search) {
      const term = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ name: term }, { email: term }];
    }

    const students = await UserModel.find(filter).sort({ created_at: -1 }).lean();

    const formatted = await Promise.all(
      students.map(async (s: any) => {
        const enrolled_count = await EnrollmentModel.countDocuments({ user_id: s.id, status: { $ne: 'revoked' } });
        const orders = await OrderModel.find({ user_id: s.id, payment_status: 'completed' }).select('amount').lean();
        const total_spent = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

        return {
          id: s.id,
          name: s.name,
          email: s.email,
          avatar: s.avatar,
          status: s.status,
          created_at: s.created_at,
          enrolled_count,
          total_spent: Math.round(total_spent * 100) / 100
        };
      })
    );

    res.json({ success: true, students: formatted });
  } catch (error: any) {
    console.error('Admin get students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
});

// Get single student details with enrolled courses and orders
router.get('/students/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const student = await UserModel.findOne({ id, role: 'student' }).select('-password').lean();

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const rawEnrollments = await EnrollmentModel.find({ user_id: id }).sort({ enrolled_at: -1 }).lean();
    const enrollments = await Promise.all(
      rawEnrollments.map(async (e: any) => {
        const c = await CourseModel.findOne({ id: e.course_id }).select('title thumbnail').lean();
        return {
          ...e,
          course_title: c?.title || 'Course',
          course_thumbnail: c?.thumbnail || ''
        };
      })
    );

    const rawOrders = await OrderModel.find({ user_id: id }).sort({ created_at: -1 }).lean();
    const orders = await Promise.all(
      rawOrders.map(async (o: any) => {
        const c = await CourseModel.findOne({ id: o.course_id }).select('title').lean();
        return {
          ...o,
          course_title: c?.title || 'Course'
        };
      })
    );

    res.json({
      success: true,
      student: {
        ...student,
        enrollments,
        orders
      }
    });
  } catch (error: any) {
    console.error('Fetch student detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
  }
});

// Update student profile and credentials
router.put('/students/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, status, headline, bio, avatar } = req.body;

    const student = await UserModel.findOne({ id, role: 'student' });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    const emailConflict = await UserModel.findOne({ email: email.trim().toLowerCase(), id: { $ne: id } });
    if (emailConflict) {
      res.status(400).json({ success: false, message: 'This email is already in use by another user.' });
      return;
    }

    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        return;
      }
      student.password = bcrypt.hashSync(password.trim(), 10);
    }

    student.name = name.trim();
    student.email = email.trim().toLowerCase();
    student.status = status === 'suspended' ? 'suspended' : 'active';
    if (headline !== undefined) student.headline = headline;
    if (bio !== undefined) student.bio = bio;
    if (avatar !== undefined && avatar.trim() !== '') student.avatar = avatar.trim();
    student.updated_at = new Date();

    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully.',
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        headline: student.headline,
        bio: student.bio,
        status: student.status,
        created_at: student.created_at,
        updated_at: student.updated_at
      }
    });
  } catch (error: any) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
});

router.put('/students/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await UserModel.updateOne({ id }, { status, updated_at: new Date() });
    res.json({ success: true, message: `Student status updated to ${status}.` });
  } catch (error: any) {
    console.error('Update student status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update student status.' });
  }
});

// ==========================================
// 9. INSTRUCTOR MANAGEMENT
// ==========================================
router.get('/instructors', async (_req: AuthRequest, res: Response) => {
  try {
    const instructors = await InstructorModel.find().sort({ name: 1 }).lean();

    const formatted = await Promise.all(
      instructors.map(async (inst: any) => {
        const courses = await CourseModel.find({ instructor_id: inst.id }).lean();
        const courses_count = courses.length;
        const students_count = courses.reduce((sum, c) => sum + Number(c.enrolled_count || 0), 0);

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
    console.error('Admin get instructors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructors.' });
  }
});

router.post('/instructors', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, avatar, title, bio, expertise, social_links } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    const instId = `inst-${uuidv4().slice(0, 8)}`;
    const now = new Date();

    await InstructorModel.create({
      id: instId,
      name: name.trim(),
      email: email.trim(),
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      title: title || 'Course Instructor',
      bio: bio || '',
      expertise: expertise || '',
      rating: 5.0,
      students_count: 0,
      courses_count: 0,
      social_links: social_links || {},
      created_at: now
    });

    res.status(201).json({ success: true, message: 'Instructor added successfully.', instId });
  } catch (error: any) {
    console.error('Create instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to create instructor.' });
  }
});

router.put('/instructors/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, avatar, title, bio, expertise, social_links } = req.body;

    const inst = await InstructorModel.findOne({ id });
    if (!inst) {
      res.status(404).json({ success: false, message: 'Instructor not found.' });
      return;
    }

    if (name !== undefined) inst.name = name;
    if (email !== undefined) inst.email = email;
    if (avatar !== undefined) inst.avatar = avatar;
    if (title !== undefined) inst.title = title;
    if (bio !== undefined) inst.bio = bio;
    if (expertise !== undefined) inst.expertise = expertise;
    if (social_links !== undefined) inst.social_links = social_links;

    await inst.save();

    res.json({ success: true, message: 'Instructor updated successfully.' });
  } catch (error: any) {
    console.error('Update instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to update instructor.' });
  }
});

router.delete('/instructors/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await InstructorModel.deleteOne({ id });
    res.json({ success: true, message: 'Instructor deleted.' });
  } catch (error: any) {
    console.error('Delete instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete instructor.' });
  }
});

// ==========================================
// 10. CATEGORIES MANAGEMENT
// ==========================================
router.post('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, icon = 'BookOpen' } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const catId = `cat-${uuidv4().slice(0, 8)}`;
    const catSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const count = await CategoryModel.countDocuments();
    const orderNum = count + 1;

    await CategoryModel.create({
      id: catId,
      name: name.trim(),
      slug: catSlug,
      description: description || '',
      icon,
      course_count: 0,
      order_num: orderNum
    });

    res.status(201).json({ success: true, message: 'Category created successfully.', catId });
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

router.put('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon } = req.body;

    const cat = await CategoryModel.findOne({ id });
    if (!cat) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    if (name !== undefined) cat.name = name;
    if (slug !== undefined) cat.slug = slug;
    if (description !== undefined) cat.description = description;
    if (icon !== undefined) cat.icon = icon;

    await cat.save();

    res.json({ success: true, message: 'Category updated successfully.' });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
});

router.delete('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await CategoryModel.deleteOne({ id });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
});

// ==========================================
// 11. CONTENT MANAGEMENT (CMS)
// ==========================================
router.get('/content', async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await SiteContentModel.find().lean();
    const content: Record<string, any> = {};

    rows.forEach((r: any) => {
      try {
        content[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
      } catch {
        content[r.key] = r.value;
      }
    });

    res.json({ success: true, content });
  } catch (error: any) {
    console.error('Admin get content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch CMS content.' });
  }
});

router.put('/content/:key', async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const value = req.body;
    const now = new Date();

    await SiteContentModel.findOneAndUpdate(
      { key },
      { value: JSON.stringify(value), updated_at: now },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: `Content section '${key}' updated successfully.` });
  } catch (error: any) {
    console.error('Admin update content error:', error);
    res.status(500).json({ success: false, message: 'Failed to update CMS content.' });
  }
});

// ==========================================
// 12. COUNSELING & MENTORSHIP BOOKINGS (CRUD)
// ==========================================
router.get('/bookings', async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const term = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { client_name: term },
        { client_email: term },
        { client_phone: term },
        { counseling_type: term }
      ];
    }

    const bookings = await CounselingBookingModel.find(filter).sort({ created_at: -1 }).lean();

    res.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Admin get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

router.post('/bookings', async (req: AuthRequest, res: Response) => {
  try {
    const {
      client_name,
      client_email,
      client_phone,
      counseling_type,
      topic,
      preferred_date,
      preferred_time_slot,
      experience_level,
      notes,
      status,
      meeting_link,
      admin_notes
    } = req.body;

    if (!client_name || !client_email || !client_phone || !counseling_type || !preferred_date || !preferred_time_slot) {
      res.status(400).json({ success: false, message: 'Required fields missing for booking.' });
      return;
    }

    const bookingId = `bkg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date();

    const createdBooking = await CounselingBookingModel.create({
      id: bookingId,
      user_id: null,
      client_name: client_name.trim(),
      client_email: client_email.trim().toLowerCase(),
      client_phone: client_phone.trim(),
      counseling_type,
      topic: topic || '',
      preferred_date,
      preferred_time_slot,
      experience_level: experience_level || 'Beginner',
      notes: notes || '',
      status: status || 'pending',
      meeting_link: meeting_link || '',
      admin_notes: admin_notes || '',
      created_at: now,
      updated_at: now
    });

    res.status(201).json({ success: true, booking: createdBooking, message: 'Booking created successfully.' });
  } catch (error: any) {
    console.error('Admin create booking error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to create booking.' });
  }
});

router.put('/bookings/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      meeting_link,
      admin_notes,
      preferred_date,
      preferred_time_slot,
      notes,
      counseling_type
    } = req.body;

    const existing = await CounselingBookingModel.findOne({ id });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (status !== undefined) existing.status = status;
    if (meeting_link !== undefined) existing.meeting_link = meeting_link;
    if (admin_notes !== undefined) existing.admin_notes = admin_notes;
    if (preferred_date !== undefined) existing.preferred_date = preferred_date;
    if (preferred_time_slot !== undefined) existing.preferred_time_slot = preferred_time_slot;
    if (notes !== undefined) existing.notes = notes;
    if (counseling_type !== undefined) existing.counseling_type = counseling_type;
    existing.updated_at = new Date();

    await existing.save();

    res.json({ success: true, booking: existing, message: 'Booking updated successfully.' });
  } catch (error: any) {
    console.error('Admin update booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking.' });
  }
});

router.delete('/bookings/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await CounselingBookingModel.deleteOne({ id });
    res.json({ success: true, message: 'Booking removed successfully.' });
  } catch (error: any) {
    console.error('Admin delete booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete booking.' });
  }
});

export default router;
