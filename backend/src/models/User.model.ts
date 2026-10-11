import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string; // custom id like usr-xxxx
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin' | 'instructor';
  avatar?: string;
  headline?: string;
  bio?: string;
  status: 'active' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student', index: true },
    avatar: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
