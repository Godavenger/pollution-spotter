import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  coordinatesSchema, publishSchema, visionResultSchema,
  type AnalysisSource, type DraftReport, type PublicReport, type PublishInput, type VisionResult,
} from "@/lib/contracts";
import { ReportError } from "./errors";

export type ReportRow = Omit<PublicReport, "published_at"> & {
  owner_id: string;
  created_at: string;
  published_at: string | null;
  image_path: string;
  status: "needs_review" | "published";
};
export type VisionMode = "live" | "manual" | "mock";
export interface ReportRepository {
  saveImage(path: string, bytes: Buffer): Promise<void>;
  removeImage(path: string): Promise<void>;
  insertDraft(row: ReportRow): Promise<void>;
  updateAnalysis(id: string, ownerId: string, result: VisionResult, source: AnalysisSource): Promise<ReportRow | null>;
  findOwned(id: string, ownerId: string): Promise<ReportRow | null>;
  imageExists(path: string): Promise<boolean>;
  publish(id: string, ownerId: string, input: PublishInput): Promise<ReportRow>;
  listPublished(samples: boolean): Promise<PublicReport[]>;
}
export type ReportDependencies = {
  repository: ReportRepository;
  normalizeImage: (bytes: Buffer, mimeType: string) => Promise<Buffer>;
  analyze: (input: { bytes: Buffer; mimeType: string; mode: VisionMode }) => Promise<{ result: VisionResult; source: AnalysisSource }>;
  mode: VisionMode;
  makeId?: () => string;
  now?: () => Date;
};

export function publicReport(row: PublicReport): PublicReport {
  return {
    id: row.id,
    published_at: row.published_at,
    latitude: row.latitude,
    longitude: row.longitude,
    labels: [...row.labels],
    evidence: row.evidence,
    analysis_source: row.analysis_source,
    is_demo: row.is_demo,
  };
}

function draftReport(row: ReportRow): DraftReport {
  return {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    labels: [...row.labels],
    evidence: row.evidence,
    analysis_source: row.analysis_source,
    is_demo: row.is_demo,
    status: "needs_review",
  };
}

function published(row: ReportRow): PublicReport {
  if (row.status !== "published" || !row.published_at) throw new ReportError(503, "The report could not be published. Please try again.");
  return publicReport({ ...row, published_at: row.published_at });
}

const fallback: VisionResult = {
  labels: ["unclear"], evidence: "Describe the visible conditions in your photo before publishing.", review_needed: true,
};

export async function createReport(
  ownerId: string,
  input: { bytes: Buffer; mimeType: string; latitude: number; longitude: number },
  deps: ReportDependencies,
): Promise<DraftReport> {
  const coordinates = coordinatesSchema.safeParse(input);
  if (!coordinates.success) throw new ReportError(400, "Enter a valid latitude and longitude.");
  const bytes = await deps.normalizeImage(input.bytes, input.mimeType);
  const id = (deps.makeId ?? randomUUID)();
  const row: ReportRow = {
    id,
    owner_id: ownerId,
    created_at: (deps.now ?? (() => new Date()))().toISOString(),
    published_at: null,
    ...coordinates.data,
    image_path: `reports/${id}.jpg`,
    labels: [...fallback.labels],
    evidence: fallback.evidence,
    analysis_source: deps.mode === "mock" ? "mock" : "manual_fallback",
    status: "needs_review",
    is_demo: deps.mode === "mock",
  };
  await deps.repository.saveImage(row.image_path, bytes);
  try {
    await deps.repository.insertDraft(row);
  } catch (error) {
    // Best-effort cleanup; a failed row insert is always an error, even if cleanup fails.
    await deps.repository.removeImage(row.image_path).catch(() => undefined);
    throw error;
  }
  let analysis: { result: VisionResult; source: AnalysisSource };
  try {
    analysis = await deps.analyze({ bytes, mimeType: "image/jpeg", mode: deps.mode });
    const parsed = visionResultSchema.safeParse(analysis.result);
    if (!parsed.success || !["vision", "manual_fallback", "mock"].includes(analysis.source) ||
      (analysis.source === "mock") !== row.is_demo || (deps.mode === "manual" && analysis.source !== "manual_fallback")) {
      throw new Error("Invalid analysis result");
    }
    analysis.result = parsed.data;
  } catch {
    analysis = { result: fallback, source: row.is_demo ? "mock" : "manual_fallback" };
  }
  const updated = await deps.repository.updateAnalysis(id, ownerId, analysis.result, analysis.source);
  if (!updated || updated.status !== "needs_review") {
    throw new ReportError(409, "This report has already changed. Refresh before continuing.");
  }
  return draftReport(updated);
}

export async function publishReport(id: string, ownerId: string, body: unknown, repository: ReportRepository): Promise<PublicReport> {
  if (!z.uuid().safeParse(id).success) throw new ReportError(400, "The report ID is invalid.");
  const parsed = publishSchema.safeParse(body);
  if (!parsed.success) throw new ReportError(400, parsed.error.issues[0]?.message ?? "Review all report fields before publishing.");
  const row = await repository.findOwned(id, ownerId);
  if (!row || row.owner_id !== ownerId) throw new ReportError(404, "This report could not be found in your session.");
  // Retrying publish returns the original report, without changing its first publication.
  if (row.status === "published") return published(row);
  if (row.image_path !== `reports/${id}.jpg` || !await repository.imageExists(row.image_path)) {
    throw new ReportError(409, "The photo is missing. Please create a new report before publishing.");
  }
  return published(await repository.publish(id, ownerId, parsed.data));
}

export async function listReports(samples: boolean, repository: ReportRepository): Promise<PublicReport[]> {
  return (await repository.listPublished(samples)).map(publicReport);
}
