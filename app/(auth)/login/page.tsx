import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/auth-forms";
export const metadata = { title: "Sign In" };
export default function LoginPage() {
  return <AuthCard title="Welcome back"><Suspense fallback={null}><LoginForm /></Suspense></AuthCard>;
}
