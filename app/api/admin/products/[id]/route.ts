import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/catalog";
import { getAdminOrNull } from "@/lib/auth";
import { removeImage } from "@/lib/storage";

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/new-arrivals");
  revalidatePath("/shop");
}

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  price: z.number().positive().optional(),
  discountPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  stockQuantity: z.number().min(0).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  category: z.string().min(1).optional(),
  productLine: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  publishStatus: z.enum(["draft", "published", "hidden", "archived"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });

  await connectDB();
  try {
    const product = await Product.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    revalidateStorefront();
    return NextResponse.json({ success: true, product });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "The slug or SKU already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Product could not be updated." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  // Best-effort Cloudinary cleanup — don't fail the delete if this errors.
  await removeImage(product.thumbnail.publicId).catch(() => {});
  for (const img of product.images) await removeImage(img.publicId).catch(() => {});

  revalidateStorefront();
  return NextResponse.json({ success: true });
}
