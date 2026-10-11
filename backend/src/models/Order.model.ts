import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  id: string;
  order_number: string;
  user_id: string;
  course_id: string;
  amount: number;
  discount_amount: number;
  coupon_code?: string | null;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  billing_info?: Record<string, any>;
  transaction_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  currency: string;
  error_description?: string;
  created_at: Date;
  updated_at: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true, index: true },
    order_number: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    discount_amount: { type: Number, default: 0 },
    coupon_code: { type: String, default: null },
    payment_method: { type: String, default: 'UPI' },
    payment_status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    billing_info: { type: Schema.Types.Mixed, default: {} },
    transaction_id: { type: String, default: null },
    razorpay_order_id: { type: String, default: null, index: true },
    razorpay_payment_id: { type: String, default: null, index: true },
    razorpay_signature: { type: String, default: null },
    currency: { type: String, default: 'INR' },
    error_description: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
