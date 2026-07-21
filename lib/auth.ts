import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/user";

const JWT_SECRET = process.env.JWT_SECRET as string;
const COOKIE_NAME = "ziora_token";

export interface JwtPayload {
  userId: string;
  email: string;
  role: "customer" | "admin";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload: JwtPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<(IUser & { _id: string }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

/** Page/layout use — throws a redirect (correct in Server Components). */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
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
