import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { User } from "@/models/user";
import { getAdminOrNull } from "@/lib/auth";
import { sendShippingUpdateEmail } from "@/lib/email";

const schema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"]).optional(),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
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

  if (data.status && data.status !== order.status) {
    order.status = data.status;
    order.statusHistory.push({ status: data.status, at: new Date() });
  }
  if (data.courierName !== undefined) order.shippingDetails.courierName = data.courierName;
  if (data.trackingNumber !== undefined) order.shippingDetails.trackingNumber = data.trackingNumber;
  if (data.estimatedDelivery !== undefined) order.shippingDetails.estimatedDelivery = new Date(data.estimatedDelivery);

  await order.save();

  const customer = await User.findById(order.user).lean();
  if (customer?.email && data.status) {
    await sendShippingUpdateEmail(customer.email, order.orderNumber, order.status, order.shippingDetails.trackingNumber).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
