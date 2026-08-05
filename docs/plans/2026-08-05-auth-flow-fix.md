# Authentication Flow Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make login, registration, email verification, and Google sign-in actually work in this environment, and prove it with automated tests plus a repeatable diagnostic.

**Architecture:** Keep the existing Auth.js (`next-auth` v4) JWT setup and the current UI. Extract the branching decisions (why a credential login is rejected, whether Google should be offered, whether OTP delivery succeeded) into small pure functions that can be unit-tested, then wire the existing routes to them. Add operator scripts so accounts stuck in an unverifiable state can be recovered without a working mail server.

**Tech Stack:** Next.js 16.3 (App Router, Turbopack), next-auth 4.24, Mongoose 8, Zod 3, bcryptjs, Nodemailer, Vitest (new, dev-only).

---

## Diagnosis (evidence-based)

Collected from the running dev server (`terminals/1.txt`) and `npm run diagnose:auth`.

### Evidence

```text
[next-auth][warn][NEXTAUTH_URL]
[next-auth][error][SIGNIN_OAUTH_ERROR] getaddrinfo ENOTFOUND accounts.google.com
POST /api/auth/callback/credentials 401 in 1685ms
POST /api/auth/callback/credentials 401 in 769ms
```

```text
NEXTAUTH_SECRET        MISSING (required)
NEXTAUTH_URL           MISSING (required)
GOOGLE_CLIENT_ID       not set
GOOGLE_CLIENT_SECRET   not set
EMAIL_USER             set
EMAIL_PASS             set

total: 3
ba***@gmail.com  role=customer  verified=false  hasPassword=true  providers=none
de***@gmail.com  role=customer  verified=false  hasPassword=true  providers=none
ba***@gmail.com  role=customer  verified=true   hasPassword=true  providers=none
```

### Root causes

**RC1 — Registration deadlock (this is why login 401s).**
`app/api/auth/signup/route.ts` creates the user with `isVerified: false`, then `await sendOtpEmail(...)` on line 53. Outbound SMTP fails in this environment (same DNS failure class as `accounts.google.com`). The throw escapes the handler, so:

- the account **is** created,
- the OTP token **is** created,
- the request returns **500**,
- the user never receives a code.

Then `lib/auth-options.ts:49` rejects every login for that account:

```ts
if (!user?.passwordHash || !user.isVerified) return null;
```

Two of the three real accounts are in exactly this state. This is a permanent deadlock: cannot log in, cannot verify.

**RC2 — Google button is shown when Google cannot work.**
`GoogleProvider` is registered unconditionally with `clientId: process.env.GOOGLE_CLIENT_ID || ""`. Both Google vars are unset, so the provider exists, the button renders, and clicking it produces `OAuthSignin`.

**RC3 — `NEXTAUTH_URL` / `NEXTAUTH_SECRET` unset.**
Auth currently only works because `authOptions.secret` silently falls back to `JWT_SECRET`. Missing `NEXTAUTH_URL` causes the startup warning and unreliable callback/redirect URL resolution.

**RC4 — Failure reason is invisible to the user.**
`authorize()` returns `null` for "wrong password" and "not verified" alike, so the UI shows one generic message and the user has no recovery path.

**RC5 — `providers` array is empty on all existing accounts.**
`ProfileEditor` gates the password fields on `profile.providers.includes("credentials")`, so password change is hidden for every current user.

### Non-goals

Restoring real SMTP or real Google OAuth credentials is environment configuration, not code. This plan makes both **degrade cleanly and recoverably** instead of dead-ending.

---

## Task 1: Test harness

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Step 1: Install Vitest (dev-only)**

```bash
npm install --save-dev vitest@latest
```

**Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

**Step 3: Add scripts to `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Verify the runner starts**

Run: `npm test`
Expected: exits cleanly reporting "No test files found" (or 0 tests).

**Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for auth unit tests"
```

---

## Task 2: Credential rejection reasons (fixes RC1 + RC4)

Replace the opaque `null` with a typed decision that the UI can act on.

**Files:**
- Create: `lib/auth-result.ts`
- Create: `tests/auth-result.test.ts`
- Modify: `lib/auth-options.ts`

