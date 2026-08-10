import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/catalog";
import { getAdminOrNull } from "@/lib/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils";

// Relative paths come from the local storage fallback used in development.
const imageUrl = z
  .string()
  .min(1)
  .refine((value) => /^https?:\/\//.test(value) || value.startsWith("/"));

const sizePriceSchema = z.object({
  size: z.string().trim().min(1),
  price: z.number().positive(),
});

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive(),
  discountPrice: z.number().min(0).default(0),
  costPrice: z.number().min(0).optional(),
  category: z.string().min(1),
  productLine: z.string().default("Everyday"),
  stockQuantity: z.number().min(0),
  lowStockThreshold: z.number().min(0).default(5),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizePrices: z.array(sizePriceSchema).default([]),
  material: z.string().optional(),
  fabric: z.string().optional(),
  careInstructions: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  isTrending: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  publishStatus: z.enum(["draft", "published", "hidden", "archived"]).default("published"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).default([]),
  thumbnailUrl: imageUrl,
  thumbnailPublicId: z.string().min(1),
  images: z
    .array(
      z.object({
        url: imageUrl,
        publicId: z.string().min(1),
        alt: z.string().optional(),
        sortOrder: z.number().int().min(0).optional(),
        price: z.number().positive().optional(),
        sizePrices: z.array(sizePriceSchema).default([]),
      })
    )
    .max(20)
    .default([]),
});

export async function GET(req: NextRequest) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const filter = req.nextUrl.searchParams.get("filter");
  const query: Record<string, unknown> = {};
  if (filter === "low-stock") query.stockQuantity = { $gt: 0, $lte: LOW_STOCK_THRESHOLD };
  if (filter === "out-of-stock") query.stockQuantity = 0;

  const products = await Product.find(query).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const { thumbnailUrl, thumbnailPublicId, images, ...rest } = parsed.data;
  const cover = images.find((image) => image.publicId === thumbnailPublicId) || images[0];

  await connectDB();
  try {
    const product = await Product.create({
      ...rest,
      images: images.map((image, index) => ({
        ...image,
        sortOrder: image.sortOrder ?? index,
        isThumbnail: image.publicId === thumbnailPublicId,
        sizePrices: image.sizePrices || [],
      })),
      thumbnail: {
        url: thumbnailUrl,
        publicId: thumbnailPublicId,
        alt: rest.name,
        isThumbnail: true,
        sortOrder: 0,
        price: cover?.price,
        sizePrices: cover?.sizePrices || [],
      },
    });
    revalidatePath("/");
    revalidatePath("/new-arrivals");
    revalidatePath("/shop");
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "The slug or SKU already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Product could not be created." }, { status: 500 });
  }
}
