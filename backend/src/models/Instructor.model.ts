import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructor extends Document {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  title?: string;
  bio?: string;
  expertise?: string;
  rating?: number;
  students_count?: number;
  courses_count?: number;
  social_links?: any;
  created_at: Date;
}

const InstructorSchema = new Schema<IInstructor>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    expertise: { type: String, default: '' },
    rating: { type: Number, default: 4.9 },
    students_count: { type: Number, default: 0 },
    courses_count: { type: Number, default: 0 },
    social_links: { type: Schema.Types.Mixed, default: () => ({}) },
    created_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

export const InstructorModel = mongoose.models.Instructor || mongoose.model<IInstructor>('Instructor', InstructorSchema);
