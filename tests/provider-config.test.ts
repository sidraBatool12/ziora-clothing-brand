import { describe, expect, it } from "vitest";
import { isGoogleConfigured } from "@/lib/provider-config";

describe("isGoogleConfigured", () => {
  it("is false when both vars are missing", () => {
    expect(isGoogleConfigured({})).toBe(false);
  });

  it("is false when only the client id is present", () => {
    expect(isGoogleConfigured({ GOOGLE_CLIENT_ID: "id" })).toBe(false);
  });

  it("is false when only the client secret is present", () => {
    expect(isGoogleConfigured({ GOOGLE_CLIENT_SECRET: "secret" })).toBe(false);
  });

  it("is false for blank strings", () => {
    expect(isGoogleConfigured({ GOOGLE_CLIENT_ID: "   ", GOOGLE_CLIENT_SECRET: "secret" })).toBe(
      false
    );
  });

  it("is true when both are present", () => {
    expect(isGoogleConfigured({ GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret" })).toBe(
      true
    );
  });
});