**Step 1: Write the failing test**

```ts
// tests/auth-result.test.ts
import { describe, expect, it } from "vitest";
import { evaluateCredentialLogin } from "@/lib/auth-result";

describe("evaluateCredentialLogin", () => {
  it("rejects a missing account as invalid credentials", () => {
    expect(evaluateCredentialLogin(null, true)).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a wrong password as invalid credentials", () => {
    const user = { passwordHash: "hash", isVerified: true };
    expect(evaluateCredentialLogin(user, false)).toBe("INVALID_CREDENTIALS");
  });

  it("reports an unverified account only when the password is correct", () => {
    const user = { passwordHash: "hash", isVerified: false };
    expect(evaluateCredentialLogin(user, true)).toBe("EMAIL_NOT_VERIFIED");
  });

  it("hides the unverified state when the password is wrong", () => {
    const user = { passwordHash: "hash", isVerified: false };
    expect(evaluateCredentialLogin(user, false)).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a Google-only account with no password", () => {
    const user = { passwordHash: undefined, isVerified: true };
    expect(evaluateCredentialLogin(user, false)).toBe("NO_PASSWORD_SET");
  });

  it("allows a verified account with a correct password", () => {
    const user = { passwordHash: "hash", isVerified: true };
    expect(evaluateCredentialLogin(user, true)).toBe("OK");
  });
});
```

Note the enumeration guard: `EMAIL_NOT_VERIFIED` is only returned when the password already matched, so it never reveals whether a stranger's email exists.

**Step 2: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/auth-result`.

**Step 3: Write the implementation**

```ts
// lib/auth-result.ts
export type CredentialLoginResult =
  | "OK"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED"
  | "NO_PASSWORD_SET";

export function evaluateCredentialLogin(
  user: { passwordHash?: string | null; isVerified?: boolean } | null,
  passwordMatches: boolean
): CredentialLoginResult {
  if (!user) return "INVALID_CREDENTIALS";
  if (!user.passwordHash) return passwordMatches ? "NO_PASSWORD_SET" : "NO_PASSWORD_SET";
  if (!passwordMatches) return "INVALID_CREDENTIALS";
  if (!user.isVerified) return "EMAIL_NOT_VERIFIED";
  return "OK";
}
```

**Step 4: Run the test to confirm it passes**

Run: `npm test`
Expected: PASS (6 tests).

**Step 5: Wire it into `authorize()` in `lib/auth-options.ts`**

Replace the early-return block so a verified-but-unverified user produces a distinguishable error. `authorize` must still return `null` for genuine failures, but throwing a tagged error lets NextAuth surface the reason.

```ts
const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
const passwordMatches = user?.passwordHash
  ? await bcrypt.compare(parsed.data.password, user.passwordHash)
  : false;

const outcome = evaluateCredentialLogin(user, passwordMatches);
if (outcome === "EMAIL_NOT_VERIFIED") throw new Error("EMAIL_NOT_VERIFIED");
if (outcome !== "OK") return null;
```

Always run `bcrypt.compare` against a real-looking hash even when the user is missing, to keep timing roughly constant.

**Step 6: Commit**

```bash
git add lib/auth-result.ts lib/auth-options.ts tests/auth-result.test.ts
git commit -m "fix: distinguish unverified accounts from bad credentials at login"
```

---

## Task 3: Make OTP delivery non-fatal with an offline fallback (fixes RC1)

**Files:**
- Create: `tests/otp-delivery.test.ts`
- Create: `lib/otp-delivery.ts`
- Modify: `app/api/auth/signup/route.ts`
- Modify: `app/api/auth/resend-verification/route.ts`
- Modify: `app/api/auth/forgot-password/route.ts`

**Step 1: Write the failing test**

```ts
// tests/otp-delivery.test.ts
import { describe, expect, it, vi } from "vitest";
import { deliverOtp } from "@/lib/otp-delivery";

