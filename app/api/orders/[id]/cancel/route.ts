import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { Product } from "@/models/catalog";
import { getUserOrNull } from "@/lib/auth";

const CANCELLABLE_STATUSES = ["pending", "confirmed"];
const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.user.toString() !== user._id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json({ error: `Orders that are ${order.status.replace(/_/g, " ")} can no longer be cancelled.` }, { status: 400 });
  }

  const ageMs = Date.now() - new Date(order.createdAt).getTime();
  if (ageMs > CANCELLATION_WINDOW_MS) {
    return NextResponse.json({ error: "This order can no longer be cancelled — the 24-hour window has passed." }, { status: 400 });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Restore stock for every item in the order.
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } }, { session });
      }
      order.status = "cancelled";
      order.cancelledAt = new Date();
      order.statusHistory.push({ status: "cancelled", at: new Date() });
      await order.save({ session });
    });
  } catch {
    return NextResponse.json({ error: "Failed to cancel order. Please try again." }, { status: 500 });
  } finally {
    await session.endSession();
  }

  return NextResponse.json({ success: true });
}
