import { getProducts } from "@/features/products/queries";
import { ProductCard } from "@/components/storefront-ui";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-reveal";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Boolean(params.search || params.category || params.minPrice || params.maxPrice);
  const page = Number(params.page || 1);
  const canonical = page > 1 ? `/shop?page=${page}` : "/shop";
  return pageMetadata({
    title: page > 1 ? `Shop · Page ${page}` : "Shop Modest Wear",
    description:
      "Browse the full ZIORA collection of premium modest fashion — ready-to-wear pieces, new arrivals, and timeless designs.",
    path: filtered ? "/shop" : canonical,
    index: !filtered,
  });
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { products, total, page, perPage } = await getProducts({
    category: params.category,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as "newest" | "price_asc" | "price_desc") || "newest",
    search: params.search,
    page: params.page ? Number(params.page) : 1,
  });
  const totalPages = Math.ceil(total / perPage);

  return (
    <main className="page-shell py-12 md:py-16">
      <Reveal>
        <div className="mb-10 flex flex-col gap-6 border-b border-onyx/10 pb-8 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">Shop</p>
            <h1 className="text-4xl tracking-tight text-onyx md:text-5xl">All Products</h1>
            <p className="mt-3 text-sm text-onyx/50">{total} pieces</p>
          </div>
          <form className="flex flex-wrap gap-2 text-xs" action="/shop" method="get">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <select
              name="sort"
              defaultValue={params.sort || "newest"}
              className="border border-onyx/10 bg-white px-3 py-2.5 outline-none focus-visible:border-rose"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Search…"
              className="min-w-[160px] flex-1 border border-onyx/10 bg-white px-3 py-2.5 outline-none focus-visible:border-rose sm:flex-none"
            />
            <button type="submit" className="bg-onyx px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-white transition-transform active:scale-[0.98]">
              Apply
            </button>
          </form>
        </div>
      </Reveal>

      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg tracking-tight text-onyx">No pieces matched</p>
          <p className="mt-2 text-sm text-onyx/50">Try clearing search or choosing another sort.</p>
          <a href="/shop" className="btn-primary mt-8 inline-flex">
            Reset filters
          </a>
        </div>
      ) : (
        <Stagger className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4 lg:gap-y-14">
          {products.map((p, i) => (
            <StaggerItem key={p._id}>
              <ProductCard product={p} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {totalPages > 1 && (
        <div className="mt-14 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => (
            <a
              key={i}
              href={`/shop?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
                ),
                page: String(i + 1),
              }).toString()}`}
              className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                page === i + 1
                  ? "border-rose bg-rose text-white"
                  : "border-onyx/10 hover:border-onyx"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