describe("deliverOtp", () => {
  it("reports delivered when the mailer succeeds", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await expect(deliverOtp("a@b.com", "123456", "verify", send)).resolves.toEqual({
      delivered: true,
    });
  });

  it("never throws when the mailer fails", async () => {
    const send = vi.fn().mockRejectedValue(new Error("ENOTFOUND smtp.gmail.com"));
    await expect(deliverOtp("a@b.com", "123456", "verify", send)).resolves.toEqual({
      delivered: false,
    });
  });
});
```

**Step 2: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/otp-delivery`.

**Step 3: Write the implementation**

```ts
// lib/otp-delivery.ts
type Sender = (to: string, otp: string, purpose: "verify" | "reset") => Promise<unknown>;

export async function deliverOtp(
  to: string,
  otp: string,
  purpose: "verify" | "reset",
  send: Sender
): Promise<{ delivered: boolean }> {
  try {
    await send(to, otp, purpose);
    return { delivered: true };
  } catch {
    // Mail transport is unavailable (offline dev, bad SMTP creds). The account
    // must stay recoverable, so surface the code out-of-band instead of failing.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[auth] OTP for ${to} (${purpose}): ${otp}`);
    }
    return { delivered: false };
  }
}
```

**Step 4: Run the test to confirm it passes**

Run: `npm test`
Expected: PASS.

**Step 5: Use it in all three OTP routes**

In `app/api/auth/signup/route.ts`, replace `await sendOtpEmail(email, otp, "verify");` with:

```ts
const { delivered } = await deliverOtp(email, otp, "verify", sendOtpEmail);
return NextResponse.json({ success: true, email, emailDelivered: delivered });
```

Apply the same swap in `resend-verification` and `forgot-password` so a dead mailer can never 500 a request or leak which emails exist.

**Step 6: Verify signup no longer 500s**

Run the dev server, register a brand-new email, and watch the terminal.
Expected: `POST /api/auth/signup 200`, and a `[auth] OTP for ... : 123456` line in the server console.

**Step 7: Commit**

```bash
git add lib/otp-delivery.ts tests/otp-delivery.test.ts app/api/auth
git commit -m "fix: keep signup working when OTP email delivery fails"
```

---

## Task 4: Only offer Google when it is configured (fixes RC2)

**Files:**
- Create: `tests/provider-config.test.ts`
- Create: `lib/provider-config.ts`
- Modify: `lib/auth-options.ts`
- Modify: `components/auth-forms.tsx`
- Modify: `components/site-nav.tsx`

**Step 1: Write the failing test**

```ts
// tests/provider-config.test.ts
import { describe, expect, it } from "vitest";
import { isGoogleConfigured } from "@/lib/provider-config";

