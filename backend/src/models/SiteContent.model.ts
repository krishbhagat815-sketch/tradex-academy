import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteContent extends Document {
  key: string;
  value: string;
  updated_at: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: String, required: true },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updated_at' }
  }
);

export const SiteContentModel = mongoose.models.SiteContent || mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);
