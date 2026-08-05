import { connectDB } from "@/lib/db";
import { Product, Category, IProduct } from "@/models/catalog";
import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  buildProductImages,
} from "@/lib/mock-catalog";

export type ProductLean = IProduct & { _id: string };

/** Stable 24-char hex ids for in-memory fallback only. */
function mockId(key: string): string {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const base = (hash >>> 0).toString(16).padStart(8, "0");
  let out = base;
  while (out.length < 24) {
    hash = Math.imul(hash ^ out.length, 16777619);
    out += (hash >>> 0).toString(16).padStart(8, "0");
  }
  return out.slice(0, 24);
}

const MOCK_CATEGORY_DOCS = MOCK_CATEGORIES.map((c) => ({
  _id: mockId(`cat-${c.slug}`),
  name: c.name,
  slug: c.slug,
}));

const categoryIdBySlug = new Map(MOCK_CATEGORY_DOCS.map((c) => [c.slug, c._id]));

export const MEMORY_MOCK_PRODUCTS: ProductLean[] = MOCK_PRODUCTS.map((p, index) => {
  const { thumbnail, images } = buildProductImages(p.imageSeed, p.name);
  const created = new Date(Date.UTC(2026, 0, 20 + index)).toISOString();
  return {
    _id: mockId(`prod-${p.sku}`),
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.description.slice(0, 120),
    price: p.price,
    discountPrice: p.discountPrice,
    category: categoryIdBySlug.get(p.categorySlug) as unknown as IProduct["category"],
    productLine: p.productLine,
    brand: "ZIORA",
    sku: p.sku,
    sizes: p.sizes,
    colors: p.colors,
    material: p.fabric,
    fabric: p.fabric,
    careInstructions: p.careInstructions,
    tags: [p.productLine],
    images,
    thumbnail,
    variants: [],
    stockQuantity: p.stockQuantity,
    lowStockThreshold: 5,
    isNewArrival: p.isNewArrival,
    isFeatured: p.isFeatured,
    isTrending: false,
    isBestSeller: false,
    publishStatus: "published",
    seoKeywords: [],
    ratingAverage: 4.2 + (index % 7) / 10,
    ratingCount: 12 + (index % 40),
    createdAt: created as unknown as Date,
    updatedAt: created as unknown as Date,
  } as ProductLean;
});

function serialize<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function tryConnect(): Promise<boolean> {
  try {
    await connectDB();
    return true;
  } catch {
    return false;
  }
}

export async function getFeaturedProducts(limit = 8): Promise<ProductLean[]> {
  if (await tryConnect()) {
    try {
      const docs = await Product.find({
        isFeatured: true,
        publishStatus: { $nin: ["draft", "hidden", "archived"] },
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      if (docs.length) return serialize<ProductLean[]>(docs);
    } catch {
      /* use mocks */
    }
  }
  return serialize<ProductLean[]>(MEMORY_MOCK_PRODUCTS.filter((p) => p.isFeatured).slice(0, limit));
}

export async function getNewArrivals(limit = 8): Promise<ProductLean[]> {
  if (await tryConnect()) {
    try {
      const docs = await Product.find({ isNewArrival: true, publishStatus: { $ne: "archived" } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      if (docs.length) return serialize<ProductLean[]>(docs);
    } catch {
      /* use mocks */
    }
  }
  return serialize<ProductLean[]>(MEMORY_MOCK_PRODUCTS.filter((p) => p.isNewArrival).slice(0, limit));
}

export interface ShopFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  search?: string;
  page?: number;
}

function filterMocks(filters: ShopFilters) {
  let list = [...MEMORY_MOCK_PRODUCTS];
  if (filters.category) {
    list = list.filter((p) => String(p.category) === filters.category);
  }
  if (filters.minPrice) list = list.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice) list = list.filter((p) => p.price <= filters.maxPrice!);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.productLine.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }
  if (filters.sort === "price_asc") list.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price_desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return list;
}

export async function getProducts(filters: ShopFilters) {
  const page = filters.page || 1;
  const perPage = 12;

  if (await tryConnect()) {
    try {
      const query: Record<string, unknown> = {
        publishStatus: { $nin: ["draft", "hidden", "archived"] },
      };
      if (filters.category) query.category = filters.category;
      if (filters.minPrice || filters.maxPrice) {
        query.price = {
          ...(filters.minPrice && { $gte: filters.minPrice }),
          ...(filters.maxPrice && { $lte: filters.maxPrice }),
        };
      }
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
          { productLine: { $regex: filters.search, $options: "i" } },
          { sku: { $regex: filters.search, $options: "i" } },
        ];
      }
      const sortMap: Record<string, Record<string, 1 | -1>> = {
        newest: { createdAt: -1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 },
      };
      const sort = sortMap[filters.sort || "newest"];
      const [docs, total] = await Promise.all([
        Product.find(query).sort(sort).skip((page - 1) * perPage).limit(perPage).lean(),
        Product.countDocuments(query),
      ]);
      if (total > 0) {
        return { products: serialize<ProductLean[]>(docs), total, page, perPage };
      }
    } catch {
      /* use mocks */
    }
  }

  const list = filterMocks(filters);
  const start = (page - 1) * perPage;
  return {
    products: serialize<ProductLean[]>(list.slice(start, start + perPage)),
    total: list.length,
    page,
    perPage,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductLean | null> {
  if (await tryConnect()) {
    try {
      const doc = await Product.findOne({
        slug,
        publishStatus: { $nin: ["draft", "hidden", "archived"] },
      })
        .populate("category")
        .lean();
      if (doc) return serialize<ProductLean>(doc);
    } catch {
      /* use mocks */
    }
  }
  const mock = MEMORY_MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!mock) return null;
  const cat = MOCK_CATEGORY_DOCS.find((c) => c._id === String(mock.category));
  return serialize<ProductLean>({
    ...mock,
    category: cat ? { _id: cat._id, name: cat.name, slug: cat.slug } : mock.category,
  } as ProductLean);
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4
): Promise<ProductLean[]> {
  if (await tryConnect()) {
    try {
      const docs = await Product.find({
        category: categoryId,
        _id: { $ne: excludeId },
        publishStatus: { $nin: ["draft", "hidden", "archived"] },
      })
        .limit(limit)
        .lean();
      if (docs.length) return serialize<ProductLean[]>(docs);
    } catch {
      /* use mocks */
    }
  }
  return serialize<ProductLean[]>(
    MEMORY_MOCK_PRODUCTS.filter(
      (p) => String(p.category) === categoryId && p._id !== excludeId
    ).slice(0, limit)
  );
}

export async function getStorefrontCategories() {
  if (await tryConnect()) {
    try {
      const cats = await Category.find().limit(8).lean();
      if (cats.length) {
        const counts = await Promise.all(
          cats.map((c) => Product.countDocuments({ category: c._id }))
        );
        return cats.map((c, i) => ({
          _id: c._id.toString(),
          name: c.name,
          count: counts[i],
        }));
      }
    } catch {
      /* use mocks */
    }
  }
  return MOCK_CATEGORY_DOCS.map((c) => ({
    _id: c._id,
    name: c.name,
    count: MEMORY_MOCK_PRODUCTS.filter((p) => String(p.category) === c._id).length,
  }));
}
