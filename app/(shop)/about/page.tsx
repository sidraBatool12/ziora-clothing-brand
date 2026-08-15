import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion-reveal";

export const metadata = { title: "About" };

const reasons = [
  "Premium Quality Fabrics",
  "Elegant & Modest Designs",
  "Carefully Curated Collections",
  "Customer-Centered Experience",
  "Delivery Across Pakistan",
  "Commitment to Quality & Style",
];

const values = [
  {
    title: "Quality",
    body: "We prioritize excellence in every fabric, stitch, and design.",
  },
  {
    title: "Elegance",
    body: "We create timeless pieces that reflect grace and sophistication.",
  },
  {
    title: "Trust",
    body: "We value honesty, transparency, and customer satisfaction.",
  },
  {
    title: "Innovation",
    body: "We continuously evolve to bring fresh ideas and modern fashion trends.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-onyx/10 bg-mist/40">
        <div className="page-shell py-16 md:py-24">
          <p className="eyebrow mb-4">About ZIORA</p>
          <h1 className="max-w-2xl text-4xl tracking-tight text-onyx md:text-6xl">
            Grace Beyond Modesty
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-onyx/60 md:text-base">
            A premium modest fashion house founded in 2026 to celebrate elegance, confidence, and
            individuality.
          </p>
        </div>
      </section>

      <section className="page-shell py-16 md:py-24">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="eyebrow mb-8">Meet Our Founder</p>
          <div className="flex h-44 w-44 items-center justify-center rounded-full bg-mist ring-1 ring-onyx/10 md:h-56 md:w-56">
            <div className="relative h-[86%] w-[86%] overflow-hidden rounded-full">
              <Image
                src="/about/sidra-batool-founder-circle.png"
                alt="Sidra Batool, Founder & Full Stack Developer of ZIORA"
                fill
                priority
                className="object-cover object-center"
                sizes="192px"
              />
            </div>
          </div>
          <h2 className="mt-8 text-3xl tracking-tight text-onyx md:text-4xl">Sidra Batool</h2>
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-rose">
            Founder & Full Stack Developer
          </p>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-onyx/65 md:text-[15px]">
            <p>
              Sidra Batool is a passionate Full Stack Developer, entrepreneur, and creative thinker.
              With a strong background in technology and a love for fashion, she founded ZIORA in
              2026 with the vision of building a brand that represents elegance, quality, and modern
              modest wear.
            </p>
            <p>
              By combining innovation, creativity, and attention to detail, she transformed her
              vision into a growing fashion brand dedicated to serving women who value both style
              and comfort.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-onyx/10 bg-white">
        <div className="page-shell grid gap-12 py-16 md:grid-cols-12 md:gap-16 md:py-24">
          <Reveal className="md:col-span-5">
            <p className="eyebrow mb-4">Our Story</p>
            <h2 className="text-3xl tracking-tight text-onyx md:text-4xl">
              Founded in 2026 to celebrate elegance, confidence, and individuality.
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="space-y-6 text-onyx/65 md:col-span-7 md:pt-10">
            <p>
              ZIORA is a premium modest fashion brand created to celebrate elegance, confidence, and
              individuality. We believe that fashion should be more than just clothing—it should be a
              reflection of personality, grace, and self-expression.
            </p>
            <p>
              At ZIORA, we carefully select quality fabrics and create timeless designs that combine
              modern trends with modest fashion. Our goal is to provide women with outfits that are
              stylish, comfortable, and made to inspire confidence in every moment.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="page-shell grid gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24">
        <Reveal>
          <p className="eyebrow mb-4">Our Mission</p>
          <h2 className="text-2xl tracking-tight text-onyx md:text-3xl">
            Premium modest fashion, made accessible.
          </h2>
          <p className="mt-5 text-onyx/65">
            Our mission is to make premium modest fashion accessible to every woman by offering
            high-quality products, elegant designs, and a seamless shopping experience.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="eyebrow mb-4">Our Vision</p>
          <h2 className="text-2xl tracking-tight text-onyx md:text-3xl">
            A trusted house of quality and elegance.
          </h2>
          <p className="mt-5 text-onyx/65">
            To become a trusted fashion brand recognized for quality, elegance, and innovation,
            inspiring women to express their confidence through timeless style.
          </p>
        </Reveal>
      </section>

      <section className="bg-onyx text-white">
        <div className="page-shell py-16 md:py-24">
          <Reveal>
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-rose-light">Why Choose ZIORA</p>
            <h2 className="max-w-xl text-3xl tracking-tight md:text-4xl">
              Crafted for women who value both style and comfort.
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason, index) => (
              <Reveal key={reason} delay={index * 0.04}>
                <li className="border border-white/10 px-5 py-6 text-sm tracking-tight text-white/85">
                  {reason}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-shell py-16 md:py-24">
        <Reveal>
          <p className="eyebrow mb-4">Our Values</p>
          <h2 className="max-w-xl text-3xl tracking-tight text-onyx md:text-4xl">
            The principles behind every ZIORA piece.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.05}>
              <h3 className="text-xl tracking-tight text-onyx">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-onyx/60">{value.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-onyx/10 bg-white">
        <div className="page-shell py-16 text-center md:py-24">
          <Reveal>
            <p className="eyebrow mb-4">Join the ZIORA Family</p>
            <h2 className="mx-auto max-w-2xl text-3xl tracking-tight text-onyx md:text-4xl">
              Everyday elegance and statement pieces, made to wear with confidence.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-onyx/65">
              Whether you&apos;re looking for everyday elegance or statement pieces for special
              occasions, ZIORA is here to help you express your style with confidence.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-rose">
              Grace Beyond Modesty.
            </p>
            <Link href="/shop" className="btn-primary mt-8 inline-flex">
              Shop the collection
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
