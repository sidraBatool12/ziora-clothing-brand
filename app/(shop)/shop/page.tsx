import { getProducts } from "@/features/products/queries";
import { ProductCard } from "@/components/storefront-ui";

export const metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

interface PageProps { searchParams: Promise<{ [key: string]: string | undefined }>; }

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
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow mb-2">Shop</p><h1 className="text-3xl text-onyx md:text-4xl">All Products</h1></div>
        <form className="flex flex-wrap gap-3 text-xs" action="/shop" method="get">
          <select name="sort" defaultValue={params.sort || "newest"} className="border border-onyx/20 px-3 py-2">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <input name="search" defaultValue={params.search} placeholder="Search…" className="border border-onyx/20 px-3 py-2" />
          <button className="bg-onyx px-4 py-2 text-white uppercase tracking-widest">Apply</button>
        </form>
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-onyx/60">No products match your filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => (
            <a key={i} href={`/shop?${new URLSearchParams({ ...params, page: String(i + 1) } as Record<string, string>).toString()}`}
              className={`h-8 w-8 flex items-center justify-center border ${page === i + 1 ? "border-gold text-gold" : "border-onyx/20"}`}>
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
