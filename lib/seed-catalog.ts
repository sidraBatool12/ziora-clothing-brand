import { connectDB } from "@/lib/db";
import { Category, Product } from "@/models/catalog";
import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  buildProductImages,
} from "@/lib/mock-catalog";

let seedPromise: Promise<void> | null = null;

export async function ensureMockCatalog(options?: { force?: boolean }) {
  if (seedPromise && !options?.force) return seedPromise;

  const run = async () => {
    await connectDB();

    if (!options?.force) {
      const existing = await Product.countDocuments({ sku: { $regex: /^ZR-/ } });
      if (existing >= MOCK_PRODUCTS.length) return;
    }

    if (options?.force) {
      await Product.deleteMany({ sku: { $regex: /^ZR-/ } });
      await Category.deleteMany({
        slug: { $in: MOCK_CATEGORIES.map((c) => c.slug) },
      });
    }

    const bySlug = new Map<string, unknown>();
    for (const cat of MOCK_CATEGORIES) {
      const doc = await Category.findOneAndUpdate(
        { slug: cat.slug },
        { name: cat.name, slug: cat.slug },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      bySlug.set(cat.slug, doc._id);
    }

    for (const p of MOCK_PRODUCTS) {
      const categoryId = bySlug.get(p.categorySlug);
      if (!categoryId) throw new Error(`Missing category ${p.categorySlug}`);
      const { thumbnail, images } = buildProductImages(p.imageSeed, p.name);
      await Product.findOneAndUpdate(
        { sku: p.sku },
        {
          $set: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            discountPrice: p.discountPrice,
            category: categoryId,
            productLine: p.productLine,
            sku: p.sku,
            sizes: p.sizes,
            colors: p.colors,
            fabric: p.fabric,
            careInstructions: p.careInstructions,
            thumbnail,
            images,
            stockQuantity: p.stockQuantity,
            isNewArrival: p.isNewArrival,
            isFeatured: p.isFeatured,
            ratingAverage: 4.2 + (p.sku.charCodeAt(p.sku.length - 1) % 7) / 10,
            ratingCount: 12 + (p.sku.charCodeAt(p.sku.length - 2) % 40),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  };

  seedPromise = run();
  try {
    await seedPromise;
  } catch (err) {
    seedPromise = null;
    throw err;
  }
}
