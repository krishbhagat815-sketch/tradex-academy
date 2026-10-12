import mongoose, { Schema, Document } from 'mongoose';

export interface IPopup extends Document {
  id: string;
  title: string;
  description?: string;
  type: string;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  badge_text?: string;
  bg_color?: string;
  text_color?: string;
  layout?: string;
  animation?: string;
  trigger_type?: string;
  trigger_value?: number;
  target_page?: string;
  target_audience?: string;
  frequency?: string;
  priority?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  views_count: number;
  clicks_count: number;
  created_at: Date;
  updated_at: Date;
}

const PopupSchema = new Schema<IPopup>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, default: 'custom', index: true },
    image_url: { type: String, default: '' },
    cta_text: { type: String, default: 'Learn More' },
    cta_url: { type: String, default: '/courses' },
    badge_text: { type: String, default: '' },
    bg_color: { type: String, default: '#ffffff' },
    text_color: { type: String, default: '#0f172a' },
    layout: { type: String, default: 'modal' },
    animation: { type: String, default: 'fade' },
    trigger_type: { type: String, default: 'delay' },
    trigger_value: { type: Number, default: 3 },
    target_page: { type: String, default: 'all' },
    target_audience: { type: String, default: 'all' },
    frequency: { type: String, default: 'once_per_session' },
    priority: { type: Number, default: 1 },
    start_date: { type: String, default: '' },
    end_date: { type: String, default: '' },
    is_active: { type: Boolean, default: true, index: true },
    views_count: { type: Number, default: 0 },
    clicks_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const PopupModel = mongoose.models.Popup || mongoose.model<IPopup>('Popup', PopupSchema);
