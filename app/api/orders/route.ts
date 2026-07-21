import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { Product } from "@/models/catalog";
import { getUserOrNull } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";

const addressSchema = z.object({
  fullName: z.string().min(1), phone: z.string().min(1), line1: z.string().min(1),
  city: z.string().min(1), state: z.string().min(1), postalCode: z.string().min(1), country: z.string().min(1),
});

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(), name: z.string(), image: z.string(),
    size: z.string(), color: z.string(), quantity: z.number().min(1), price: z.number(),
  })).min(1),
  address: addressSchema,
  paymentMethod: z.enum(["cod", "easypaisa", "bank_transfer"]),
  transactionId: z.string().optional(),
  paymentProof: z.object({ url: z.string(), publicId: z.string() }).optional(),
});

export async function GET() {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
}

export async function POST(req: NextRequest) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });

  const parsed = orderSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid order data." }, { status: 400 });
  const data = parsed.data;

  if ((data.paymentMethod === "easypaisa" || data.paymentMethod === "bank_transfer") && !data.paymentProof) {
    return NextResponse.json({ error: "Please upload your payment proof." }, { status: 400 });
  }

  await connectDB();

  const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal > 10000 ? 0 : 250;
  const totalAmount = subtotal + shipping;
  const orderNumber = generateOrderNumber();

  // ---- Stock validation + decrement + order creation, atomically ----
  // MongoDB Atlas clusters are replica sets, so multi-document
  // transactions are available. Each decrement is conditioned on
  // stockQuantity >= requested quantity; if any item is unavailable,
  // or order creation itself fails, the whole transaction aborts and
  // nothing is left half-applied — no manual rollback bookkeeping needed.
  const session = await mongoose.startSession();
  let insufficientStockError: string | null = null;

  try {
    await session.withTransaction(async () => {
      for (const item of data.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.productId, stockQuantity: { $gte: item.quantity } },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true, session }
        );
        if (!updated) {
          const current = await Product.findById(item.productId).session(session).lean();
          const available = current?.stockQuantity ?? 0;
          insufficientStockError = `Only ${available} item${available === 1 ? "" : "s"} of "${item.name}" available.`;
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      await Order.create(
        [{
          orderNumber,
          user: user._id,
          items: data.items.map((i) => ({
            product: i.productId, name: i.name, image: i.image, size: i.size, color: i.color, quantity: i.quantity, unitPrice: i.price,
          })),
          address: data.address,
          totalAmount,
          status: "pending",
          statusHistory: [{ status: "pending", at: new Date() }],
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === "cod" ? "pending" : "verification_pending",
          paymentProof: data.paymentProof,
          transactionId: data.transactionId,
        }],
        { session }
      );
    });
  } catch (err) {
    if (insufficientStockError) {
      return NextResponse.json({ error: insufficientStockError }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  } finally {
    await session.endSession();
  }

  await sendOrderConfirmationEmail(user.email, orderNumber, totalAmount).catch(() => {
    // Email failure shouldn't block order confirmation — order is already saved.
  });

  return NextResponse.json({ success: true, orderNumber });
}
