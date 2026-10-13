import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  content: string;
  updated_at: Date;
}

const NoteSchema = new Schema<INote>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    lesson_id: { type: String, required: true, index: true },
    content: { type: String, default: '' },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updated_at' }
  }
);

export const NoteModel = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
