import "server-only";
import { createClient } from "@supabase/supabase-js";
import { analyzeImageWithSource } from "@/lib/vision/analyze";
import { getServerConfig, getServiceStatus } from "./config";
import { authenticateRequest } from "./auth";
import { normalizeImage } from "./image";
import { createRepository } from "./repository";
import type { ReportDependencies } from "./reports";

function serverClient() {
  const { url, serviceKey } = getServerConfig();
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

export function publicRepository() { return createRepository(serverClient()); }

export async function authenticatedContext(request: Request): Promise<{ ownerId: string; dependencies: ReportDependencies }> {
  const client = serverClient();
  // getUser validates the bearer token with Supabase; decoding a JWT is not authorization.
  const ownerId = await authenticateRequest(request, async (token) => {
    const { data, error } = await client.auth.getUser(token);
    return !error && data.user ? data.user.id : null;
  });
  return {
    ownerId,
    dependencies: {
      repository: createRepository(client),
      normalizeImage,
      analyze: analyzeImageWithSource,
      mode: getServiceStatus().visionMode,
    },
  };
}
