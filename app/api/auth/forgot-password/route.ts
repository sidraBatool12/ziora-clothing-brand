import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User, OtpToken } from "@/models/user";
import { generateOtp } from "@/lib/utils";
import { sendOtpEmail } from "@/lib/email";
import { deliverOtp } from "@/lib/otp-delivery";

const schema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { email } = parsed.data;

  await connectDB();
  const user = await User.findOne({ email });
  if (user) {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60_000);
    await OtpToken.create({ email, otpHash, purpose: "reset", expiresAt });
    await deliverOtp(email, otp, "reset", sendOtpEmail);
  }
  // Always return success — avoids leaking which emails have accounts.
  return NextResponse.json({ success: true });
}
