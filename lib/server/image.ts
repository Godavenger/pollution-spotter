import sharp from "sharp";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/contracts";
import { ReportError } from "./errors";

const formats: Record<string, string> = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" };

export async function normalizeImage(bytes: Buffer, mimeType: string): Promise<Buffer> {
  if (!ACCEPTED_IMAGE_TYPES.includes(mimeType as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new ReportError(400, "Choose a JPEG, PNG or WebP photo.");
  }
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    throw new ReportError(400, "Choose a photo no larger than 3 MB.");
  }
  try {
    const options = { limitInputPixels: 40_000_000, failOn: "warning" as const };
    const metadata = await sharp(bytes, options).metadata();
    if (metadata.format !== formats[mimeType] || (metadata.pages ?? 1) !== 1) {
      throw new ReportError(400, "Choose a still JPEG, PNG or WebP photo that matches its file type.");
    }
    // Sharp strips metadata by default. Apply orientation before discarding EXIF.
    const normalized = await sharp(bytes, options)
      .rotate()
      .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 85 })
      .toBuffer();
    if (normalized.length > MAX_IMAGE_BYTES) {
      throw new ReportError(400, "This photo is too large to save. Choose a smaller image.");
    }
    return normalized;
  } catch (error) {
    if (error instanceof ReportError) throw error;
    throw new ReportError(400, "We couldn't read this photo. Choose a valid image under 3 MB and 40 megapixels.");
  }
}