describe("isGoogleConfigured", () => {
  it("is false when both vars are missing", () => {
    expect(isGoogleConfigured({})).toBe(false);
  });

  it("is false when only the id is present", () => {
    expect(isGoogleConfigured({ GOOGLE_CLIENT_ID: "id" })).toBe(false);
  });

  it("is false for blank strings", () => {
    expect(isGoogleConfigured({ GOOGLE_CLIENT_ID: "  ", GOOGLE_CLIENT_SECRET: "s" })).toBe(false);
  });

  it("is true when both are present", () => {
    expect(isGoogleConfigured({ GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret" })).toBe(true);
  });
});
```

**Step 2: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/provider-config`.

**Step 3: Write the implementation**

```ts
// lib/provider-config.ts
export function isGoogleConfigured(env: Record<string, string | undefined>): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim());
}
```

**Step 4: Run the test to confirm it passes**

Run: `npm test`
Expected: PASS (4 tests).

**Step 5: Register the provider conditionally**

In `lib/auth-options.ts`, build the array so `GoogleProvider` is only added when `isGoogleConfigured(process.env)` is true.

**Step 6: Hide the button when the provider is absent**

The login form and navbar must ask NextAuth what actually exists rather than assume:

```tsx
const [googleEnabled, setGoogleEnabled] = useState(false);

useEffect(() => {
  getProviders()
    .then((providers) => setGoogleEnabled(Boolean(providers?.google)))
    .catch(() => setGoogleEnabled(false));
}, []);
```

Render the "Continue with Google" button and its divider only when `googleEnabled`. Keep the existing classes so the design does not shift.

**Step 7: Verify in the browser**

Load `/login` with Google unset.
Expected: no Google button, no `OAuthSignin` error, email/password form unchanged visually.

**Step 8: Commit**

```bash
git add lib/provider-config.ts tests/provider-config.test.ts lib/auth-options.ts components
git commit -m "fix: only show Google sign-in when OAuth is configured"
```

---

## Task 5: Recovery scripts for stuck accounts (unblocks the 2 dead accounts)

**Files:**
- Create: `scripts/verify-user.mjs`
- Already created: `scripts/diagnose-auth.mjs`
- Modify: `package.json` (scripts already added)

**Step 1: Write `scripts/verify-user.mjs`**

It must accept an email, set `isVerified: true`, backfill `providers: ["credentials"]` when a `passwordHash` exists (fixes RC5), and refuse to run without an email argument.

**Step 2: Fix the two dead accounts**

```bash
npm run verify-user -- ba***@gmail.com
npm run verify-user -- de***@gmail.com
```

Expected: `Verified <email>` for each.

**Step 3: Confirm with the diagnostic**

Run: `npm run diagnose:auth`
Expected: every password account shows `verified=true` and `providers=credentials`.

**Step 4: Commit**

```bash
git add scripts/verify-user.mjs scripts/diagnose-auth.mjs package.json
git commit -m "feat: add auth diagnostics and manual account verification scripts"
```

---

## Task 6: Fail loudly on missing auth config (fixes RC3)

**Files:**
- Modify: `lib/auth-options.ts`
- Modify: `.env.example`
- Modify: `README.md`

**Step 1: Resolve the secret explicitly**

Throw in production when no secret is configured, and warn in development when falling back to `JWT_SECRET`, so the silent fallback stops hiding misconfiguration.

**Step 2: Document `NEXTAUTH_URL`**

Ensure `.env.example` lists `NEXTAUTH_URL=http://localhost:3000` and `NEXTAUTH_SECRET`, and that the README says both are required.

**Step 3: Add the missing keys to `.env.local`**

This is a manual, user-owned step — the file holds real secrets:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste a fresh 32-byte base64 value>
```

**Step 4: Verify the warning is gone**

Restart `npm run dev`.
Expected: no `[next-auth][warn][NEXTAUTH_URL]` line.

**Step 5: Commit**

```bash
git add lib/auth-options.ts .env.example README.md
git commit -m "chore: require explicit NextAuth secret and URL configuration"
```

---

## Task 7: Surface the verification path in the UI (completes RC4)

**Files:**
- Modify: `components/auth-forms.tsx`

**Step 1: Map the error to a recovery action**

When `signIn` returns `error === "EMAIL_NOT_VERIFIED"`, show a link to `/verify-email?email=<entered email>` instead of "Invalid email or password".

**Step 2: Verify manually**

Register a new account, do not verify, then try to log in.
Expected: "Your email isn't verified yet — Verify now" with a working link, not a generic failure.

**Step 3: Commit**

```bash
git add components/auth-forms.tsx
git commit -m "feat: guide unverified users to email verification on login"
```

---

## Task 8: Full verification pass

**Step 1: Automated**

Run: `npm test` → all tests pass.
Run: `npx tsc --noEmit` → clean.
Run: `npm run build` → succeeds.

**Step 2: Diagnostic**

Run: `npm run diagnose:auth` → required env present, no blocked accounts.

**Step 3: Manual checklist**

| Flow | Expected |
| --- | --- |
| Register new account | 200, OTP in server console, redirect to verify page |
| Verify with console OTP | Redirects to `/login?verified=1` |
| Log in as customer | Lands on `/dashboard`, navbar shows avatar |
| Log in as admin | Lands on `/admin`, no customer pages |
| Unverified login | Shows "Verify now" link |
| Wrong password | Shows generic invalid-credentials message |
| `/admin` as customer | Redirects to `/dashboard` |
| `/dashboard` logged out | Redirects to `/login` |
| Refresh after login | Still logged in |
| Logout | Returns to `/login`, navbar shows Login/Register |

---

## Rollback

Every task is a single commit. `git revert <sha>` restores prior behavior; no schema migrations are involved. `scripts/verify-user.mjs` only flips `isVerified` and backfills `providers`, both of which are safe to re-run.
