import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonDoc extends Document {
  id: string;
  module_id: string;
  course_id: string;
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
  created_at: Date;
}

const LessonSchema = new Schema<ILessonDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    module_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    video_url: { type: String, default: null },
    media_type: { type: String, default: 'url' },
    media_name: { type: String, default: '' },
    media_size: { type: String, default: '' },
    video_duration: { type: String, default: '10:00' },
    is_preview: { type: Boolean, default: false },
    order_num: { type: Number, default: 0 },
    resources: { type: Schema.Types.Mixed, default: () => [] },
    quizzes: { type: Schema.Types.Mixed, default: () => [] },
    created_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

export const LessonModel = mongoose.models.Lesson || mongoose.model<ILessonDoc>('Lesson', LessonSchema);
