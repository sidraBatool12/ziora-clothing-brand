import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { ResetPasswordForm } from "@/components/auth-forms";
export const metadata = { title: "Reset Password" };
export default function ResetPasswordPage() {
  return <AuthCard title="Reset your password"><Suspense fallback={null}><ResetPasswordForm /></Suspense></AuthCard>;
}
