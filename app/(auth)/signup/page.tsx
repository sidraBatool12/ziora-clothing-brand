import { AuthCard } from "@/components/auth-card";
import { SignupForm } from "@/components/auth-forms";
export const metadata = { title: "Create Account" };
export default function SignupPage() {
  return <AuthCard title="Create your account" subtitle="Join ZIORA."><SignupForm /></AuthCard>;
}
