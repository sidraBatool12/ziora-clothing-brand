import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { isCloudinaryConfigured, removeImage, storeImage } from "@/lib/storage";

// 1x1 transparent PNG.
const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const createdDir = path.join(process.cwd(), "public", "uploads", "ziora");

afterAll(async () => {
  await rm(createdDir, { recursive: true, force: true });
});

describe("isCloudinaryConfigured", () => {
  it("is false when credentials are absent", () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    expect(isCloudinaryConfigured()).toBe(false);
  });
});

describe("storeImage local fallback", () => {
  it("writes the decoded image and returns a servable url", async () => {
    const stored = await storeImage(PNG_DATA_URL, "ziora/products");

    expect(stored.url).toMatch(/^\/uploads\/ziora\/products\/[\w-]+\.png$/);
    expect(stored.publicId).toBe(`local:${stored.url.slice(1)}`);

    const written = await readFile(path.join(process.cwd(), "public", stored.url));
    expect(written.length).toBeGreaterThan(0);

    await removeImage(stored.publicId);
    await expect(readFile(path.join(process.cwd(), "public", stored.url))).rejects.toThrow();
  });

  it("rejects non-image payloads", async () => {
    await expect(storeImage("data:application/pdf;base64,AAAA", "ziora/products")).rejects.toThrow(
      "UNSUPPORTED_IMAGE_FORMAT"
    );
  });

  it("ignores traversal attempts when removing local files", async () => {
    await expect(removeImage("local:../../package.json")).resolves.toBeUndefined();
    await expect(readFile(path.join(process.cwd(), "package.json"))).resolves.toBeTruthy();
  });
});
