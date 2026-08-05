import { Schema, model, models, Types, Model } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  parent?: Types.ObjectId | null;
  createdAt: Date;
}
const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
export const Category: Model<ICategory> = models.Category || model<ICategory>("Category", categorySchema);

export interface IProductImage {
  url: string;
  publicId: string;
  alt?: string;
  isThumbnail?: boolean;
  sortOrder?: number;
}

export interface IProductVariant {
  sku: string;
  color?: string;
  size?: string;
  price?: number;
  stock: number;
  images: IProductImage[];
}

export type PublishStatus = "draft" | "published" | "hidden" | "archived";

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice: number;
  costPrice?: number;
  category: Types.ObjectId;
  subcategory?: Types.ObjectId;
  productLine: string;
  brand?: string;
  sku: string;
  barcode?: string;
  sizes: string[];
  colors: string[];
  material?: string;
  fabric?: string;
  weight?: number;
  careInstructions?: string;
  tags: string[];
  images: IProductImage[];
  thumbnail: IProductImage;
  videoUrl?: string;
  variants: IProductVariant[];
  stockQuantity: number;
  lowStockThreshold: number;
  isNewArrival: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  publishStatus: PublishStatus;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: String,
    isThumbnail: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true },
    color: String,
    size: String,
    price: Number,
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [productImageSchema], default: [] },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    costPrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Category" },
    productLine: { type: String, default: "Everyday" },
    brand: { type: String, default: "ZIORA", index: true },
    sku: { type: String, required: true, unique: true },
    barcode: String,
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    material: String,
    fabric: String,
    weight: Number,
    careInstructions: String,
    tags: { type: [String], default: [] },
    images: { type: [productImageSchema], default: [] },
    thumbnail: { type: productImageSchema, required: true },
    videoUrl: String,
    variants: { type: [productVariantSchema], default: [] },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    isNewArrival: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    publishStatus: {
      type: String,
      enum: ["draft", "published", "hidden", "archived"],
      default: "published",
      index: true,
    },
    seoTitle: String,
    seoDescription: String,
    seoKeywords: { type: [String], default: [] },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
productSchema.index({ name: "text", description: "text", tags: "text", brand: "text" });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ "variants.sku": 1 });

export const Product: Model<IProduct> = models.Product || model<IProduct>("Product", productSchema);
