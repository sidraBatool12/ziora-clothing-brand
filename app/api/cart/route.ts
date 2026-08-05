import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/misc";
import { getUserOrNull } from "@/lib/auth";

const itemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export async function GET() {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const cart = await Cart.findOne({ user: user._id }).lean();
  return NextResponse.json({
    items: (cart?.items || []).map((item) => ({
      productId: String(item.product),
      variantId: item.variantId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });
}

export async function PUT(request: NextRequest) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = z.object({ items: z.array(itemSchema) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart payload." }, { status: 400 });

  await connectDB();
  const cart = await Cart.findOneAndUpdate(
    { user: user._id },
    {
      items: parsed.data.items.map((item) => ({
        product: item.productId,
        variantId: item.variantId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, count: cart.items.length });
}
