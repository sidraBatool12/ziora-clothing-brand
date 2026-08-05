import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { User } from "@/models/user";
import { getAdminOrNull } from "@/lib/auth";
import { sendPaymentStatusEmail } from "@/lib/email";
import { restoreOrderStock } from "@/lib/inventory";

const schema = z.object({ action: z.enum(["approve", "reject", "refund"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  await connectDB();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const action = parsed.data.action;
  const statusMap = { approve: "paid", reject: "rejected", refund: "refunded" } as const;
  const shouldRestock =
    (action === "reject" || action === "refund") &&
    !["cancelled", "returned", "refunded"].includes(order.status);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (shouldRestock) {
        await restoreOrderStock(order.items, session);
        order.status = action === "refund" ? "refunded" : "cancelled";
        order.statusHistory.push({ status: order.status, at: new Date() });
        if (order.status === "cancelled") order.cancelledAt = new Date();
      }

      order.paymentStatus = statusMap[action];
      if (action === "approve" && order.status === "pending") {
        order.status = "confirmed";
        order.statusHistory.push({ status: "confirmed", at: new Date() });
      }
      await order.save({ session });
    });
  } catch {
    return NextResponse.json({ error: "Failed to update payment." }, { status: 500 });
  } finally {
    await session.endSession();
  }

  const customer = await User.findById(order.user).lean();
  if (customer?.email) {
    await sendPaymentStatusEmail(
      customer.email,
      order.orderNumber,
      order.paymentStatus as "paid" | "rejected" | "refunded"
    ).catch(() => undefined);
  }

  return NextResponse.json({ success: true });
}
