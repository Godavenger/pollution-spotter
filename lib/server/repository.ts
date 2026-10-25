import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PublicReport } from "@/lib/contracts";
import { ReportError } from "./errors";
import type { ReportRepository, ReportRow } from "./reports";

const BUCKET = "report-photos";
const PUBLIC_COLUMNS = "id,published_at,latitude,longitude,labels,evidence,analysis_source,is_demo";
const PRIVATE_COLUMNS = `${PUBLIC_COLUMNS},owner_id,created_at,image_path,status`;

export function createRepository(client: SupabaseClient): ReportRepository {
  return {
    async saveImage(path, bytes) {
      const { error } = await client.storage.from(BUCKET).upload(path, bytes, { contentType: "image/jpeg", upsert: false });
      if (error) throw new ReportError(503, "Your photo could not be saved. Please try again.");
    },
    async removeImage(path) {
      const { error } = await client.storage.from(BUCKET).remove([path]);
      if (error) throw new Error("Private photo cleanup failed");
    },
    async insertDraft(row) {
      const { error } = await client.from("reports").insert(row);
      if (error) throw new ReportError(503, "Your report could not be saved. Please try again.");
    },
    async updateAnalysis(id, ownerId, result, source) {
      const { data, error } = await client.from("reports")
        .update({ labels: result.labels, evidence: result.evidence, analysis_source: source })
        .eq("id", id).eq("owner_id", ownerId).eq("status", "needs_review")
        .select(PRIVATE_COLUMNS).maybeSingle();
      if (error) throw new ReportError(503, "Your report was saved privately, but could not be prepared for review. Please try again.");
      return data as ReportRow | null;
    },
    async findOwned(id, ownerId) {
      const { data, error } = await client.from("reports").select(PRIVATE_COLUMNS)
        .eq("id", id).eq("owner_id", ownerId).maybeSingle();
      if (error) throw new ReportError(503, "The report could not be loaded. Please try again.");
      return data as ReportRow | null;
    },
    async imageExists(path) {
      const filename = path.slice("reports/".length);
      const { data, error } = await client.storage.from(BUCKET).list("reports", { search: filename, limit: 100 });
      if (error) throw new ReportError(503, "Your saved photo could not be checked. Please try again.");
      return data.some((object) => object.name === filename);
    },
    async publish(id, ownerId, input) {
      const { data, error } = await client.rpc("publish_report", {
        p_id: id,
        p_owner_id: ownerId,
        p_labels: input.labels,
        p_evidence: input.evidence,
        p_latitude: input.latitude,
        p_longitude: input.longitude,
        p_reviewed: input.reviewed,
      }).single();
      if (error) {
        if (error.code === "P0002") throw new ReportError(404, "This report could not be found in your session.");
        if (error.code === "P0001") throw new ReportError(409, "The photo is missing. Please create a new report before publishing.");
        throw new ReportError(503, "Publication could not be confirmed. Try publishing again to check this report.");
      }
      return data as ReportRow;
    },
    async listPublished(samples) {
      const { data, error } = await client.from("reports").select(PUBLIC_COLUMNS)
        .eq("status", "published").eq("is_demo", samples)
        .order("published_at", { ascending: false });
      if (error) throw new ReportError(503, "Reports could not be loaded. Please refresh in a moment.");
      return data as PublicReport[];
    },
  };
}
