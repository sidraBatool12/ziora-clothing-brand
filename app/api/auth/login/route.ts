import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { setAuthCookie } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { email, password } = parsed.data;

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  if (!user.isVerified) {
    return NextResponse.json({ error: "Please verify your email first.", needsVerification: true }, { status: 403 });
  }

  await setAuthCookie({ userId: user._id.toString(), email: user.email, role: user.role });
  return NextResponse.json({ success: true, role: user.role, redirect: user.role === "admin" ? "/admin" : "/dashboard" });
}
