import { describe, expect, it, vi } from "vitest";
import type { AnalysisSource, PublicReport, PublishInput, VisionResult } from "@/lib/contracts";
import { authenticateRequest } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";
import { createReport, listReports, publicReport, publishReport, type ReportDependencies, type ReportRepository, type ReportRow } from "@/lib/server/reports";

const OWNER = "d16bb7ed-7c03-40e7-a8e8-ae7e4ce16741";
const OTHER = "1f8eac63-6162-43ea-89e0-3a3213b1b18a";
const ID = "372b96d8-85ad-4f2b-b913-d897f42529e3";
const photo = { bytes: Buffer.from("uploaded photo"), mimeType: "image/png", latitude: 22.57, longitude: 88.36 };
const reviewed: PublishInput = { action: "publish", labels: ["garbage"], evidence: "Plastic wrappers along the bank.", latitude: 22.58, longitude: 88.37, reviewed: true };
const suggestion: VisionResult = { labels: ["garbage"], evidence: "Litter appears beside the water.", review_needed: true };

class MemoryRepository implements ReportRepository {
  rows = new Map<string, ReportRow>();
  images = new Set<string>();
  inserts = 0;
  publications = 0;
  async saveImage(path: string) { this.images.add(path); }
  async removeImage(path: string) { this.images.delete(path); }
  async insertDraft(row: ReportRow) { this.inserts++; this.rows.set(row.id, structuredClone(row)); }
  async updateAnalysis(id: string, ownerId: string, result: VisionResult, source: AnalysisSource) {
    const row = this.rows.get(id);
    if (!row || row.owner_id !== ownerId || row.status !== "needs_review") return null;
    Object.assign(row, { labels: result.labels, evidence: result.evidence, analysis_source: source });
    return structuredClone(row);
  }
  async findOwned(id: string, ownerId: string) {
    const row = this.rows.get(id);
    return row?.owner_id === ownerId ? structuredClone(row) : null;
  }
  async imageExists(path: string) { return this.images.has(path); }
  async publish(id: string, ownerId: string, input: PublishInput) {
    const row = this.rows.get(id)!;
    if (row.owner_id !== ownerId) throw new Error("Not owner");
    this.publications++;
    Object.assign(row, { labels: input.labels, evidence: input.evidence, latitude: input.latitude, longitude: input.longitude, status: "published", published_at: "2026-10-25T12:00:00.000Z" });
    return structuredClone(row);
  }
  async listPublished(samples: boolean) {
    return [...this.rows.values()].filter((row) => row.status === "published" && row.is_demo === samples) as PublicReport[];
  }
}

function setup(mode: ReportDependencies["mode"] = "live") {
  const repository = new MemoryRepository();
  const normalizeImage = vi.fn(async () => Buffer.from("normalized JPEG"));
  const analyze = vi.fn(async () => ({ result: suggestion, source: mode === "mock" ? "mock" as const : mode === "manual" ? "manual_fallback" as const : "vision" as const }));
  const deps: ReportDependencies = { repository, normalizeImage, analyze, mode, makeId: () => ID, now: () => new Date("2026-10-25T11:00:00Z") };
  return { repository, normalizeImage, analyze, deps };
}

