import Link from "next/link";
import Image from "next/image";
import type { ProductLean } from "@/features/products/queries";
import { formatPrice } from "@/lib/utils";

/* ================= Nav ================= */
export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-onyx/10 bg-ivory/90 px-6 py-4 backdrop-blur-md md:px-12">
      <Link href="/" className="text-xl tracking-widest text-onyx">ZIORA</Link>
      <div className="hidden gap-8 text-xs uppercase tracking-widest text-onyx/70 md:flex">
        <Link href="/shop" className="hover:text-gold">Shop</Link>
        <Link href="/new-arrivals" className="hover:text-gold">New Arrivals</Link>
        <Link href="/categories" className="hover:text-gold">Collections</Link>
        <Link href="/about" className="hover:text-gold">About</Link>
        <Link href="/contact" className="hover:text-gold">Contact</Link>
      </div>
      <div className="flex items-center gap-5 text-xs uppercase tracking-widest">
        <Link href="/dashboard/wishlist" className="hover:text-gold">Wishlist</Link>
        <Link href="/cart" className="hover:text-gold">Cart</Link>
        <Link href="/login" className="hover:text-gold">Account</Link>
      </div>
    </nav>
  );
}

/* ================= Footer ================= */
export function SiteFooter() {
  return (
    <footer className="border-t border-onyx/10 px-6 py-16 text-center">
      <p className="text-xl tracking-widest text-onyx">ZIORA</p>
      <p className="eyebrow mt-2">Grace Beyond Modesty</p>
      <p className="mx-auto mt-6 max-w-sm text-xs text-onyx/50">© 2026 ZIORA. All rights reserved.</p>
    </footer>
  );
}

/* ================= Product Card ================= */
export function ProductCard({ product }: { product: ProductLean }) {
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const outOfStock = product.stockQuantity <= 0;
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-beige/40">
        <Image
          src={product.thumbnail.url} alt={product.thumbnail.alt || product.name} fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${outOfStock ? "opacity-50" : ""}`}
        />
        {hasDiscount && <span className="absolute left-3 top-3 bg-onyx px-2 py-1 text-[10px] uppercase tracking-widest text-white">Sale</span>}
        {outOfStock && <span className="absolute right-3 top-3 bg-red-700 px-2 py-1 text-[10px] uppercase tracking-widest text-white">Out of Stock</span>}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm text-onyx">{product.name}</h3>
        <div className="flex gap-2 text-sm">
          {hasDiscount ? (
            <><span className="text-gold">{formatPrice(product.discountPrice)}</span><span className="text-onyx/40 line-through">{formatPrice(product.price)}</span></>
          ) : <span>{formatPrice(product.price)}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ================= Product Section ================= */
export function ProductSection({ eyebrow, title, viewAllHref, products }: { eyebrow: string; title: string; viewAllHref: string; products: ProductLean[] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
      <div className="mb-8 flex items-end justify-between">
        <div><p className="eyebrow mb-2">{eyebrow}</p><h2 className="text-3xl text-onyx md:text-4xl">{title}</h2></div>
        <Link href={viewAllHref} className="text-sm text-onyx underline">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}

/* ================= Hero ================= */
export function Hero() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-beige/30 px-6 text-center">
      <p className="eyebrow mb-4">New Season</p>
      <h1 className="max-w-2xl text-4xl leading-tight text-onyx md:text-6xl">Grace Beyond Modesty</h1>
      <p className="mt-4 max-w-md text-sm text-onyx/70">Luxury modest fashion, crafted for the woman who moves through the world with quiet confidence.</p>
      <div className="mt-8 flex gap-4">
        <a href="/shop" className="bg-onyx px-8 py-3 text-xs uppercase tracking-widest text-white hover:bg-onyx/90">Shop Collection</a>
        <a href="/new-arrivals" className="border border-onyx px-8 py-3 text-xs uppercase tracking-widest text-onyx hover:border-gold hover:text-gold">New Arrivals</a>
      </div>
    </section>
  );
}

/* ================= Newsletter ================= */
export function Newsletter() {
  return (
    <section className="bg-onyx px-6 py-20 text-center text-white">
      <p className="eyebrow mb-2">Stay in Grace</p>
      <h2 className="text-3xl">Join the ZIORA Circle</h2>
      <form className="mx-auto mt-8 flex max-w-md gap-2">
        <input type="email" required placeholder="Your email" className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40" />
        <button className="bg-gold px-6 py-3 text-xs uppercase tracking-widest text-onyx">Subscribe</button>
      </form>
    </section>
  );
}
