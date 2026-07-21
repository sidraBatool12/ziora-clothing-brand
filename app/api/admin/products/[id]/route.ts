import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/catalog";
import { getAdminOrNull } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";

const updateSchema = z.object({
  name: z.string().optional(),
  price: z.number().positive().optional(),
  discountPrice: z.number().min(0).optional(),
  stockQuantity: z.number().min(0).optional(),
  description: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });

  await connectDB();
  const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  return NextResponse.json({ success: true, product });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  // Best-effort Cloudinary cleanup — don't fail the delete if this errors.
  await deleteImage(product.thumbnail.publicId).catch(() => {});
  for (const img of product.images) await deleteImage(img.publicId).catch(() => {});

  return NextResponse.json({ success: true });
}
