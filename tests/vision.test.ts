import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getVisionMode,
  parseVisionResponse,
  runVisionAnalysis,
  VISION_DEADLINE_MS,
} from "../lib/vision/core";

const validResult = {
  labels: ["garbage"],
  evidence: "Several plastic-looking objects float beside the bank.",
  review_needed: true,
};
const validResponse = JSON.stringify(validResult);

afterEach(() => vi.useRealTimers());

describe("vision output validation", () => {
  it("accepts visible cues and requires human review", () => {
    expect(parseVisionResponse(validResponse)).toEqual(validResult);
  });

  it.each([
    { ...validResult, labels: [] },
    { ...validResult, labels: ["garbage", "garbage"] },
    { ...validResult, labels: ["garbage", "unclear"] },
    { ...validResult, labels: ["oil_sheen", "no_visible_pollution"] },
    { ...validResult, labels: ["sewage"] },
    { ...validResult, evidence: " ".repeat(5) },
    { ...validResult, evidence: "x".repeat(241) },
    { ...validResult, review_needed: false },
    { ...validResult, confidence: 0.98 },
  ])("rejects an invalid response: %j", (result) => {
    expect(parseVisionResponse(JSON.stringify(result))).toBeNull();
  });

  it.each([
    "This water is safe to drink.",
    "The surface contains mercury.",
    "The water has a toxic chemical sheen.",
    "Litter is visible with 98% confidence.",
    "There is a 90 percent probability of contamination.",
  ])("rejects unsupported inference: %s", (evidence) => {
    expect(parseVisionResponse(JSON.stringify({ ...validResult, evidence }))).toBeNull();
  });

  it.each([undefined, "", "not json", "```json\n{}\n```", "null", "[]"])(
    "rejects missing or malformed model text: %s", (value) => {
      expect(parseVisionResponse(value)).toBeNull();
    },
  );

  it("allows co-occurring visible conditions and trims description whitespace", () => {
    expect(parseVisionResponse(JSON.stringify({
      ...validResult,
      labels: ["algal_bloom", "oil_sheen", "garbage"],
      evidence: "  Green material and scattered litter are visible at the edge.  ",
    }))).toEqual({
      labels: ["algal_bloom", "oil_sheen", "garbage"],
      evidence: "Green material and scattered litter are visible at the edge.",
      review_needed: true,
    });
  });
});

describe("vision modes and provider failures", () => {
  it("defaults to manual review for absent or invalid configuration", () => {
    expect(getVisionMode(undefined)).toBe("manual");
    expect(getVisionMode("LIVE")).toBe("manual");
    expect(getVisionMode("invalid")).toBe("manual");
    expect(getVisionMode("live")).toBe("live");
    expect(getVisionMode("mock")).toBe("mock");
  });

  it("does not call the provider in manual mode", async () => {
    const request = vi.fn(async () => validResponse);
    const outcome = await runVisionAnalysis({ mode: "manual", request });
    expect(request).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({ source: "manual_fallback", result: { labels: ["unclear"], review_needed: true } });
  });

  it("never presents mock suggestions as a real analysis", async () => {
    const request = vi.fn(async () => validResponse);
    const first = await runVisionAnalysis({ mode: "mock", request });
    const second = await runVisionAnalysis({ mode: "mock", request });
    expect(first).toEqual(second);
    expect(first.source).toBe("mock");
    expect(first.result.evidence).toMatch(/^Sample suggestion:/);
    expect(first.result.review_needed).toBe(true);
    expect(request).not.toHaveBeenCalled();
  });

  it("uses manual fallback when live configuration is incomplete", async () => {
    expect(await runVisionAnalysis({ mode: "live" })).toMatchObject({ source: "manual_fallback" });
  });

  it("retains vision provenance only after successful validation", async () => {
    const outcome = await runVisionAnalysis({ mode: "live", request: async () => validResponse });
    expect(outcome).toEqual({ source: "vision", result: validResult });
    expect(await runVisionAnalysis({ mode: "live", request: async () => "{}" }))
      .toMatchObject({ source: "manual_fallback", result: { labels: ["unclear"] } });
  });

  it("contains provider rejection without exposing secrets or request text", async () => {
    const outcome = await runVisionAnalysis({ mode: "live", request: async () => {
      throw new Error("Request key=private-value failed");
    } });
    expect(outcome.source).toBe("manual_fallback");
    expect(JSON.stringify(outcome)).not.toContain("private-value");
  });

  it("enforces the 12-second deadline, aborts, and ignores late provider output", async () => {
    vi.useFakeTimers();
    let finish: (text: string) => void = () => undefined;
    let providerSignal: AbortSignal | undefined;
    const request = vi.fn((signal: AbortSignal) => {
      providerSignal = signal;
      return new Promise<string>((resolve) => { finish = resolve; });
    });
    const task = runVisionAnalysis({ mode: "live", request });
    await vi.advanceTimersByTimeAsync(VISION_DEADLINE_MS - 1);
    expect(providerSignal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const outcome = await task;
    expect(outcome.source).toBe("manual_fallback");
    expect(providerSignal?.aborted).toBe(true);
    finish(validResponse);
    await Promise.resolve();
    expect(outcome.source).toBe("manual_fallback");
    expect(outcome.result.labels).toEqual(["unclear"]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears the deadline when the provider finishes first", async () => {
    vi.useFakeTimers();
    let providerSignal: AbortSignal | undefined;
    const outcome = await runVisionAnalysis({ mode: "live", request: async (signal) => {
      providerSignal = signal;
      return validResponse;
    } });
    await vi.advanceTimersByTimeAsync(VISION_DEADLINE_MS);
    expect(outcome.source).toBe("vision");
    expect(providerSignal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
