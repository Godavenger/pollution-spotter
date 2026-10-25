import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, labelsSchema, publishSchema } from "@/lib/contracts";
import { imageInputError, parseCoordinates } from "@/lib/report-input";

describe("report input boundaries", () => {
  it("rejects empty coordinates instead of treating them as zero, but accepts the equator", () => {
    expect(parseCoordinates(" ", "88")).toBeNull();
    expect(parseCoordinates("22", "")).toBeNull();
    expect(parseCoordinates("0", "0")).toEqual({ latitude: 0, longitude: 0 });
    expect(parseCoordinates("90.0001", "0")).toBeNull();
    expect(parseCoordinates("0", "Infinity")).toBeNull();
  });
  it("accepts an exact-size photo but rejects oversized, empty, and unsupported files", () => {
    expect(imageInputError({ type: "image/jpeg", size: MAX_IMAGE_BYTES })).toBeNull();
    expect(imageInputError({ type: "image/jpeg", size: MAX_IMAGE_BYTES + 1 })).toMatch(/larger/);
    expect(imageInputError({ type: "image/png", size: 0 })).toMatch(/empty/);
    expect(imageInputError({ type: "image/svg+xml", size: 200 })).toMatch(/JPEG/);
  });
  it("rejects contradictory, duplicate and empty labels", () => {
    expect(labelsSchema.safeParse(["garbage", "oil_sheen"]).success).toBe(true);
    for (const labels of [[], ["garbage", "unclear"], ["no_visible_pollution", "oil_sheen"], ["garbage", "garbage"]]) {
      expect(labelsSchema.safeParse(labels).success).toBe(false);
    }
  });
  it("requires explicit review and prevents client-chosen provenance", () => {
    const report = { action: "publish", labels: ["garbage"], evidence: "Bottles at the edge.", latitude: 22.57, longitude: 88.36, reviewed: true };
    expect(publishSchema.safeParse(report).success).toBe(true);
    expect(publishSchema.safeParse({ ...report, reviewed: false }).success).toBe(false);
    expect(publishSchema.safeParse({ ...report, is_demo: false }).success).toBe(false);
    expect(publishSchema.safeParse({ ...report, evidence: "  " }).success).toBe(false);
  });
});
