import { z } from "zod";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const LABELS = ["algal_bloom", "oil_sheen", "garbage", "no_visible_pollution", "unclear"] as const;
export type Label = (typeof LABELS)[number];
export const LABEL_NAMES: Record<Label, string> = {
  algal_bloom: "Algae-like growth",
  oil_sheen: "Sheen-like surface",
  garbage: "Visible litter",
  no_visible_pollution: "No visible pollution",
  unclear: "Unclear",
};
export type AnalysisSource = "vision" | "manual_fallback" | "mock";
export const SOURCE_NAMES: Record<AnalysisSource, string> = {
  vision: "AI suggestion · human reviewed",
  manual_fallback: "Manually reviewed",
  mock: "Sample report",
};

export const labelsSchema = z.array(z.enum(LABELS)).min(1).max(3).refine(
  (labels) => new Set(labels).size === labels.length &&
    (labels.length === 1 || (!labels.includes("unclear") && !labels.includes("no_visible_pollution"))),
  "Choose visible conditions, or choose one neutral label on its own.",
);
export const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});
export const visionResultSchema = z.object({
  labels: labelsSchema,
  evidence: z.string().trim().min(1).max(240),
  review_needed: z.literal(true),
});
export type VisionResult = z.infer<typeof visionResultSchema>;

export const publishSchema = coordinatesSchema.extend({
  action: z.literal("publish"),
  labels: labelsSchema,
  evidence: z.string().trim().min(1, "Describe what you can see.").max(240),
  reviewed: z.literal(true, { error: "Confirm your review before publishing." }),
}).strict();
export type PublishInput = z.infer<typeof publishSchema>;

export type PublicReport = {
  id: string;
  published_at: string;
  latitude: number;
  longitude: number;
  labels: Label[];
  evidence: string;
  analysis_source: AnalysisSource;
  is_demo: boolean;
};
export type DraftReport = Omit<PublicReport, "published_at"> & {
  status: "needs_review";
};
export type ServiceStatus = { configured: boolean; visionMode: "live" | "manual" | "mock" };
export type ApiError = { error: string };
