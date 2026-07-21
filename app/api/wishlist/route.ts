import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Wishlist } from "@/models/misc";
import { Product } from "@/models/catalog";
import { getUserOrNull } from "@/lib/auth";

export async function GET() {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const wishlist = await Wishlist.findOne({ user: user._id }).lean();
  const productIds = wishlist?.products || [];
  const products = productIds.length
    ? await Product.find({ _id: { $in: productIds } }).lean()
    : [];
  return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
}

const toggleSchema = z.object({ productId: z.string() });

export async function POST(req: NextRequest) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = toggleSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { productId } = parsed.data;

  await connectDB();
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: user._id },
    {},
    { upsert: true, new: true }
  );

  const has = wishlist.products.some((p) => p.toString() === productId);
  if (has) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId) as any;
  } else {
    wishlist.products.push(productId as any);
  }
  await wishlist.save();

  return NextResponse.json({ success: true, inWishlist: !has });
}
