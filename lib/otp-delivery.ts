type OtpPurpose = "verify" | "reset";
type Sender = (to: string, otp: string, purpose: OtpPurpose) => Promise<unknown>;

/**
 * Sending must never fail the surrounding request: the account and OTP row are
 * already persisted by then, so a throw would leave the user registered but
 * unable to verify. When transport is unavailable outside production the code
 * is logged so local sign-up stays completable.
 */
export async function deliverOtp(
  to: string,
  otp: string,
  purpose: OtpPurpose,
  send: Sender
): Promise<{ delivered: boolean }> {
  try {
    await send(to, otp, purpose);
    return { delivered: true };
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[auth] OTP for ${to} (${purpose}): ${otp}`);
    }
    return { delivered: false };
  }
}
