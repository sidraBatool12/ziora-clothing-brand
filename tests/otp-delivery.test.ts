import { describe, expect, it, vi } from "vitest";
import { deliverOtp } from "@/lib/otp-delivery";

describe("deliverOtp", () => {
  it("reports delivered when the mailer succeeds", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await expect(deliverOtp("a@b.com", "123456", "verify", send)).resolves.toEqual({
      delivered: true,
    });
    expect(send).toHaveBeenCalledWith("a@b.com", "123456", "verify");
  });

  it("never throws when the mailer fails", async () => {
    const send = vi.fn().mockRejectedValue(new Error("ENOTFOUND smtp.gmail.com"));
    await expect(deliverOtp("a@b.com", "123456", "verify", send)).resolves.toEqual({
      delivered: false,
      error: "ENOTFOUND smtp.gmail.com",
    });
  });

  it("still resolves when the mailer rejects for a reset code", async () => {
    const send = vi.fn().mockRejectedValue(new Error("auth failed"));
    await expect(deliverOtp("a@b.com", "654321", "reset", send)).resolves.toEqual({
      delivered: false,
      error: "auth failed",
    });
  });
});
