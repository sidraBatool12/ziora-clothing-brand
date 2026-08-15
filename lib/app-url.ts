export const LOCAL_APP_URL = "http://localhost:3000";

type EnvLike = Record<string, string | undefined>;

function normalizeOrigin(value?: string) {
  if (!value?.trim()) return null;
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

/**
 * Public site origin. Production should set NEXT_PUBLIC_APP_URL.
 * Local dev falls back to NEXTAUTH_URL, then localhost:3000.
 */
export function getAppUrl(env: EnvLike = process.env) {
  return (
    normalizeOrigin(env.NEXT_PUBLIC_APP_URL) ||
    normalizeOrigin(env.NEXT_PUBLIC_SITE_URL) ||
    normalizeOrigin(env.NEXTAUTH_URL) ||
    LOCAL_APP_URL
  );
}

export function absoluteUrl(path = "/", env: EnvLike = process.env) {
  const base = getAppUrl(env);
  if (!path || path === "/") return `${base}/`;
  return new URL(path.startsWith("/") ? path : `/${path}`, `${base}/`).toString();
}

/** Keep NextAuth callbacks on the same origin as the public app URL. */
export function syncAuthUrlFromAppUrl(env: EnvLike = process.env) {
  if (!env.NEXTAUTH_URL) {
    env.NEXTAUTH_URL = getAppUrl(env);
  }
  return env.NEXTAUTH_URL;
}
