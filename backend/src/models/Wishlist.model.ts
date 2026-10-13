import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  id: string;
  user_id: string;
  course_id: string;
  created_at: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    created_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

WishlistSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

export const WishlistModel = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
