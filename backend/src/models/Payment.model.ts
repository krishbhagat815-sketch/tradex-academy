import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method?: string;
  bank?: string;
  vpa?: string;
  user_id: string;
  course_id: string;
  captured: boolean;
  raw_payload?: Record<string, any>;
  error_code?: string;
  error_description?: string;
  created_at: Date;
  updated_at: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    id: { type: String, required: true, unique: true, index: true },
    order_id: { type: String, required: true, index: true },
    razorpay_order_id: { type: String, required: true, index: true },
    razorpay_payment_id: { type: String, required: true, unique: true, index: true },
    razorpay_signature: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true
    },
    method: { type: String, default: 'upi' },
    bank: { type: String, default: null },
    vpa: { type: String, default: null },
    user_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    captured: { type: Boolean, default: false },
    raw_payload: { type: Schema.Types.Mixed, default: {} },
    error_code: { type: String, default: null },
    error_description: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
