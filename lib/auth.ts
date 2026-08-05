import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/user";

export async function getCurrentUser(): Promise<(IUser & { _id: string }) | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

/** Page/layout use — throws a redirect (correct in Server Components). */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/");
  return user;
}

/**
 * API-route-safe variants — next/navigation's redirect() doesn't behave
 * correctly inside Route Handlers. These return null instead; the caller
 * responds with the appropriate 401/403 JSON.
 */
export async function getUserOrNull() {
  return getCurrentUser();
}
export async function getAdminOrNull() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
