import { authenticatedContext } from "@/lib/server/context";
import { errorResponse, jsonResponse } from "@/lib/server/errors";
import { publishReport } from "@/lib/server/reports";
import { readPublishBody } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { ownerId, dependencies } = await authenticatedContext(request);
    const { id } = await context.params;
    const body = await readPublishBody(request);
    const report = await publishReport(id, ownerId, body, dependencies.repository);
    return jsonResponse({ report });
  } catch (error) { return errorResponse(error); }
}
