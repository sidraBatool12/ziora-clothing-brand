export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-beige/40 px-4 py-16">
      <div className="w-full max-w-md border border-onyx/10 bg-white px-8 py-10">
        <p className="mb-1 text-center text-2xl tracking-widest text-onyx">ZIORA</p>
        <p className="eyebrow mb-6 text-center">Grace Beyond Modesty</p>
        <h1 className="text-center text-2xl text-onyx">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-onyx/60">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