describe("drafts and publication", () => {
  it("persists a private draft before analysis and returns only its review fields", async () => {
    const { repository, deps, analyze } = setup();
    analyze.mockImplementation(async () => {
      expect(repository.rows.get(ID)?.status).toBe("needs_review");
      expect(repository.images.has(`reports/${ID}.jpg`)).toBe(true);
      return { result: suggestion, source: "vision" };
    });
    const draft = await createReport(OWNER, photo, deps);
    expect(draft).toMatchObject({ status: "needs_review", labels: ["garbage"], is_demo: false, analysis_source: "vision" });
    expect(draft).not.toHaveProperty("owner_id");
    expect(draft).not.toHaveProperty("image_path");
    expect(draft).not.toHaveProperty("published_at");
    expect(analyze).toHaveBeenCalledWith({ bytes: Buffer.from("normalized JPEG"), mimeType: "image/jpeg", mode: "live" });
  });

  it("never inserts a draft when image normalization or upload fails", async () => {
    const { repository, deps, normalizeImage, analyze } = setup();
    normalizeImage.mockRejectedValueOnce(new Error("invalid photo"));
    await expect(createReport(OWNER, photo, deps)).rejects.toThrow("invalid photo");
    repository.saveImage = vi.fn().mockRejectedValue(new Error("storage offline"));
    await expect(createReport(OWNER, photo, deps)).rejects.toThrow("storage offline");
    expect(repository.inserts).toBe(0);
    expect(analyze).not.toHaveBeenCalled();
  });

  it("cleans up the photo and reports failure if database persistence fails", async () => {
    const { repository, deps, analyze } = setup();
    repository.insertDraft = vi.fn().mockRejectedValue(new Error("database offline"));
    await expect(createReport(OWNER, photo, deps)).rejects.toThrow("database offline");
    expect(repository.images.size).toBe(0);
    expect(analyze).not.toHaveBeenCalled();
  });

  it("returns an editable persisted manual fallback when analysis throws", async () => {
    const { repository, deps, analyze } = setup();
    analyze.mockRejectedValue(new Error("provider failed"));
    const draft = await createReport(OWNER, photo, deps);
    expect(draft).toMatchObject({ labels: ["unclear"], analysis_source: "manual_fallback", status: "needs_review" });
    expect(repository.rows.get(ID)?.labels).toEqual(["unclear"]);
  });

  it("does not report success if the analysis update cannot be persisted", async () => {
    const { repository, deps } = setup();
    repository.updateAnalysis = vi.fn().mockRejectedValue(new Error("database update failed"));
    await expect(createReport(OWNER, photo, deps)).rejects.toThrow("database update failed");
    expect(repository.rows.get(ID)?.status).toBe("needs_review");
  });

  it("keeps mock provenance from initial persistence through publication", async () => {
    const { repository, deps, analyze } = setup("mock");
    analyze.mockImplementation(async () => {
      expect(repository.rows.get(ID)).toMatchObject({ is_demo: true, analysis_source: "mock" });
      return { result: suggestion, source: "mock" };
    });
    await createReport(OWNER, photo, deps);
    expect(await publishReport(ID, OWNER, reviewed, repository)).toMatchObject({ is_demo: true, analysis_source: "mock" });
    expect(await listReports(false, repository)).toEqual([]);
    expect(await listReports(true, repository)).toHaveLength(1);
  });

  it("ignores an analysis adapter attempting to turn a real report into a mock", async () => {
    const { deps, analyze } = setup();
    analyze.mockResolvedValue({ result: suggestion, source: "mock" });
    const report = await createReport(OWNER, photo, deps);
    expect(report).toMatchObject({ analysis_source: "manual_fallback", is_demo: false, labels: ["unclear"] });
  });

  it("cannot publish another session's report", async () => {
    const { repository, deps } = setup();
    await createReport(OWNER, photo, deps);
    await expect(publishReport(ID, OTHER, reviewed, repository)).rejects.toMatchObject({ status: 404 });
    expect(repository.publications).toBe(0);
    expect(repository.rows.get(ID)?.status).toBe("needs_review");
  });

  it("requires explicit review and rejects client provenance changes", async () => {
    const { repository, deps } = setup();
    await createReport(OWNER, photo, deps);
    for (const invalid of [{ ...reviewed, reviewed: false }, { ...reviewed, is_demo: true }, { ...reviewed, analysis_source: "vision" }, { ...reviewed, labels: ["unclear", "garbage"] }]) {
      await expect(publishReport(ID, OWNER, invalid, repository)).rejects.toMatchObject({ status: 400 });
    }
    expect(repository.publications).toBe(0);
  });

  it("rejects publication when the stored photo is missing", async () => {
    const { repository, deps } = setup();
    await createReport(OWNER, photo, deps);
    repository.images.clear();
    await expect(publishReport(ID, OWNER, reviewed, repository)).rejects.toMatchObject({ status: 409 });
    expect(repository.publications).toBe(0);
  });

  it("repeated publication preserves the first timestamp, fields and row", async () => {
    const { repository, deps } = setup();
    await createReport(OWNER, photo, deps);
    const first = await publishReport(ID, OWNER, reviewed, repository);
    const repeated = await publishReport(ID, OWNER, { ...reviewed, evidence: "Changed on retry" }, repository);
    expect(repeated).toEqual(first);
    expect(repository.publications).toBe(1);
    expect(repository.rows.size).toBe(1);
    expect(first).not.toHaveProperty("image_path");
    expect(first).not.toHaveProperty("owner_id");
  });

  it("does not overwrite a published row with a late analysis result", async () => {
    const { repository, deps, analyze } = setup();
    analyze.mockImplementation(async () => {
      await repository.publish(ID, OWNER, reviewed);
      return { result: suggestion, source: "vision" };
    });
    await expect(createReport(OWNER, photo, deps)).rejects.toMatchObject({ status: 409 });
    expect(repository.rows.get(ID)?.evidence).toBe(reviewed.evidence);
  });

  it("projects only the exact public allowlist, even from a private row", async () => {
    const { repository, deps } = setup();
    await createReport(OWNER, photo, deps);
    await publishReport(ID, OWNER, reviewed, repository);
    const reports = await listReports(false, repository);
    expect(Object.keys(reports[0]).sort()).toEqual(["id", "published_at", "latitude", "longitude", "labels", "evidence", "analysis_source", "is_demo"].sort());
    const safe = publicReport(reports[0]);
    safe.labels.push("unclear");
    expect(reports[0].labels).toEqual(["garbage"]);
  });
});

describe("request authentication and errors", () => {
  it("rejects a missing bearer token without calling authentication", async () => {
    const verify = vi.fn();
    await expect(authenticateRequest(new Request("https://example.test"), verify)).rejects.toMatchObject({ status: 401 });
    expect(verify).not.toHaveBeenCalled();
  });

  it("only accepts the user returned by token verification", async () => {
    const request = new Request("https://example.test", { headers: { Authorization: "Bearer signed-session" } });
    const verify = vi.fn().mockResolvedValue(OWNER);
    expect(await authenticateRequest(request, verify)).toBe(OWNER);
    expect(verify).toHaveBeenCalledWith("signed-session");
    await expect(authenticateRequest(request, async () => null)).rejects.toMatchObject({ status: 401 });
  });

  it("does not expose arbitrary backend errors or cache responses", async () => {
    const response = errorResponse(new Error("secret-key-value provider diagnostic"));
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).not.toContain("secret-key-value");
  });
});
