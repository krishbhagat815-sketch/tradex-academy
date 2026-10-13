import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  expires_at?: string;
  usage_limit: number;
  used_count: number;
  is_active: number;
  created_at: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discount_type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    discount_value: { type: Number, required: true },
    min_order_amount: { type: Number, default: 0 },
    expires_at: { type: String, default: null },
    usage_limit: { type: Number, default: 100 },
    used_count: { type: Number, default: 0 },
    is_active: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

export const CouponModel = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
