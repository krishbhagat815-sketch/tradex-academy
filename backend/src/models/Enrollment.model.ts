import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  id: string;
  user_id: string;
  course_id: string;
  order_id?: string;
  enrolled_at: Date;
  progress_percent: number;
  last_lesson_id?: string;
  completed_at?: Date | null;
  status: 'active' | 'revoked' | 'completed';
  created_at: Date;
  updated_at: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    order_id: { type: String, default: null, index: true },
    enrolled_at: { type: Date, default: Date.now },
    progress_percent: { type: Number, default: 0, min: 0, max: 100 },
    last_lesson_id: { type: String, default: null },
    completed_at: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'revoked', 'completed'],
      default: 'active',
      index: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Compound unique index to guarantee no duplicate enrollment for the same course and user
EnrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

export const EnrollmentModel = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
