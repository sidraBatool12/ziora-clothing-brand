import Link from "next/link";
import Image from "next/image";
import { getStorefrontCategories } from "@/features/products/queries";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-reveal";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getStorefrontCategories();
  const seeds = [
    "ziora-cat-a",
    "ziora-cat-b",
    "ziora-cat-c",
    "ziora-cat-d",
    "ziora-cat-e",
    "ziora-cat-f",
  ];

  return (
    <main className="page-shell py-12 md:py-16">
      <Reveal>
        <div className="mb-10 max-w-xl md:mb-14">
          <p className="eyebrow mb-3">Explore</p>
          <h1 className="text-4xl tracking-tight text-onyx md:text-5xl">Collections</h1>
          <p className="mt-3 text-sm text-onyx/55">
            Browse by line — ready to wear, unstitched, festive, and everyday essentials.
          </p>
        </div>
      </Reveal>

      {categories.length === 0 ? (
        <p className="py-20 text-center text-onyx/55">
          Collections will appear once catalog categories are added.
        </p>
      ) : (
        <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <StaggerItem
              key={cat._id}
              className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
            >
              <Link
                href={`/shop?category=${cat._id}`}
                className={`group relative block overflow-hidden ${
                  i === 0 ? "min-h-[320px] md:min-h-[420px]" : "min-h-[260px] md:min-h-[320px]"
                }`}
              >
                <Image
                  src={`https://picsum.photos/seed/${seeds[i % seeds.length]}/1200/900`}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 via-onyx/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                      {cat.count} pieces
                    </p>
                    <h2 className="mt-1 text-2xl tracking-tight text-white md:text-3xl">
                      {cat.name}
                    </h2>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={16} weight="bold" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </main>
  );
}
