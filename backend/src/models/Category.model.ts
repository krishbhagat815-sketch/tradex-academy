import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  course_count?: number;
  order_num?: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    course_count: { type: Number, default: 0 },
    order_num: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
