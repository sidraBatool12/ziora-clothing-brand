import { Schema, model, models, Types, Model } from "mongoose";

/* ---------- Review ---------- */
export interface IReview {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  orderId?: Types.ObjectId;
  rating: number;
  comment: string;
  images: { url: string; publicId: string }[];
  isVerifiedPurchase: boolean;
  adminReply?: string;
  adminRepliedAt?: Date;
  createdAt: Date;
}
const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: {
      type: [{ url: String, publicId: String }],
      default: [],
    },
    isVerifiedPurchase: { type: Boolean, default: false },
    adminReply: String,
    adminRepliedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
export const Review: Model<IReview> = models.Review || model<IReview>("Review", reviewSchema);

/* ---------- Coupon ---------- */
export interface ICoupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minimumPurchase: number;
  usageLimit: number;
  usedCount: number;
  expiry: Date;
  isActive: boolean;
  /** @deprecated use value + type */
  discount?: number;
}
const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  value: { type: Number, required: true, min: 0 },
  minimumPurchase: { type: Number, default: 0, min: 0 },
  usageLimit: { type: Number, default: 0, min: 0 },
  usedCount: { type: Number, default: 0, min: 0 },
  expiry: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  discount: { type: Number, min: 0, max: 100 },
});
export const Coupon: Model<ICoupon> = models.Coupon || model<ICoupon>("Coupon", couponSchema);

/* ---------- Wishlist ---------- */
export interface IWishlist {
  user: Types.ObjectId;
  products: Types.ObjectId[];
}
const wishlistSchema = new Schema<IWishlist>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});
export const Wishlist: Model<IWishlist> = models.Wishlist || model<IWishlist>("Wishlist", wishlistSchema);

/* ---------- Cart ---------- */
export interface ICartItem {
  product: Types.ObjectId;
  variantId?: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}
export interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}
const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: String,
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);
const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);
export const Cart: Model<ICart> = models.Cart || model<ICart>("Cart", cartSchema);

/* ---------- Notification ---------- */
export interface INotification {
  user: Types.ObjectId;
  title: string;
  body: string;
  type: "order" | "promo" | "system";
  href?: string;
  isRead: boolean;
  createdAt: Date;
}
const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ["order", "promo", "system"], default: "system" },
    href: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
export const Notification: Model<INotification> =
  models.Notification || model<INotification>("Notification", notificationSchema);

/* ---------- Payment Intent (future Stripe/PayPal) ---------- */
export interface IPayment {
  user: Types.ObjectId;
  order?: Types.ObjectId;
  provider: "cod" | "easypaisa" | "jazzcash" | "bank_transfer" | "stripe" | "paypal";
  amount: number;
  currency: string;
  status: PaymentStatusLike;
  providerReference?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
type PaymentStatusLike = "pending" | "processing" | "succeeded" | "failed" | "refunded";
const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    provider: {
      type: String,
      enum: ["cod", "easypaisa", "jazzcash", "bank_transfer", "stripe", "paypal"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },
    status: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    providerReference: String,
    metadata: { type: Map, of: String },
  },
  { timestamps: true }
);
export const Payment: Model<IPayment> = models.Payment || model<IPayment>("Payment", paymentSchema);
