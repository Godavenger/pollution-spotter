import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, coordinatesSchema } from "@/lib/contracts";

export function imageInputError(file: Pick<File, "type" | "size">): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) return "Choose a JPEG, PNG, or WebP photo.";
  if (file.size === 0) return "This photo is empty. Choose another file.";
  if (file.size > MAX_IMAGE_BYTES) return "This photo is larger than 3 MB. Choose a smaller photo.";
  return null;
}

export function parseCoordinates(latitude: string, longitude: string) {
  if (!latitude.trim() || !longitude.trim()) return null;
  const result = coordinatesSchema.safeParse({ latitude: Number(latitude), longitude: Number(longitude) });
  return result.success ? result.data : null;
}
