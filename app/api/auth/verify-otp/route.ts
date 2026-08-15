import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User, OtpToken } from "@/models/user";
import { sendEmailVerifiedEmail } from "@/lib/email";
import { notifyLater } from "@/lib/notify";

const schema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  otp: z.string().length(6),
  purpose: z.enum(["verify", "reset"]).default("verify"),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { email, otp, purpose } = parsed.data;

  await connectDB();
  const record = await OtpToken.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "This code has expired. Request a new one." }, { status: 400 });
  }
  const valid = await bcrypt.compare(otp, record.otpHash);
  if (!valid) return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });

  await OtpToken.deleteMany({ email, purpose });

  if (purpose === "verify") {
    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    notifyLater("email-verified", sendEmailVerifiedEmail(user.email, user.name));
    return NextResponse.json({ success: true, redirect: "/login?verified=1" });
  }

  // purpose === "reset": issue a short-lived, single-purpose reset token
  // rather than trusting a bare email on the next request.
  const resetToken = jwt.sign({ email, purpose: "password_reset" }, process.env.JWT_SECRET as string, { expiresIn: "10m" });
  return NextResponse.json({ success: true, resetToken });
}
