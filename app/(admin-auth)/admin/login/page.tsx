import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ShieldCheck, Storefront } from "@phosphor-icons/react/dist/ssr";
import { authOptions } from "@/lib/auth-options";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = { title: "Admin Sign In" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "admin") redirect("/admin");

  return (
    <main className="grid min-h-[100dvh] bg-[#F3F1ED] font-sans lg:grid-cols-[0.82fr_1.18fr]">
      <section className="relative flex flex-col justify-between overflow-hidden bg-[#171716] px-6 py-7 text-white sm:px-10 lg:px-14 lg:py-12">
        <div className="absolute -right-28 top-1/4 h-80 w-80 rounded-full bg-rose/20 blur-3xl" aria-hidden />
        <Link href="/" className="relative z-10 inline-flex w-fit items-end gap-3">
          <span className="text-xl font-semibold tracking-[0.3em]">ZIORA</span>
          <span className="mb-0.5 rounded-full bg-white/[0.08] px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-white/55">
            Operations
          </span>
        </Link>

        <div className="relative z-10 hidden max-w-md lg:block">
          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#D9A0A8]">Private workspace</p>
          <h1 className="max-w-sm text-4xl font-medium leading-[1.05] tracking-[-0.04em]">
            The quiet side of the storefront.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/43">
            Manage clothing, customer orders, payment verification and delivery from one protected workspace.
          </p>
        </div>

        <div className="relative z-10 hidden items-center gap-2 text-[10px] text-white/30 lg:flex">
          <ShieldCheck size={14} weight="light" />
          Role-protected administrator access
        </div>
      </section>

      <section className="flex items-center px-4 py-12 sm:px-8 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[29rem]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <p className="text-[10px] uppercase tracking-[0.2em] text-onyx/40">Administrator access</p>
            <Link href="/" className="flex items-center gap-1.5 text-[11px] text-onyx/50">
              Store
              <Storefront size={14} weight="light" />
            </Link>
          </div>

          <div className="rounded-[2rem] bg-onyx/[0.035] p-1.5 ring-1 ring-inset ring-onyx/[0.05]">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#FAF9F7] px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-9 sm:py-10">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose/10 text-rose">
                <ShieldCheck size={20} weight="fill" />
              </span>
              <p className="mt-7 text-[10px] uppercase tracking-[0.22em] text-rose">Secure portal</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em] text-onyx">Welcome back</h2>
              <p className="mt-2 text-sm leading-relaxed text-onyx/48">
                Sign in with an account assigned the administrator role.
              </p>
              <AdminLoginForm />
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-onyx/35">
            Customer accounts cannot access this portal.
          </p>
        </div>
      </section>
    </main>
  );
}
