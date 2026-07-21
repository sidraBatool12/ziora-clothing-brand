import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/features/products/queries";
import { ProductActions } from "@/components/product-actions";
import { ProductSection } from "@/components/storefront-ui";

interface PageProps { params: Promise<{ slug: string }>; }
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // getProductBySlug() populates "category", so at runtime this is a full
  // Category document — but ProductLean's static type still says ObjectId
  // (Mongoose populate doesn't change TS types). Route through `unknown`
  // rather than lying with a direct cast.
  const categoryId =
    typeof product.category === "string"
      ? product.category
      : (product.category as unknown as { _id: string })._id;
  const related = await getRelatedProducts(categoryId, product._id);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-[3/4] overflow-hidden bg-beige/40">
            <Image src={product.thumbnail.url} alt={product.name} fill className="object-cover" />
          </div>
          {product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden bg-beige/40">
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="eyebrow mb-2">{product.productLine}</p>
          <h1 className="text-3xl text-onyx md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-sm text-onyx/70">{product.description}</p>
          <div className="mt-6"><ProductActions product={product} /></div>
          {(product.fabric || product.careInstructions) && (
            <div className="mt-8 space-y-1 border-t border-onyx/10 pt-6 text-sm text-onyx/70">
              {product.fabric && <p><strong>Fabric:</strong> {product.fabric}</p>}
              {product.careInstructions && <p><strong>Care:</strong> {product.careInstructions}</p>}
            </div>
          )}
        </div>
      </div>
      <ProductSection eyebrow="You May Also Like" title="Related Products" viewAllHref="/shop" products={related} />
    </main>
  );
}
