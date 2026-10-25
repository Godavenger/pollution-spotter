import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: sdk.generateContent };
  },
}));

import { analyzeImage, analyzeImageWithSource } from "../lib/vision/analyze";

const image = { bytes: Buffer.from("already-normalized-test-image"), mimeType: "image/jpeg" };
const suggestion = {
  labels: ["oil_sheen"],
  evidence: "A reflective, rainbow-like patch is visible on the surface.",
  review_needed: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("VISION_MODE", "live");
  vi.stubEnv("GEMINI_API_KEY", "unit-test-key");
  vi.stubEnv("GEMINI_MODEL", "unit-test-model");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("server adapter boundary", () => {
  it("sends only the supplied image and returns validated provenance", async () => {
    sdk.generateContent.mockResolvedValue({ text: JSON.stringify(suggestion) });
    const outcome = await analyzeImageWithSource(image);
    expect(outcome).toEqual({ result: suggestion, source: "vision" });
    expect(sdk.generateContent).toHaveBeenCalledOnce();
    expect(sdk.generateContent).toHaveBeenCalledWith(expect.objectContaining({
      model: "unit-test-model",
      contents: [expect.objectContaining({
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: image.bytes.toString("base64") } },
          expect.objectContaining({ text: expect.any(String) }),
        ],
      })],
      config: expect.objectContaining({ responseMimeType: "application/json", abortSignal: expect.any(AbortSignal) }),
    }));
    expect(JSON.stringify(outcome)).not.toContain("unit-test-key");
  });

  it("uses the draft's mode snapshot even if the environment later differs", async () => {
    expect(await analyzeImageWithSource({ ...image, mode: "mock" }))
      .toMatchObject({ source: "mock" });
    vi.stubEnv("VISION_MODE", "mock");
    expect(await analyzeImageWithSource({ ...image, mode: "manual" }))
      .toMatchObject({ source: "manual_fallback" });
    expect(sdk.generateContent).not.toHaveBeenCalled();
  });

  it.each(["GEMINI_API_KEY", "GEMINI_MODEL"])("does not call Gemini without %s", async (key) => {
    vi.stubEnv(key, " ");
    expect(await analyzeImageWithSource(image)).toMatchObject({ source: "manual_fallback" });
    expect(sdk.generateContent).not.toHaveBeenCalled();
  });

  it("maintains the original analyzeImage result-only contract", async () => {
    sdk.generateContent.mockResolvedValue({ text: JSON.stringify(suggestion) });
    expect(await analyzeImage(image)).toEqual(suggestion);
  });

  it("passes the application deadline's abort signal to the actual SDK call", async () => {
    vi.useFakeTimers();
    sdk.generateContent.mockImplementation(() => new Promise(() => undefined));
    const task = analyzeImageWithSource(image);
    await vi.advanceTimersByTimeAsync(12_000);
    const outcome = await task;
    const signal = sdk.generateContent.mock.calls[0][0].config.abortSignal as AbortSignal;
    expect(signal.aborted).toBe(true);
    expect(outcome.source).toBe("manual_fallback");
  });
});
