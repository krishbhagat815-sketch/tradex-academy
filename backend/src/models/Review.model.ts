import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    id: { type: String, required: true, unique: true, index: true },
    course_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review_text: { type: String, required: true },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
