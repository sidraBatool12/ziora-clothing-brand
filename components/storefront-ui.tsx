import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { ProductLean } from "@/features/products/queries";
import { formatPrice } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-reveal";
import { HeroClient } from "@/components/hero-client";

export { SiteNav, PromoBar } from "@/components/site-nav";

/* ================= Product Card ================= */
export function ProductCard({ product, index = 0 }: { product: ProductLean; index?: number }) {
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const outOfStock = product.stockQuantity <= 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      style={{ ["--index" as string]: index }}
    >
      <div className="relative overflow-hidden bg-mist/60">
        <div className="relative aspect-[3/4]">
          <Image
            src={product.thumbnail.url}
            alt={product.thumbnail.alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className={`object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04] ${outOfStock ? "opacity-45" : ""}`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-onyx/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
        {hasDiscount && (
          <span className="absolute left-3 top-3 bg-onyx px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
            Sale
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 bg-rose px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
            Sold Out
          </span>
        )}
      </div>
      <div className="mt-3.5 space-y-1.5">
        {product.productLine && (
          <p className="text-[10px] uppercase tracking-[0.16em] text-onyx/40">{product.productLine}</p>
        )}
        <h3 className="text-[15px] tracking-tight text-onyx transition-colors duration-300 group-hover:text-rose">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 text-sm">
          {hasDiscount ? (
            <>
              <span className="font-medium text-rose">{formatPrice(product.discountPrice)}</span>
              <span className="text-onyx/35 line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="font-medium text-onyx">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ================= Product Section ================= */
export function ProductSection({
  eyebrow,
  title,
  viewAllHref,
  products,
}: {
  eyebrow: string;
  title: string;
  viewAllHref: string;
  products: ProductLean[];
}) {
  if (!products.length) return null;

  return (
    <section className="page-shell py-20 md:py-28">
      <Reveal>
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <div>
            <p className="eyebrow mb-3">{eyebrow}</p>
            <h2 className="text-3xl tracking-tight text-onyx md:text-5xl">{title}</h2>
          </div>
          <Link href={viewAllHref} className="group btn-ghost mb-1 hidden items-center gap-1.5 sm:inline-flex">
            View all
            <ArrowRight
              size={14}
              weight="bold"
              className="transition-transform duration-500 ease-soft group-hover:translate-x-1"
            />
          </Link>
        </div>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4 lg:gap-y-14">
        {products.map((p, i) => (
          <StaggerItem key={p._id}>
            <ProductCard product={p} index={i} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-10 text-center sm:hidden">
        <Link href={viewAllHref} className="btn-secondary">
          View all
        </Link>
      </div>
    </section>
  );
}

/* ================= Hero ================= */
export function Hero({
  imageUrl,
  imageAlt = "ZIORA collection",
}: {
  imageUrl?: string;
  imageAlt?: string;
}) {
  return (
    <HeroClient
      imageUrl={imageUrl || "https://picsum.photos/seed/ziora-hero-atelier/1600/2000"}
      imageAlt={imageAlt}
    />
  );
}

/* ================= Category dual panels (Bonanza-style shop now) ================= */
export function CategoryPanels() {
  return (
    <section className="page-shell py-6 md:py-10">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
        <Reveal className="md:col-span-7">
          <Link
            href="/shop"
            className="group relative block min-h-[52vw] overflow-hidden md:min-h-[560px]"
          >
            <Image
              src="https://picsum.photos/seed/ziora-ready-wear/1200/1400"
              alt="Ready to wear"
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx/70 via-onyx/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">Shop Now</p>
              <h2 className="mt-2 text-3xl tracking-tight text-white md:text-5xl">Ready to Wear</h2>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white ring-1 ring-white/20 backdrop-blur-md transition-all duration-500 group-hover:bg-white group-hover:text-onyx">
                Explore
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-onyx/5">
                  <ArrowUpRight size={12} weight="bold" />
                </span>
              </span>
            </div>
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 gap-3 md:col-span-5 md:gap-4">
          <Reveal delay={0.08}>
            <Link
              href="/new-arrivals"
              className="group relative block min-h-[42vw] overflow-hidden md:min-h-[272px]"
            >
              <Image
                src="https://picsum.photos/seed/ziora-new-edit/900/900"
                alt="New arrivals"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/65 via-onyx/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">Just In</p>
                <h2 className="mt-2 text-2xl tracking-tight text-white md:text-3xl">New Arrivals</h2>
              </div>
            </Link>
          </Reveal>
          <Reveal delay={0.14}>
            <Link
              href="/categories"
              className="group relative block min-h-[42vw] overflow-hidden md:min-h-[272px]"
            >
              <Image
                src="https://picsum.photos/seed/ziora-collections/900/900"
                alt="Collections"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/65 via-onyx/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">Browse</p>
                <h2 className="mt-2 text-2xl tracking-tight text-white md:text-3xl">Collections</h2>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= Festive / Editorial strip ================= */
export function EditorialStrip() {
  return (
    <section className="relative overflow-hidden bg-onyx text-white">
      <div className="page-shell grid items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <Reveal>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-rose-light">Festive Edit</p>
            <h2 className="mt-4 max-w-md text-4xl tracking-tight md:text-5xl">
              Soft structure for evenings that ask for presence.
            </h2>
            <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-white/60">
              Tailored modest silhouettes in considered fabrics — built for celebrations without the noise.
            </p>
            <Link href="/shop" className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-onyx transition-transform duration-300 active:scale-[0.98]">
              Shop the edit
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-onyx/5 transition-transform duration-500 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight size={13} weight="bold" />
              </span>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative">
          <div className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden md:mr-0">
            <Image
              src="https://picsum.photos/seed/ziora-festive/1000/1250"
              alt="Festive edit look"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Category chips ================= */
export function CategoryRail({
  categories,
}: {
  categories: { _id: string; name: string; count: number }[];
}) {
  if (!categories.length) return null;

  return (
    <section className="border-y border-onyx/10 bg-white/40 py-8">
      <div className="page-shell">
        <div className="mb-5 flex items-end justify-between">
          <p className="eyebrow">Shop by category</p>
          <Link href="/categories" className="btn-ghost hidden sm:inline-flex">
            All collections
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/shop?category=${cat._id}`}
              className="group flex min-w-[160px] shrink-0 flex-col justify-between border border-onyx/10 bg-ivory px-5 py-5 transition-all duration-500 ease-soft hover:border-onyx hover:bg-onyx hover:text-white"
            >
              <span className="text-sm tracking-tight">{cat.name}</span>
              <span className="mt-6 text-[10px] uppercase tracking-[0.16em] text-onyx/40 transition-colors group-hover:text-white/50">
                {cat.count} pieces
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= Newsletter ================= */
export function Newsletter() {
  return (
    <section className="page-shell py-20 md:py-28">
      <Reveal>
        <div className="relative overflow-hidden bg-onyx px-6 py-14 text-white md:px-14 md:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
          <div className="relative grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-rose-light">Stay close</p>
              <h2 className="mt-3 max-w-lg text-3xl tracking-tight md:text-5xl">
                First look at drops, restocks, and private previews.
              </h2>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email"
                className="flex-1 border border-white/20 bg-transparent px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus-visible:border-rose-light"
              />
              <button type="submit" className="rounded-full bg-white px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-onyx transition-transform active:scale-[0.98]">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ================= Footer ================= */
export function SiteFooter() {
  return (
    <footer className="border-t border-onyx/10 bg-white/50">
      <div className="page-shell grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <p className="text-xl font-semibold tracking-[0.28em] text-onyx">ZIORA</p>
          <p className="eyebrow mt-3">Grace Beyond Modesty</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-onyx/55">
            Premium modest fashion crafted for women who move through the world with quiet confidence.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8 md:gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-onyx/40">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm text-onyx/70">
              <li><Link href="/shop" className="transition-colors hover:text-rose">All Products</Link></li>
              <li><Link href="/new-arrivals" className="transition-colors hover:text-rose">New Arrivals</Link></li>
              <li><Link href="/categories" className="transition-colors hover:text-rose">Collections</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-onyx/40">Help</p>
            <ul className="mt-4 space-y-2.5 text-sm text-onyx/70">
              <li><Link href="/contact" className="transition-colors hover:text-rose">Contact</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-rose">About</Link></li>
              <li><Link href="/dashboard/orders" className="transition-colors hover:text-rose">Track Order</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-onyx/40">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-onyx/70">
              <li>hello@ziora.pk</li>
              <li>+92 300 0000000</li>
              <li>Mon–Sat · 10:00–18:00 PKT</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-onyx/10">
        <div className="page-shell flex flex-col gap-3 py-6 text-xs text-onyx/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ZIORA. All rights reserved.</p>
          <p className="tracking-[0.12em] uppercase">Pakistan · Modest Luxury</p>
        </div>
      </div>
    </footer>
  );
}
