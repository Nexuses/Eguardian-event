import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BANNER_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function extFromMime(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return ".jpg";
}

export async function saveBannerFile(file: File): Promise<string> {
  if (!file || file.size <= 0) return "";
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed for banner upload.");
  }
  if (file.size > MAX_BANNER_SIZE_BYTES) {
    throw new Error("Banner image is too large. Maximum allowed size is 5MB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || extFromMime(file.type);
  const filename = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  // On Vercel/serverless, runtime writes to `public/` are not reliably served to the browser.
  // So in production we store as an inline data URL so the banner always renders.
  const isVercel = !!process.env.VERCEL;
  const isProd = process.env.NODE_ENV === "production";
  if (isVercel || isProd) {
    const mime = file.type || "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }

  // Local/dev path (works when filesystem is writable and served).
  const publicDir = path.join(process.cwd(), "public", "events");
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(publicDir, filename), buffer);
  return `/events/${filename}`;
}
