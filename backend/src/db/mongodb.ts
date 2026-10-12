import mongoose from 'mongoose';
import { UserModel, CourseModel, OrderModel, PaymentModel, EnrollmentModel } from '../models/index.js';
import { query, queryOne } from './database.js';

let isConnected = false;

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.warn('\n⚠️ [MongoDB Atlas] MONGODB_URI is not defined in backend/.env.');
    console.warn('   Add your MongoDB Atlas connection string to backend/.env:');
    console.warn('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tradex_lms?retryWrites=true&w=majority\n');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('🍃 [MongoDB Atlas] Connected successfully to database:', mongoose.connection.name);

    // Setup event listeners for connection monitoring
    mongoose.connection.on('error', (err) => {
      console.error('❌ [MongoDB Atlas] Connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MongoDB Atlas] Disconnected from database.');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [MongoDB Atlas] Reconnected successfully.');
      isConnected = true;
    });

    // Auto-migrate / seed existing data from SQLite into MongoDB Atlas if empty
    await syncSQLiteToMongo();

    return true;
  } catch (error: any) {
    console.error('❌ [MongoDB Atlas] Connection failed:', error?.message || error);
    console.warn('   Continuing with local SQLite database fallback until Atlas credentials are set.\n');
    isConnected = false;
    return false;
  }
}

/**
 * Automatically seeds / migrates courses, modules, lessons and users from SQLite to MongoDB Atlas
 * if MongoDB Atlas collection is currently empty.
 */
export async function syncSQLiteToMongo(): Promise<void> {
  if (!isMongoConnected()) return;

  try {
    // 1. Sync Courses
    const courseCount = await CourseModel.countDocuments();
    if (courseCount === 0) {
      console.log('🔄 [MongoDB Atlas] Syncing courses and curriculum from local storage to Atlas...');
      const sqlCourses = query('SELECT * FROM courses');
      const sqlModules = query('SELECT * FROM modules ORDER BY order_num ASC');
      const sqlLessons = query('SELECT * FROM lessons ORDER BY order_num ASC');

      for (const c of sqlCourses) {
        const cModules = sqlModules
          .filter((m: any) => m.course_id === c.id)
          .map((m: any) => {
            const mLessons = sqlLessons
              .filter((l: any) => l.module_id === m.id)
              .map((l: any) => ({
                id: l.id,
                title: l.title,
                description: l.description || '',
                video_url: l.video_url || null,
                media_type: l.media_type || 'url',
                media_name: l.media_name || '',
                media_size: l.media_size || '',
                video_duration: l.video_duration || '10:00',
                is_preview: Boolean(l.is_preview),
                order_num: Number(l.order_num || 0),
                resources: JSON.parse(l.resources || '[]'),
                quizzes: JSON.parse(l.quizzes || '[]')
              }));

            return {
              id: m.id,
              title: m.title,
              description: m.description || '',
              order_num: Number(m.order_num || 0),
              lessons: mLessons
            };
          });

        await CourseModel.findOneAndUpdate(
          { id: c.id },
          {
            id: c.id,
            title: c.title,
            slug: c.slug,
            short_description: c.short_description || '',
            description: c.description || '',
            category_id: c.category_id,
            instructor_id: c.instructor_id,
            thumbnail: c.thumbnail || '',
            preview_video_url: c.preview_video_url || '',
            price: Number(c.price || 0),
            discount_price: c.discount_price != null ? Number(c.discount_price) : null,
            difficulty_level: c.difficulty_level || 'Beginner',
            duration: c.duration || '0 hours',
            language: c.language || 'Gujarati',
            learning_outcomes: JSON.parse(c.learning_outcomes || '[]'),
            requirements: JSON.parse(c.requirements || '[]'),
            target_audience: JSON.parse(c.target_audience || '[]'),
            tags: JSON.parse(c.tags || '[]'),
            status: c.status || 'published',
            featured: Boolean(c.featured),
            popular: Boolean(c.popular),
            is_new: Boolean(c.is_new),
            enrolled_count: Number(c.enrolled_count || 0),
            rating: Number(c.rating || 5.0),
            review_count: Number(c.review_count || 0),
            modules: cModules,
            created_at: new Date(c.created_at || Date.now()),
            updated_at: new Date(c.updated_at || Date.now())
          },
          { upsert: true, new: true }
        );
      }
      console.log(`✅ [MongoDB Atlas] Synced ${sqlCourses.length} courses to Atlas.`);
    }

    // 2. Sync Users
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      const sqlUsers = query('SELECT * FROM users');
      for (const u of sqlUsers) {
        await UserModel.findOneAndUpdate(
          { id: u.id },
          {
            id: u.id,
            name: u.name,
            email: u.email.toLowerCase(),
            password: u.password,
            role: u.role,
            avatar: u.avatar || '',
            headline: u.headline || '',
            bio: u.bio || '',
            status: u.status || 'active',
            created_at: new Date(u.created_at || Date.now()),
            updated_at: new Date(u.updated_at || Date.now())
          },
          { upsert: true, new: true }
        );
      }
      console.log(`✅ [MongoDB Atlas] Synced ${sqlUsers.length} users to Atlas.`);
    }

    // 3. Sync Existing Orders & Enrollments if any
    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0) {
      const sqlOrders = query('SELECT * FROM orders');
      for (const o of sqlOrders) {
        await OrderModel.findOneAndUpdate(
          { id: o.id },
          {
            id: o.id,
            order_number: o.order_number,
            user_id: o.user_id,
            course_id: o.course_id,
            amount: Number(o.amount || 0),
            discount_amount: Number(o.discount_amount || 0),
            coupon_code: o.coupon_code,
            payment_method: o.payment_method || 'UPI',
            payment_status: o.payment_status || 'completed',
            billing_info: JSON.parse(o.billing_info || '{}'),
            transaction_id: o.transaction_id,
            razorpay_order_id: JSON.parse(o.billing_info || '{}').razorpay_order_id || null,
            razorpay_payment_id: o.transaction_id,
            created_at: new Date(o.created_at || Date.now()),
            updated_at: new Date(o.created_at || Date.now())
          },
          { upsert: true, new: true }
        );
      }
    }

    const enrollmentCount = await EnrollmentModel.countDocuments();
    if (enrollmentCount === 0) {
      const sqlEnrollments = query('SELECT * FROM enrollments');
      for (const e of sqlEnrollments) {
        await EnrollmentModel.findOneAndUpdate(
          { user_id: e.user_id, course_id: e.course_id },
          {
            id: e.id,
            user_id: e.user_id,
            course_id: e.course_id,
            order_id: e.order_id,
            enrolled_at: new Date(e.enrolled_at || Date.now()),
            progress_percent: Number(e.progress_percent || 0),
            last_lesson_id: e.last_lesson_id,
            completed_at: e.completed_at ? new Date(e.completed_at) : null,
            status: e.status || 'active',
            created_at: new Date(e.enrolled_at || Date.now()),
            updated_at: new Date(e.enrolled_at || Date.now())
          },
          { upsert: true, new: true }
        );
      }
    }
  } catch (syncError: any) {
    console.warn('⚠️ [MongoDB Atlas] Auto-sync warning:', syncError?.message || syncError);
  }
}

