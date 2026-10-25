import { getServiceStatus } from "@/lib/server/config";
import { jsonResponse } from "@/lib/server/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() { return jsonResponse(getServiceStatus()); }
