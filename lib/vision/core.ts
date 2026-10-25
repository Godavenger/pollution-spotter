import { visionResultSchema, type AnalysisSource, type VisionResult } from "../contracts";

export type VisionMode = "live" | "manual" | "mock";
export type AnalysisOutcome = { result: VisionResult; source: AnalysisSource };
export type RequestVision = (signal: AbortSignal) => Promise<string | undefined>;

export const VISION_DEADLINE_MS = 12_000;

export function getVisionMode(value: string | undefined): VisionMode {
  return value === "live" || value === "mock" ? value : "manual";
}

function manualFallback(): AnalysisOutcome {
  return {
    result: {
      labels: ["unclear"],
      evidence: "No automated visual assessment is available. Review this photo manually.",
      review_needed: true,
    },
    source: "manual_fallback",
  };
}

// This is an additional conservative guard, not a scientific content classifier.
// The prompt remains limited to visible cues and every result still needs review.
const unsupportedInference = /\b(?:toxic(?:ity)?|toxins?|poison(?:ous)?|carcinogen(?:ic)?|pathogens?|bacteria|e\.?\s?coli|lead|mercury|arsenic|cadmium|potable|drink(?:ing|able)?|chemic(?:al|ally)|safe(?:ty)?|unsafe|confidence|probability|confirmed contamination)\b|\d\s*(?:%|percent\b)/i;

export function parseVisionResponse(text: string | undefined): VisionResult | null {
  if (!text) return null;
  try {
    const parsed = visionResultSchema.strict().safeParse(JSON.parse(text));
    if (!parsed.success || unsupportedInference.test(parsed.data.evidence)) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * This core has no environment or SDK dependencies. Its request owns no persistence:
 * a late provider result can only settle an already-observed promise, never edit a row.
 */
export async function runVisionAnalysis({
  mode,
  request,
  deadlineMs = VISION_DEADLINE_MS,
}: {
  mode: VisionMode;
  request?: RequestVision;
  deadlineMs?: number;
}): Promise<AnalysisOutcome> {
  if (mode === "mock") {
    return {
      result: {
        labels: ["garbage"],
        evidence: "Sample suggestion: floating litter near the water's edge. Review the photo before publishing.",
        review_needed: true,
      },
      source: "mock",
    };
  }

  if (mode !== "live" || !request) return manualFallback();

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<undefined>((resolve) => {
    timer = setTimeout(() => {
      // Settle the deadline first: aborting can synchronously reject an SDK request.
      resolve(undefined);
      controller.abort();
    }, deadlineMs);
  });

  try {
    const response = await Promise.race([
      Promise.resolve().then(() => request(controller.signal)),
      timeout,
    ]);
    const result = parseVisionResponse(response);
    return result ? { result, source: "vision" } : manualFallback();
  } catch {
    // Provider messages can contain request context. Expose no provider error details.
    return manualFallback();
  } finally {
    clearTimeout(timer);
  }
}
