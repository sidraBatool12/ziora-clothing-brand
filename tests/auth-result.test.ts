import { describe, expect, it } from "vitest";
import { evaluateCredentialLogin } from "@/lib/auth-result";

describe("evaluateCredentialLogin", () => {
  it("rejects a missing account as invalid credentials", () => {
    expect(evaluateCredentialLogin(null, true)).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a wrong password as invalid credentials", () => {
    expect(evaluateCredentialLogin({ passwordHash: "hash", isVerified: true }, false)).toBe(
      "INVALID_CREDENTIALS"
    );
  });

  it("reports an unverified account only when the password is correct", () => {
    expect(evaluateCredentialLogin({ passwordHash: "hash", isVerified: false }, true)).toBe(
      "EMAIL_NOT_VERIFIED"
    );
  });

  it("hides the unverified state when the password is wrong", () => {
    expect(evaluateCredentialLogin({ passwordHash: "hash", isVerified: false }, false)).toBe(
      "INVALID_CREDENTIALS"
    );
  });

  it("reports a Google-only account that has no password set", () => {
    expect(evaluateCredentialLogin({ passwordHash: undefined, isVerified: true }, false)).toBe(
      "NO_PASSWORD_SET"
    );
  });

  it("allows a verified account with a correct password", () => {
    expect(evaluateCredentialLogin({ passwordHash: "hash", isVerified: true }, true)).toBe("OK");
  });
});
