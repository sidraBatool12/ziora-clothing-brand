import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-ivory px-4 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-mist blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-rose/10 blur-3xl" />
      <div className="relative w-full max-w-md border border-onyx/10 bg-white/90 p-8 shadow-[0_24px_60px_-30px_rgba(20,20,20,0.25)] backdrop-blur-sm md:p-10">
        <Link href="/" className="mb-1 block text-center text-xl font-semibold tracking-[0.28em] text-onyx">
          ZIORA
        </Link>
        <p className="eyebrow mb-8 text-center">Grace Beyond Modesty</p>
        <h1 className="text-center text-2xl tracking-tight text-onyx">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-onyx/55">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
