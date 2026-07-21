import { AuthCard } from "@/components/auth-card";
import { AdminSignupForm } from "@/components/auth-forms";
export const metadata = { title: "Admin Registration" };
export default function AdminSignupPage() {
  return <AuthCard title="Admin Registration" subtitle="Requires a valid admin secret key."><AdminSignupForm /></AuthCard>;
}
