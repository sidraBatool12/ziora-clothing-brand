import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { User } from "@/models/user";
import { getAdminOrNull } from "@/lib/auth";
import { sendShippingUpdateEmail } from "@/lib/email";
import { restoreOrderStock } from "@/lib/inventory";

const RESTOCK_STATUSES = new Set(["cancelled", "returned", "refunded"]);
const ALREADY_RESTOCKED = new Set(["cancelled", "returned", "refunded"]);

const schema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
    ])
    .optional(),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  note: z.string().trim().max(300).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const data = parsed.data;

  await connectDB();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const previousStatus = order.status;
  const shouldRestock =
    Boolean(data.status) &&
    RESTOCK_STATUSES.has(data.status!) &&
    !ALREADY_RESTOCKED.has(previousStatus);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (shouldRestock) {
        await restoreOrderStock(order.items, session);
      }

      if (data.status && data.status !== order.status) {
        order.status = data.status;
        order.statusHistory.push({ status: data.status, at: new Date(), note: data.note });
        if (data.status === "cancelled") order.cancelledAt = new Date();
        if (data.status === "refunded") order.paymentStatus = "refunded";
      }
      if (data.courierName !== undefined) order.shippingDetails.courierName = data.courierName;
      if (data.trackingNumber !== undefined) order.shippingDetails.trackingNumber = data.trackingNumber;
      if (data.estimatedDelivery !== undefined) {
        order.shippingDetails.estimatedDelivery = new Date(data.estimatedDelivery);
      }
      if (data.note && (!data.status || data.status === previousStatus)) {
        order.statusHistory.push({ status: order.status, at: new Date(), note: data.note });
      }

      await order.save({ session });
    });
  } catch {
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  } finally {
    await session.endSession();
  }

  const customer = await User.findById(order.user).lean();
  if (customer?.email && data.status) {
    await sendShippingUpdateEmail(
      customer.email,
      order.orderNumber,
      order.status,
      order.shippingDetails.trackingNumber
    ).catch(() => undefined);
  }

  return NextResponse.json({ success: true });
}
