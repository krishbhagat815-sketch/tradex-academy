import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonProgress extends Document {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: number;
  completed_at: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    lesson_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    completed: { type: Number, default: 1 },
    completed_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'completed_at', updatedAt: false }
  }
);

LessonProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

export const LessonProgressModel = mongoose.models.LessonProgress || mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);
