import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES } from "@/lib/contracts";
import { normalizeImage } from "@/lib/server/image";
import { readPublishBody, readUpload } from "@/lib/server/request";

async function tinyPng() {
  return sharp({ create: { width: 8, height: 4, channels: 3, background: "#456758" } }).png().toBuffer();
}

function uploadRequest(bytes: Uint8Array, extras: Record<string, string> = {}) {
  const form = new FormData();
  form.set("image", new Blob([new Uint8Array(bytes)], { type: "image/png" }), "photo.png");
  form.set("latitude", "22.57");
  form.set("longitude", "88.36");
  for (const [key, value] of Object.entries(extras)) form.set(key, value);
  return new Request("https://example.test/api/reports", { method: "POST", body: form });
}

describe("photo normalization", () => {
  it("decodes and saves a JPEG without embedded EXIF metadata", async () => {
    const original = await sharp(await tinyPng()).withExif({ IFD0: { Artist: "private metadata" } }).png().toBuffer();
    expect((await sharp(original).metadata()).exif).toBeDefined();
    const result = await normalizeImage(original, "image/png");
    const metadata = await sharp(result).metadata();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(8);
    expect(metadata.exif).toBeUndefined();
    expect(result.includes(Buffer.from("private metadata"))).toBe(false);
  });

  it("rejects corrupt, unsupported, disguised and oversized files", async () => {
    await expect(normalizeImage(Buffer.from("not an image"), "image/png")).rejects.toMatchObject({ status: 400 });
    await expect(normalizeImage(await tinyPng(), "image/svg+xml")).rejects.toMatchObject({ status: 400 });
    await expect(normalizeImage(await tinyPng(), "image/jpeg")).rejects.toMatchObject({ status: 400 });
    await expect(normalizeImage(Buffer.alloc(MAX_IMAGE_BYTES + 1), "image/png")).rejects.toMatchObject({ status: 400 });
  });
});

describe("bounded upload and review bodies", () => {
  it("accepts exactly one image and valid coordinates", async () => {
    const png = await tinyPng();
    const upload = await readUpload(uploadRequest(png));
    expect(upload).toMatchObject({ bytes: png, mimeType: "image/png", latitude: 22.57, longitude: 88.36 });
  });

  it("rejects blank or out-of-range coordinates and client provenance", async () => {
    const png = await tinyPng();
    const cases: Record<string, string>[] = [{ latitude: "" }, { latitude: "91" }, { longitude: "NaN" }, { is_demo: "true" }, { analysis_source: "mock" }];
    for (const extras of cases) {
      await expect(readUpload(uploadRequest(png, extras))).rejects.toMatchObject({ status: 400 });
    }
  });

  it("rejects oversized chunked uploads even without Content-Length", async () => {
    const request = new Request("https://example.test", {
      method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=example" },
      body: new Uint8Array(MAX_IMAGE_BYTES + 65 * 1024),
    });
    expect(request.headers.get("content-length")).toBeNull();
    await expect(readUpload(request)).rejects.toMatchObject({ status: 413 });
  });

  it("rejects malformed JSON and oversized publication requests", async () => {
    const request = (body: string) => new Request("https://example.test", { method: "PATCH", headers: { "Content-Type": "application/json" }, body });
    await expect(readPublishBody(request("{"))).rejects.toMatchObject({ status: 400 });
    await expect(readPublishBody(request("x".repeat(9000)))).rejects.toMatchObject({ status: 413 });
  });
});
