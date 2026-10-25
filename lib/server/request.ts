import { coordinatesSchema, MAX_IMAGE_BYTES } from "@/lib/contracts";
import { ReportError } from "./errors";

const MAX_MULTIPART_BYTES = MAX_IMAGE_BYTES + 64 * 1024;

async function readLimited(request: Request, limit: number, tooLarge = "The upload is too large. Choose a photo under 3 MB."): Promise<Uint8Array<ArrayBuffer>> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) throw new ReportError(413, tooLarge);
  if (!request.body) throw new ReportError(400, "The request is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        throw new ReportError(413, tooLarge);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

export async function readUpload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) {
    throw new ReportError(400, "Upload one photo with latitude and longitude.");
  }
  let form: FormData;
  try {
    form = await new Response(await readLimited(request, MAX_MULTIPART_BYTES), { headers: { "Content-Type": contentType } }).formData();
  } catch (error) {
    if (error instanceof ReportError) throw error;
    throw new ReportError(400, "The upload could not be read. Please select the photo again.");
  }
  const fields = ["image", "latitude", "longitude"];
  if ([...form.keys()].some((key) => !fields.includes(key)) || fields.some((key) => form.getAll(key).length !== 1)) {
    throw new ReportError(400, "Upload exactly one photo with latitude and longitude.");
  }
  const image = form.get("image");
  const latitude = form.get("latitude");
  const longitude = form.get("longitude");
  if (!(image instanceof File) || typeof latitude !== "string" || typeof longitude !== "string" || !latitude.trim() || !longitude.trim()) {
    throw new ReportError(400, "Choose a photo and confirm its location.");
  }
  if (image.size === 0 || image.size > MAX_IMAGE_BYTES) throw new ReportError(400, "Choose a photo no larger than 3 MB.");
  const coordinates = coordinatesSchema.safeParse({ latitude: Number(latitude), longitude: Number(longitude) });
  if (!coordinates.success) throw new ReportError(400, "Enter a valid latitude and longitude.");
  return { bytes: Buffer.from(await image.arrayBuffer()), mimeType: image.type, ...coordinates.data };
}

export async function readPublishBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new ReportError(400, "Submit the reviewed report as JSON.");
  }
  try {
    return JSON.parse(new TextDecoder().decode(await readLimited(request, 8192, "The reviewed report is too large. Keep the description within 240 characters.")));
  } catch (error) {
    if (error instanceof ReportError) throw error;
    throw new ReportError(400, "The reviewed report could not be read.");
  }
}
