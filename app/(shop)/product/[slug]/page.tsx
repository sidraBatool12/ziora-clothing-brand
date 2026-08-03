import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/features/products/queries";
import { ProductActions } from "@/components/product-actions";
import { ProductSection } from "@/components/storefront-ui";
import { Reveal } from "@/components/motion-reveal";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryId =
    typeof product.category === "string"
      ? product.category
      : (product.category as unknown as { _id: string })._id;
  const related = await getRelatedProducts(categoryId, product._id);

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const price =
    hasDiscount ? product.discountPrice : product.price;

  return (
    <main>
      <div className="page-shell py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <div className="space-y-3">
              <div className="relative aspect-[3/4] overflow-hidden bg-mist/50">
                <Image
                  src={product.thumbnail.url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
                {hasDiscount && (
                  <span className="absolute left-4 top-4 bg-onyx px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
                    Sale
                  </span>
                )}
              </div>
              {product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {product.images.map((img, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden bg-mist/50">
                      <Image
                        src={img.url}
                        alt={img.alt || product.name}
                        fill
                        sizes="15vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5 lg:pt-4">
            <p className="eyebrow mb-3">{product.productLine || "ZIORA"}</p>
            <h1 className="text-3xl tracking-tight text-onyx md:text-4xl">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-xl font-medium text-onyx">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-sm text-onyx/35 line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            <p className="mt-5 max-w-[48ch] text-sm leading-relaxed text-onyx/65">{product.description}</p>
            <div className="mt-8">
              <ProductActions product={product} hidePrice />
            </div>
            {(product.fabric || product.careInstructions) && (
              <div className="mt-10 space-y-3 border-t border-onyx/10 pt-8 text-sm text-onyx/65">
                {product.fabric && (
                  <p>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-onyx/40">Fabric</span>
                    <span className="mt-1 block text-onyx/100">{product.fabric}</span>
                  </p>
                )}
                {product.careInstructions && (
                  <p>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-onyx/40">Care</span>
                    <span className="mt-1 block text-onyx/100">{product.careInstructions}</span>
                  </p>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </div>
      <ProductSection
        eyebrow="You May Also Like"
        title="Related Products"
        viewAllHref="/shop"
        products={related}
      />
    </main>
  );
}
