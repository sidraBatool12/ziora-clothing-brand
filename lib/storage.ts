import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { uploadImage as uploadToCloudinary, deleteImage as deleteFromCloudinary } from "@/lib/cloudinary";

export interface StoredImage {
  url: string;
  publicId: string;
}

const LOCAL_PREFIX = "local:";
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function parseDataUrl(dataUrl: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  const [, mime, base64] = match;
  const extension = MIME_EXTENSIONS[mime.toLowerCase()];
  if (!extension) return null;
  return { extension, buffer: Buffer.from(base64, "base64") };
}

/**
 * Cloudinary is the real backend. Without credentials we fall back to the local
 * public folder so development is not blocked, but never in production where
 * the filesystem is typically ephemeral and unserved.
 */
export async function storeImage(dataUrl: string, folder: string): Promise<StoredImage> {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(dataUrl, folder);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("IMAGE_STORAGE_NOT_CONFIGURED");
  }

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error("UNSUPPORTED_IMAGE_FORMAT");

  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "");
  const fileName = `${randomUUID()}.${parsed.extension}`;
  const relativeDir = path.posix.join("uploads", safeFolder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, fileName), parsed.buffer);

  const relativePath = path.posix.join(relativeDir, fileName);
  return { url: `/${relativePath}`, publicId: `${LOCAL_PREFIX}${relativePath}` };
}

export async function removeImage(publicId: string): Promise<void> {
  if (!publicId) return;

  if (publicId.startsWith(LOCAL_PREFIX)) {
    const relativePath = publicId.slice(LOCAL_PREFIX.length);
    // Guard against traversal before touching the filesystem.
    if (relativePath.includes("..")) return;
    await unlink(path.join(process.cwd(), "public", relativePath)).catch(() => undefined);
    return;
  }

  await deleteFromCloudinary(publicId);
}
