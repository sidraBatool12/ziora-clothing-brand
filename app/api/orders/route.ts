import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { Product } from "@/models/catalog";
import { StoreSettings } from "@/models/admin";
import { getUserOrNull } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { findProductImage, resolveUnitPrice } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";

const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        color: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
        imagePublicId: z.string().optional(),
      })
    )
    .min(1)
    .max(40),
  address: addressSchema,
  paymentMethod: z.enum(["cod", "easypaisa", "jazzcash", "bank_transfer", "stripe", "paypal"]),
  transactionId: z.string().optional(),
  paymentProof: z
    .object({
      // Relative paths come from the local storage fallback used in development.
      url: z.string().min(1).refine((value) => /^https?:\/\//.test(value) || value.startsWith("/")),
      publicId: z.string().min(1),
    })
    .optional(),
});

const MANUAL_METHODS = ["easypaisa", "jazzcash", "bank_transfer"] as const;

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
  if (user.role === "admin") {
    return NextResponse.json({ error: "Admin accounts cannot place storefront orders." }, { status: 403 });
  }

  const limited = rateLimit(`order:${user._id}`, 10, 10 * 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many order attempts. Please wait and try again." }, { status: 429 });
  }

  const parsed = orderSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid order data." }, { status: 400 });
  const data = parsed.data;

  await connectDB();
  const settings = await StoreSettings.findOne({ key: "primary" }).lean();
  const enabledMethods: Record<string, boolean> = {
    cod: settings?.codEnabled ?? true,
    easypaisa: settings?.easypaisaEnabled ?? false,
    jazzcash: settings?.jazzcashEnabled ?? false,
    bank_transfer: settings?.bankTransferEnabled ?? false,
  };
  if (data.paymentMethod in enabledMethods && !enabledMethods[data.paymentMethod]) {
    return NextResponse.json({ error: "This payment method is currently unavailable." }, { status: 400 });
  }

  const isManual = (MANUAL_METHODS as readonly string[]).includes(data.paymentMethod);
  if (isManual && !data.paymentProof) {
    return NextResponse.json({ error: "Please upload your payment proof." }, { status: 400 });
  }

  if (data.paymentMethod === "stripe" || data.paymentMethod === "paypal") {
    return NextResponse.json(
      { error: "This payment method is not available yet. Please use COD, EasyPaisa, JazzCash, or bank transfer." },
      { status: 400 }
    );
  }

  for (const item of data.items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      return NextResponse.json({ error: "Invalid product in cart." }, { status: 400 });
    }
  }

  const productIds = [...new Set(data.items.map((item) => item.productId))];
  const products = await Product.find({
    _id: { $in: productIds },
    publishStatus: { $nin: ["draft", "hidden", "archived"] },
  }).lean();
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  if (productMap.size !== productIds.length) {
    return NextResponse.json({ error: "One or more products are unavailable." }, { status: 409 });
  }

  const pricedItems: Array<{
    productId: string;
    name: string;
    image: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    sku: string;
  }> = [];
  for (const item of data.items) {
    const product = productMap.get(item.productId)!;
    const sizeOk =
      product.sizes.length === 0 ||
      product.sizes.includes(item.size) ||
      item.size === "One Size";
    const colorOk =
      product.colors.length === 0 ||
      product.colors.includes(item.color) ||
      item.color === "Default";
    if (!sizeOk || !colorOk) {
      return NextResponse.json(
        { error: `Invalid size/color selection for ${product.name}.` },
        { status: 400 }
      );
    }
    const image = findProductImage(product, item.imagePublicId);
    pricedItems.push({
      productId: item.productId,
      name: product.name,
      image: image?.url || product.thumbnail.url,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: resolveUnitPrice(product, {
        size: item.size,
        imagePublicId: item.imagePublicId || image?.publicId,
      }),
      sku: product.sku,
    });
  }

  const subtotal = pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 10000;
  const shipping = subtotal >= freeShippingThreshold ? 0 : (settings?.shippingFee ?? 250);
  const totalAmount = subtotal + shipping;
  const orderNumber = generateOrderNumber(settings?.orderPrefix || "ZR");

  const session = await mongoose.startSession();
  let insufficientStockError: string | null = null;

  try {
    await session.withTransaction(async () => {
      for (const item of pricedItems) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            stockQuantity: { $gte: item.quantity },
            publishStatus: { $nin: ["draft", "hidden", "archived"] },
          },
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
        [
          {
            orderNumber,
            user: user._id,
            items: pricedItems.map((item) => ({
              product: item.productId,
              name: item.name,
              image: item.image,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              sku: item.sku,
            })),
            address: data.address,
            totalAmount,
            status: "pending",
            statusHistory: [{ status: "pending", at: new Date() }],
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentMethod === "cod" ? "pending" : "verification_pending",
            paymentProof: data.paymentProof,
            transactionId: data.transactionId,
          },
        ],
        { session }
      );
    });
  } catch {
    if (insufficientStockError) {
      return NextResponse.json({ error: insufficientStockError }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  } finally {
    await session.endSession();
  }

  await sendOrderConfirmationEmail(user.email, orderNumber, totalAmount).catch(() => undefined);

  return NextResponse.json({ success: true, orderNumber, totalAmount });
}
