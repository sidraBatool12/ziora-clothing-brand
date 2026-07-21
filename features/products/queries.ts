import { connectDB } from "@/lib/db";
import { Product, IProduct } from "@/models/catalog";

export type ProductLean = IProduct & { _id: string };

export async function getFeaturedProducts(limit = 8): Promise<ProductLean[]> {
  await connectDB();
  const docs = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(limit).lean();
  return JSON.parse(JSON.stringify(docs));
}
export async function getNewArrivals(limit = 8): Promise<ProductLean[]> {
  await connectDB();
  const docs = await Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(limit).lean();
  return JSON.parse(JSON.stringify(docs));
}

export interface ShopFilters {
  category?: string; minPrice?: number; maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc"; search?: string; page?: number;
}

export async function getProducts(filters: ShopFilters) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters.category) query.category = filters.category;
  if (filters.minPrice || filters.maxPrice) {
    query.price = { ...(filters.minPrice && { $gte: filters.minPrice }), ...(filters.maxPrice && { $lte: filters.maxPrice }) };
  }
  if (filters.search) query.$text = { $search: filters.search };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 },
  };
  const sort = sortMap[filters.sort || "newest"];
  const page = filters.page || 1;
  const perPage = 12;

  const [docs, total] = await Promise.all([
    Product.find(query).sort(sort).skip((page - 1) * perPage).limit(perPage).lean(),
    Product.countDocuments(query),
  ]);
  return { products: JSON.parse(JSON.stringify(docs)) as ProductLean[], total, page, perPage };
}

export async function getProductBySlug(slug: string): Promise<ProductLean | null> {
  await connectDB();
  const doc = await Product.findOne({ slug }).populate("category").lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4): Promise<ProductLean[]> {
  await connectDB();
  const docs = await Product.find({ category: categoryId, _id: { $ne: excludeId } }).limit(limit).lean();
  return JSON.parse(JSON.stringify(docs));
}
