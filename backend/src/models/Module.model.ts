import mongoose, { Schema, Document } from 'mongoose';

export interface IModuleDoc extends Document {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_num?: number;
  created_at: Date;
}

const ModuleSchema = new Schema<IModuleDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    course_id: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order_num: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

export const ModuleModel = mongoose.models.Module || mongoose.model<IModuleDoc>('Module', ModuleSchema);
