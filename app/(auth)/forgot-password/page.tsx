import { AuthCard } from "@/components/auth-card";
import { ForgotPasswordForm } from "@/components/auth-forms";
export const metadata = { title: "Forgot Password" };
export default function ForgotPasswordPage() {
  return <AuthCard title="Forgot your password?" subtitle="We'll email you a reset code."><ForgotPasswordForm /></AuthCard>;
}
