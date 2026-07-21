"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const inputClass = "w-full border border-onyx/15 bg-white px-4 py-3 text-sm outline-none focus-visible:border-gold";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest text-onyx/60";
const btnClass = "w-full bg-onyx py-3 text-sm uppercase tracking-widest text-white transition hover:bg-onyx/90 disabled:opacity-50";

/* ================= Customer Signup ================= */
const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type SignupInput = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setServerError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) return setServerError(data.error || "Something went wrong.");
    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div><label className={labelClass}>Full name</label><input {...register("name")} className={inputClass} />{errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}</div>
      <div><label className={labelClass}>Email</label><input type="email" {...register("email")} className={inputClass} />{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}</div>
      <div><label className={labelClass}>Phone number</label><input {...register("phone")} className={inputClass} />{errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}</div>
      <div><label className={labelClass}>Password</label><input type="password" {...register("password")} className={inputClass} />{errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}</div>
      <div><label className={labelClass}>Confirm password</label><input type="password" {...register("confirmPassword")} className={inputClass} />{errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}</div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className={btnClass}>{isSubmitting ? "Creating account…" : "Create account"}</button>
      <p className="text-center text-sm text-onyx/60">Already have an account? <Link href="/login" className="underline">Sign in</Link></p>
    </form>
  );
}

/* ================= Admin Signup ================= */
const adminSignupSchema = z.object({
  name: z.string().min(2), email: z.string().email(), password: z.string().min(8), adminSecretKey: z.string().min(1),
});
type AdminSignupInput = z.infer<typeof adminSignupSchema>;

export function AdminSignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminSignupInput>({ resolver: zodResolver(adminSignupSchema) });

  async function onSubmit(values: AdminSignupInput) {
    setServerError(null);
    const res = await fetch("/api/auth/admin-signup", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) return setServerError(data.error || "Something went wrong.");
    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div><label className={labelClass}>Name</label><input {...register("name")} className={inputClass} />{errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}</div>
      <div><label className={labelClass}>Email</label><input type="email" {...register("email")} className={inputClass} />{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}</div>
      <div><label className={labelClass}>Password</label><input type="password" {...register("password")} className={inputClass} />{errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}</div>
      <div><label className={labelClass}>Admin secret key</label><input type="password" {...register("adminSecretKey")} className={inputClass} />{errors.adminSecretKey && <p className="mt-1 text-xs text-red-600">{errors.adminSecretKey.message}</p>}</div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className={btnClass}>{isSubmitting ? "Creating admin account…" : "Create admin account"}</button>
    </form>
  );
}

/* ================= Verify Email (OTP) ================= */
export function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp, purpose: "verify" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Invalid code.");
    router.push(data.redirect || "/dashboard");
    router.refresh();
  }

  async function resend() {
    await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setResent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-center text-sm text-onyx/60">We sent a 6-digit code to <strong>{email}</strong></p>
      <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} inputMode="numeric" className={`${inputClass} text-center text-2xl tracking-[0.5em]`} placeholder="000000" />
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading || otp.length !== 6} className={btnClass}>{loading ? "Verifying…" : "Verify Email"}</button>
      <button type="button" onClick={resend} className="w-full text-center text-xs text-gold underline">{resent ? "New code sent" : "Resend code"}</button>
    </form>
  );
}

/* ================= Login ================= */
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null); setNeedsVerification(null);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await res.json();
    if (!res.ok) {
      if (data.needsVerification) setNeedsVerification(values.email);
      else setServerError(data.error || "Invalid email or password.");
      return;
    }
    router.push(params.get("redirect") || data.redirect || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div><label className={labelClass}>Email</label><input type="email" {...register("email")} className={inputClass} />{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}</div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className={labelClass}>Password</label>
          <Link href="/forgot-password" className="text-xs text-gold underline">Forgot password?</Link>
        </div>
        <input type="password" {...register("password")} className={inputClass} />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {needsVerification && (
        <p className="text-sm text-onyx/70">
          Please verify your email first.{" "}
          <Link href={`/verify-email?email=${encodeURIComponent(needsVerification)}`} className="underline text-gold">Verify now</Link>
        </p>
      )}
      <button type="submit" disabled={isSubmitting} className={btnClass}>{isSubmitting ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm text-onyx/60">New to ZIORA? <Link href="/signup" className="underline">Create an account</Link></p>
    </form>
  );
}

/* ================= Forgot Password ================= */
export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setSent(true);
    setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 1200);
  }

  if (sent) return <p className="text-center text-sm text-onyx/70">If an account exists, a code is on its way.</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div><label className={labelClass}>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></div>
      <button type="submit" className={btnClass}>Send reset code</button>
    </form>
  );
}

/* ================= Reset Password ================= */
export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp, purpose: "reset" }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Invalid code.");
    setResetToken(data.resetToken); setStep("password");
  }

  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resetToken, newPassword: password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Something went wrong.");
    router.push("/login");
  }

  if (step === "otp") {
    return (
      <form onSubmit={verifyOtp} className="space-y-5">
        <p className="text-center text-sm text-onyx/60">Enter the code sent to <strong>{email}</strong></p>
        <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className={`${inputClass} text-center text-2xl tracking-[0.5em]`} placeholder="000000" />
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={otp.length !== 6} className={btnClass}>Verify code</button>
      </form>
    );
  }

  return (
    <form onSubmit={submitNewPassword} className="space-y-5">
      <div><label className={labelClass}>New password</label><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} /></div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className={btnClass}>Reset password</button>
    </form>
  );
}
