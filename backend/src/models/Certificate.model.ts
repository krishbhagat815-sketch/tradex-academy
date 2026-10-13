import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  id: string;
  certificate_code: string;
  user_id: string;
  course_id: string;
  student_name: string;
  course_title: string;
  instructor_name: string;
  issued_at: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    id: { type: String, required: true, unique: true, index: true },
    certificate_code: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    student_name: { type: String, required: true },
    course_title: { type: String, required: true },
    instructor_name: { type: String, required: true },
    issued_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'issued_at', updatedAt: false }
  }
);

export const CertificateModel = mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);
