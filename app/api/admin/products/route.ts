import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/catalog";
import { getAdminOrNull } from "@/lib/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive(),
  discountPrice: z.number().min(0).default(0),
  category: z.string().min(1),
  productLine: z.string().default("Everyday"),
  stockQuantity: z.number().min(0),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  fabric: z.string().optional(),
  careInstructions: z.string().optional(),
  thumbnailUrl: z.string().url(),
  thumbnailPublicId: z.string().min(1),
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
  const { thumbnailUrl, thumbnailPublicId, ...rest } = parsed.data;

  await connectDB();
  const product = await Product.create({ ...rest, thumbnail: { url: thumbnailUrl, publicId: thumbnailPublicId } });
  return NextResponse.json({ success: true, product });
}
