import mongoose from 'mongoose';
import { CourseModel, ModuleModel, LessonModel } from '../models/index.js';

let isConnected = false;

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.error('\n❌ [MongoDB Atlas] MONGODB_URI is not defined in backend/.env.');
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

    return true;
  } catch (error: any) {
    console.error('❌ [MongoDB Atlas] Connection failed:', error?.message || error);
    isConnected = false;
    return false;
  }
}

/**
 * Synchronizes embedded modules and lessons in CourseModel from ModuleModel and LessonModel in MongoDB.
 */
export async function syncCourseCurriculum(courseId: string): Promise<void> {
  try {
    const modules = await ModuleModel.find({ course_id: courseId }).sort({ order_num: 1 }).lean();
    const lessons = await LessonModel.find({ course_id: courseId }).sort({ order_num: 1 }).lean();

    const courseModules = modules.map((m: any) => {
      const moduleLessons = lessons
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
          resources: Array.isArray(l.resources) ? l.resources : [],
          quizzes: Array.isArray(l.quizzes) ? l.quizzes : []
        }));

      return {
        id: m.id,
        title: m.title,
        description: m.description || '',
        order_num: Number(m.order_num || 0),
        lessons: moduleLessons
      };
    });

    await CourseModel.findOneAndUpdate(
      { id: courseId },
      { modules: courseModules, updated_at: new Date() }
    );
  } catch (err: any) {
    console.error(`⚠️ [MongoDB Atlas] Failed to sync course curriculum for ${courseId}:`, err?.message || err);
  }
}
