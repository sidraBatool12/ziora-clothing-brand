import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion-reveal";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main>
      <section className="relative min-h-[52dvh] overflow-hidden bg-onyx md:min-h-[60dvh]">
        <Image
          src="https://picsum.photos/seed/ziora-about-atelier/1600/900"
          alt="ZIORA atelier"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-onyx/20" />
        <div className="page-shell relative flex min-h-[52dvh] items-end pb-12 md:min-h-[60dvh] md:pb-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-rose-light">Our Story</p>
            <h1 className="mt-3 max-w-xl text-4xl tracking-tight text-white md:text-6xl">
              Grace Beyond Modesty
            </h1>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-12 py-16 md:grid-cols-12 md:gap-16 md:py-24">
        <Reveal className="md:col-span-5">
          <p className="eyebrow mb-4">Why ZIORA</p>
          <h2 className="text-3xl tracking-tight text-onyx md:text-4xl">
            Modest fashion with the discipline of a luxury house.
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="space-y-6 text-onyx/65 md:col-span-7 md:pt-10">
          <p>
            ZIORA was founded on a clear brief: modest fashion deserves the same craftsmanship,
            attention to detail, and elegance as any global fashion house. Every piece is designed
            for the woman who moves through the world with quiet confidence.
          </p>
          <p>
            We work with considered fabrics — crepe, nida, premium cotton blends — and finish every
            garment with restraint. Nothing on a ZIORA piece is there without purpose, and every
            line is drawn with intention.
          </p>
          <p>
            Inspired by the clarity of ready-to-wear retail in Pakistan and the polish of
            international ateliers, ZIORA sits between both: commercial enough to wear daily,
            considered enough to keep.
          </p>
          <Link href="/shop" className="btn-primary mt-4 inline-flex">
            Shop the collection
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
