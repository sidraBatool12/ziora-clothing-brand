"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { ArrowRight, Eye, EyeSlash, LockKey } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const fieldClass =
  "w-full rounded-2xl bg-white px-4 py-3.5 text-sm text-onyx outline-none ring-1 ring-inset ring-onyx/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-onyx/28 focus:ring-rose/55";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin",
    });

    if (!result?.ok) {
      setSubmitting(false);
      setError(
        result?.error?.includes("EMAIL_NOT_VERIFIED")
          ? "This administrator account is not verified."
          : "The email or password is incorrect."
      );
      return;
    }

    const session = await getSession();
    if (session?.user?.role !== "admin") {
      await signOut({ redirect: false });
      setSubmitting(false);
      setError("This portal is restricted to ZIORA administrators.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-9 space-y-5">
      <div className="space-y-2">
        <label htmlFor="admin-email" className="block text-[10px] uppercase tracking-[0.18em] text-onyx/45">
          Administrator email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
          placeholder="admin@ziora.pk"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="admin-password" className="block text-[10px] uppercase tracking-[0.18em] text-onyx/45">
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${fieldClass} pr-12`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-1 flex w-11 items-center justify-center text-onyx/35 transition-colors hover:text-onyx"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeSlash size={18} weight="light" /> : <Eye size={18} weight="light" />}
          </button>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="rounded-xl bg-rose/[0.08] px-3.5 py-3 text-xs leading-relaxed text-rose ring-1 ring-inset ring-rose/15"
        >
          {error}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group flex w-full items-center justify-between rounded-full bg-onyx py-1.5 pl-6 pr-1.5 text-xs uppercase tracking-[0.16em] text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#242422] active:scale-[0.98] disabled:cursor-wait disabled:opacity-55"
      >
        <span>{submitting ? "Checking access" : "Enter admin panel"}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
          {submitting ? (
            <LockKey size={16} weight="light" className="animate-pulse" />
          ) : (
            <ArrowRight size={16} weight="light" />
          )}
        </span>
      </button>
    </form>
  );
}
