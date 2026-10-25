import { authenticatedContext, publicRepository } from "@/lib/server/context";
import { errorResponse, jsonResponse, ReportError } from "@/lib/server/errors";
import { createReport, listReports } from "@/lib/server/reports";
import { readUpload } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { ownerId, dependencies } = await authenticatedContext(request);
    const input = await readUpload(request);
    const report = await createReport(ownerId, input, dependencies);
    return jsonResponse({ report }, 201);
  } catch (error) { return errorResponse(error); }
}

export async function GET(request: Request) {
  try {
    const samples = new URL(request.url).searchParams.get("samples");
    if (samples !== null && samples !== "true" && samples !== "false") throw new ReportError(400, "Choose either real or sample reports.");
    const reports = await listReports(samples === "true", publicRepository());
    return jsonResponse({ reports });
  } catch (error) { return errorResponse(error); }
}
