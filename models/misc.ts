import { Schema, model, models, Types, Model } from "mongoose";

/* ---------- Review ---------- */
export interface IReview {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}
const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
export const Review: Model<IReview> = models.Review || model<IReview>("Review", reviewSchema);

/* ---------- Coupon ---------- */
export interface ICoupon {
  code: string;
  discount: number; // percentage
  expiry: Date;
  isActive: boolean;
}
const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount: { type: Number, required: true, min: 0, max: 100 },
  expiry: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});
export const Coupon: Model<ICoupon> = models.Coupon || model<ICoupon>("Coupon", couponSchema);

/* ---------- Wishlist ---------- */
export interface IWishlist { user: Types.ObjectId; products: Types.ObjectId[]; }
const wishlistSchema = new Schema<IWishlist>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});
export const Wishlist: Model<IWishlist> = models.Wishlist || model<IWishlist>("Wishlist", wishlistSchema);
