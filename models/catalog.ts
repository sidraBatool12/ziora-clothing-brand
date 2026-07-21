import { Schema, model, models, Types, Model } from "mongoose";

export interface ICategory { name: string; slug: string; createdAt: Date; }
const categorySchema = new Schema<ICategory>(
  { name: { type: String, required: true }, slug: { type: String, required: true, unique: true, lowercase: true, index: true } },
  { timestamps: { createdAt: true, updatedAt: false } }
);
export const Category: Model<ICategory> = models.Category || model<ICategory>("Category", categorySchema);

export interface IProductImage { url: string; publicId: string; alt?: string; }

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number; // 0 if no discount
  category: Types.ObjectId;
  productLine: string; // e.g. "Everyday", "Premium Abayas", "Luxury Collection"
  sku: string;
  sizes: string[];
  colors: string[];
  fabric?: string;
  careInstructions?: string;
  images: IProductImage[];
  thumbnail: IProductImage;
  stockQuantity: number;
  isNewArrival: boolean;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  { url: { type: String, required: true }, publicId: { type: String, required: true }, alt: String },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    productLine: { type: String, default: "Everyday" },
    sku: { type: String, required: true, unique: true },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    fabric: String,
    careInstructions: String,
    images: { type: [productImageSchema], default: [] },
    thumbnail: { type: productImageSchema, required: true },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    isNewArrival: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
productSchema.index({ name: "text", description: "text" });
productSchema.index({ stockQuantity: 1 }); // low-stock / out-of-stock queries

export const Product: Model<IProduct> = models.Product || model<IProduct>("Product", productSchema);
