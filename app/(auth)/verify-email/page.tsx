import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { VerifyEmailForm } from "@/components/auth-forms";
export const metadata = { title: "Verify Email" };
export default function VerifyEmailPage() {
  return <AuthCard title="Verify your email"><Suspense fallback={null}><VerifyEmailForm /></Suspense></AuthCard>;
}
