export type CredentialLoginResult =
  | "OK"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED"
  | "NO_PASSWORD_SET";

/**
 * `EMAIL_NOT_VERIFIED` is only reachable once the password already matched, so
 * the caller can explain the real blocker without letting a stranger probe
 * which addresses have accounts.
 */
export function evaluateCredentialLogin(
  user: { passwordHash?: string | null; isVerified?: boolean } | null,
  passwordMatches: boolean
): CredentialLoginResult {
  if (!user) return "INVALID_CREDENTIALS";
  if (!user.passwordHash) return "NO_PASSWORD_SET";
  if (!passwordMatches) return "INVALID_CREDENTIALS";
  if (!user.isVerified) return "EMAIL_NOT_VERIFIED";
  return "OK";
}
