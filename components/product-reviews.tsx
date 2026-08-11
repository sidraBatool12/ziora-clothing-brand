import Image from "next/image";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/misc";
import { Star } from "@phosphor-icons/react/dist/ssr";

export async function ProductReviews({ productId }: { productId: string }) {
  await connectDB();
  const reviews = await Review.find({ productId })
    .sort({ createdAt: -1 })
    .limit(24)
    .populate("userId", "name")
    .lean();

  const serialized = JSON.parse(JSON.stringify(reviews)) as Array<{
    _id: string;
    rating: number;
    comment?: string;
    images: { url: string; publicId: string }[];
    isVerifiedPurchase?: boolean;
    createdAt: string;
    userId?: { name?: string } | string;
  }>;

  if (!serialized.length) {
    return (
      <section className="page-shell border-t border-onyx/10 py-14">
        <p className="text-[10px] uppercase tracking-[0.2em] text-onyx/40">Reviews</p>
        <h2 className="mt-2 text-2xl tracking-tight text-onyx">Customer reviews</h2>
        <p className="mt-3 text-sm text-onyx/55">
          No reviews yet. Verified buyers can leave stars and a product photo after delivery.
        </p>
      </section>
    );
  }

  return (
    <section className="page-shell border-t border-onyx/10 py-14">
      <p className="text-[10px] uppercase tracking-[0.2em] text-onyx/40">Reviews</p>
      <h2 className="mt-2 text-2xl tracking-tight text-onyx">Customer reviews</h2>
      <div className="mt-8 space-y-6">
        {serialized.map((review) => {
          const name =
            typeof review.userId === "object" && review.userId?.name
              ? review.userId.name
              : "ZIORA customer";
          return (
            <article key={review._id} className="border-b border-onyx/10 pb-6 last:border-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-onyx">{name}</p>
                {review.isVerifiedPurchase && (
                  <span className="text-[9px] uppercase tracking-[0.14em] text-emerald-700">
                    Verified purchase
                  </span>
                )}
              </div>
              <div className="mt-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    weight={index < review.rating ? "fill" : "light"}
                    className={index < review.rating ? "text-gold" : "text-onyx/20"}
                  />
                ))}
              </div>
              {review.comment && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-onyx/65">{review.comment}</p>
              )}
              {review.images?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.images.map((image) => (
                    <div key={image.publicId} className="relative h-20 w-20 overflow-hidden bg-mist/50">
                      <Image src={image.url} alt="Customer review" fill className="object-cover" sizes="80px" />
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
