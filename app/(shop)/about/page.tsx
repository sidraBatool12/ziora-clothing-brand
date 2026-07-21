export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 md:px-12">
      <p className="eyebrow mb-3">Our Story</p>
      <h1 className="mb-8 text-3xl text-onyx md:text-4xl">Grace Beyond Modesty</h1>
      <div className="space-y-6 text-onyx/70">
        <p>
          ZIORA was founded on a simple belief: modest fashion deserves the same craftsmanship,
          attention to detail, and elegance as any luxury fashion house. Inspired by the timeless
          silhouettes of Dior, Chanel, and Elie Saab, every ZIORA piece is designed for the woman
          who moves through the world with quiet confidence.
        </p>
        <p>
          We work with considered fabrics — crepe, nida, premium cotton blends — and finish every
          garment by hand. Our philosophy is restraint: nothing on a ZIORA piece is there without
          purpose, and every line is drawn with intention.
        </p>
        <p>
          Grace Beyond Modesty isn't just our tagline. It's the standard we hold every collection to.
        </p>
      </div>
    </main>
  );
}
