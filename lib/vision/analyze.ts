import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { VisionResult } from "../contracts";
import {
  getVisionMode,
  runVisionAnalysis,
  VISION_DEADLINE_MS,
  type AnalysisOutcome,
  type VisionMode,
} from "./core";
import { VISION_JSON_SCHEMA, VISION_SYSTEM_PROMPT } from "./prompt";

export { getVisionMode } from "./core";
export type { VisionMode } from "./core";

export type ImageAnalysisInput = {
  bytes: Buffer;
  mimeType: string;
  /** Snapshot from draft creation, so provenance cannot change during the request. */
  mode?: VisionMode;
};

export async function analyzeImageWithSource(input: ImageAnalysisInput): Promise<AnalysisOutcome> {
  const mode = input.mode ?? getVisionMode(process.env.VISION_MODE);
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim();

  return runVisionAnalysis({
    mode,
    request: mode === "live" && apiKey && model
      ? async (signal) => {
        const client = new GoogleGenAI({ apiKey });
        const response = await client.models.generateContent({
          model,
          contents: [{
            role: "user",
            parts: [
              { inlineData: { mimeType: input.mimeType, data: input.bytes.toString("base64") } },
              { text: "Describe the visible water conditions in this photo for human review." },
            ],
          }],
          config: {
            systemInstruction: VISION_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseJsonSchema: VISION_JSON_SCHEMA,
            temperature: 0.1,
            abortSignal: signal,
            httpOptions: { timeout: VISION_DEADLINE_MS },
          },
        });
        return response.text;
      }
      : undefined,
  });
}

export async function analyzeImage(input: ImageAnalysisInput): Promise<VisionResult> {
  return (await analyzeImageWithSource(input)).result;
}
