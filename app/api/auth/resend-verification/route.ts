import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { OtpToken, User } from "@/models/user";
import { sendOtpEmail } from "@/lib/email";
import { deliverOtp } from "@/lib/otp-delivery";
import { generateOtp } from "@/lib/utils";

const schema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email, isVerified: false });
  if (user) {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60_000
    );

    await OtpToken.deleteMany({ email: user.email, purpose: "verify" });
    await OtpToken.create({ email: user.email, otpHash, purpose: "verify", expiresAt });
    await deliverOtp(user.email, otp, "verify", sendOtpEmail);
  }

  return NextResponse.json({ success: true });
}
