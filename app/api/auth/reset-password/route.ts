import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";

const schema = z.object({ resetToken: z.string(), newPassword: z.string().min(8) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { resetToken, newPassword } = parsed.data;

  let payload: { email: string; purpose: string };
  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET as string) as typeof payload;
  } catch {
    return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
  }
  if (payload.purpose !== "password_reset") return NextResponse.json({ error: "Invalid reset token." }, { status: 400 });

  await connectDB();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const user = await User.findOneAndUpdate({ email: payload.email }, { passwordHash });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  return NextResponse.json({ success: true });
}