/**
 * Synchronizes a single course and its updated curriculum (modules & lessons) to MongoDB Atlas.
 */
export async function syncSingleCourseToMongo(courseId: string): Promise<void> {
  if (!isMongoConnected()) return;

  try {
    const c = queryOne('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!c) return;

    const sqlModules = query('SELECT * FROM modules WHERE course_id = ? ORDER BY order_num ASC', [courseId]);
    const sqlLessons = query('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num ASC', [courseId]);

    const cModules = sqlModules.map((m: any) => {
      const mLessons = sqlLessons
        .filter((l: any) => l.module_id === m.id)
        .map((l: any) => ({
          id: l.id,
          title: l.title,
          description: l.description || '',
          video_url: l.video_url || null,
          media_type: l.media_type || 'url',
          media_name: l.media_name || '',
          media_size: l.media_size || '',
          video_duration: l.video_duration || '10:00',
          is_preview: Boolean(l.is_preview),
          order_num: Number(l.order_num || 0),
          resources: JSON.parse(l.resources || '[]'),
          quizzes: JSON.parse(l.quizzes || '[]')
        }));

      return {
        id: m.id,
        title: m.title,
        description: m.description || '',
        order_num: Number(m.order_num || 0),
        lessons: mLessons
      };
    });

    await CourseModel.findOneAndUpdate(
      { id: c.id },
      {
        id: c.id,
        title: c.title,
        slug: c.slug,
        short_description: c.short_description || '',
        description: c.description || '',
        category_id: c.category_id,
        instructor_id: c.instructor_id,
        thumbnail: c.thumbnail || '',
        preview_video_url: c.preview_video_url || '',
        price: Number(c.price || 0),
        discount_price: c.discount_price != null ? Number(c.discount_price) : null,
        difficulty_level: c.difficulty_level || 'Beginner',
        duration: c.duration || '0 hours',
        language: c.language || 'Gujarati',
        learning_outcomes: JSON.parse(c.learning_outcomes || '[]'),
        requirements: JSON.parse(c.requirements || '[]'),
        target_audience: JSON.parse(c.target_audience || '[]'),
        tags: JSON.parse(c.tags || '[]'),
        status: c.status || 'published',
        featured: Boolean(c.featured),
        popular: Boolean(c.popular),
        is_new: Boolean(c.is_new),
        enrolled_count: Number(c.enrolled_count || 0),
        rating: Number(c.rating || 5.0),
        review_count: Number(c.review_count || 0),
        modules: cModules,
        updated_at: new Date()
      },
      { upsert: true }
    );
  } catch (err: any) {
    console.error(`⚠️ [MongoDB Atlas] Failed to sync course ${courseId}:`, err?.message || err);
  }
}

