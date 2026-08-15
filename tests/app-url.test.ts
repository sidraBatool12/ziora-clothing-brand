import { describe, expect, it } from "vitest";
import { LOCAL_APP_URL, absoluteUrl, getAppUrl, syncAuthUrlFromAppUrl } from "@/lib/app-url";

describe("getAppUrl", () => {
  it("prefers NEXT_PUBLIC_APP_URL in production-like env", () => {
    expect(
      getAppUrl({
        NEXT_PUBLIC_APP_URL: "https://zioracollections.shop/",
        NEXTAUTH_URL: "http://localhost:3000",
      })
    ).toBe("https://zioracollections.shop");
  });

  it("falls back to NEXTAUTH_URL then localhost", () => {
    expect(getAppUrl({ NEXTAUTH_URL: "http://localhost:3000" })).toBe("http://localhost:3000");
    expect(getAppUrl({})).toBe(LOCAL_APP_URL);
  });

  it("builds absolute paths from the app origin", () => {
    expect(absoluteUrl("/shop", { NEXT_PUBLIC_APP_URL: "https://zioracollections.shop" })).toBe(
      "https://zioracollections.shop/shop"
    );
  });

  it("fills NEXTAUTH_URL from the app URL when missing", () => {
    const env: Record<string, string | undefined> = { NEXT_PUBLIC_APP_URL: "https://zioracollections.shop" };
    expect(syncAuthUrlFromAppUrl(env)).toBe("https://zioracollections.shop");
    expect(env.NEXTAUTH_URL).toBe("https://zioracollections.shop");
  });
});
