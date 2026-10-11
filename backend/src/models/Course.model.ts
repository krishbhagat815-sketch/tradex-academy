import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  id: string;
  title: string;
  description?: string;
  video_url?: string | null;
  media_type?: string;
  media_name?: string;
  media_size?: string;
  video_duration?: string;
  is_preview?: boolean;
  order_num?: number;
  resources?: any[];
  quizzes?: any[];
}

export interface IModule {
  id: string;
  title: string;
  description?: string;
  order_num?: number;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  category_id?: string;
  instructor_id?: string;
  thumbnail?: string;
  preview_video_url?: string;
  price: number;
  discount_price?: number;
  difficulty_level: string;
  duration?: string;
  language?: string;
  learning_outcomes?: string[];
  requirements?: string[];
  target_audience?: string[];
  tags?: string[];
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  popular?: boolean;
  is_new?: boolean;
  enrolled_count: number;
  rating: number;
  review_count: number;
  modules?: IModule[];
  created_at: Date;
  updated_at: Date;
}

const LessonSchema = new Schema<ILesson>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  video_url: { type: String, default: null },
  media_type: { type: String, default: 'url' },
  media_name: { type: String, default: '' },
  media_size: { type: String, default: '' },
  video_duration: { type: String, default: '10:00' },
  is_preview: { type: Boolean, default: false },
  order_num: { type: Number, default: 0 },
  resources: { type: [Schema.Types.Mixed], default: [] },
  quizzes: { type: [Schema.Types.Mixed], default: [] }
}, { _id: false });

const ModuleSchema = new Schema<IModule>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order_num: { type: Number, default: 0 },
  lessons: { type: [LessonSchema], default: [] }
}, { _id: false });

const CourseSchema = new Schema<ICourse>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    short_description: { type: String, default: '' },
    description: { type: String, default: '' },
    category_id: { type: String, index: true },
    instructor_id: { type: String, index: true },
    thumbnail: { type: String, default: '' },
    preview_video_url: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    discount_price: { type: Number, default: null },
    difficulty_level: { type: String, default: 'Beginner' },
    duration: { type: String, default: '0 hours' },
    language: { type: String, default: 'Gujarati' },
    learning_outcomes: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    target_audience: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published', index: true },
    featured: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    is_new: { type: Boolean, default: false },
    enrolled_count: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    review_count: { type: Number, default: 0 },
    modules: { type: [ModuleSchema], default: [] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const CourseModel = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
