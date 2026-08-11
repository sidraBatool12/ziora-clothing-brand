import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getUserOrNull } from "@/lib/auth";
import { Order } from "@/models/order";
import { Product } from "@/models/catalog";
import { Review } from "@/models/misc";
import { rateLimit } from "@/lib/rate-limit";

const imageUrl = z
  .string()
  .min(1)
  .refine((value) => /^https?:\/\//.test(value) || value.startsWith("/"));

const createSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().default(""),
  images: z
    .array(
      z.object({
        url: imageUrl,
        publicId: z.string().min(1),
      })
    )
    .min(1, "Product photo is required.")
    .max(5),
});

async function recalculateProductRating(productId: string) {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$productId",
        ratingAverage: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);
  const ratingAverage = stats[0] ? Math.round(stats[0].ratingAverage * 10) / 10 : 0;
  const ratingCount = stats[0]?.ratingCount || 0;
  await Product.findByIdAndUpdate(productId, { ratingAverage, ratingCount });
  return { ratingAverage, ratingCount };
}

export async function GET(request: NextRequest) {
  await connectDB();
  const productId = request.nextUrl.searchParams.get("productId");
  const orderId = request.nextUrl.searchParams.get("orderId");

  if (productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .limit(40)
      .populate("userId", "name avatar")
      .lean();
    return NextResponse.json({ reviews: JSON.parse(JSON.stringify(reviews)) });
  }

  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order." }, { status: 400 });
    }
    const reviews = await Review.find({ orderId, userId: user._id }).lean();
    return NextResponse.json({
      reviews: JSON.parse(JSON.stringify(reviews)),
      reviewedProductIds: reviews.map((review) => String(review.productId)),
    });
  }

  const reviews = await Review.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ reviews: JSON.parse(JSON.stringify(reviews)) });
}

export async function POST(request: NextRequest) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });
  if (user.role === "admin") {
    return NextResponse.json({ error: "Admin accounts cannot submit product reviews." }, { status: 403 });
  }

  const limited = rateLimit(`review:${user._id}`, 20, 60 * 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many review attempts. Please try again later." }, { status: 429 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Stars and at least one product photo are required." },
      { status: 400 }
    );
  }

  const { orderId, productId, rating, comment, images } = parsed.data;
  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid order or product." }, { status: 400 });
  }

  await connectDB();

  const order = await Order.findOne({ _id: orderId, user: user._id }).lean();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status !== "delivered") {
    return NextResponse.json(
      { error: "You can only review products after the order is delivered." },
      { status: 400 }
    );
  }

  const ordered = order.items.some((item) => String(item.product) === productId);
  if (!ordered) {
    return NextResponse.json({ error: "This product was not part of the delivered order." }, { status: 400 });
  }

  const existing = await Review.findOne({ userId: user._id, productId }).lean();
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 });
  }

  try {
    const review = await Review.create({
      userId: user._id,
      productId,
      orderId,
      rating,
      comment: comment || "",
      images,
      isVerifiedPurchase: true,
    });

    const ratings = await recalculateProductRating(productId);

    return NextResponse.json(
      { success: true, review: JSON.parse(JSON.stringify(review)), ...ratings },
      { status: 201 }
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not submit review." }, { status: 500 });
  }
}
