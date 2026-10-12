import mongoose, { Schema, Document } from 'mongoose';

export interface ICounselingBooking extends Document {
  id: string; // custom id like bkg-xxxx
  user_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  counseling_type: string;
  topic?: string;
  preferred_date: string;
  preferred_time_slot: string;
  experience_level?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meeting_link?: string;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

const CounselingBookingSchema = new Schema<ICounselingBooking>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, default: null, index: true },
    client_name: { type: String, required: true, trim: true },
    client_email: { type: String, required: true, lowercase: true, trim: true, index: true },
    client_phone: { type: String, required: true, trim: true },
    counseling_type: { type: String, required: true },
    topic: { type: String, default: '' },
    preferred_date: { type: String, required: true },
    preferred_time_slot: { type: String, required: true },
    experience_level: { type: String, default: 'Beginner' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    meeting_link: { type: String, default: '' },
    admin_notes: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const CounselingBookingModel =
  mongoose.models.CounselingBooking ||
  mongoose.model<ICounselingBooking>('CounselingBooking', CounselingBookingSchema);
