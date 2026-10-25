import "server-only";
import type { ServiceStatus } from "@/lib/contracts";
import { ReportError } from "./errors";

export function getServiceStatus(): ServiceStatus {
  const mode = process.env.VISION_MODE;
  const visionMode = mode === "live" || mode === "mock" ? mode : "manual";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  let validUrl = false;
  try {
    const parsed = new URL(url || "");
    validUrl = parsed.protocol === "https:" ||
      (parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname));
  } catch { /* An incomplete setup is exposed only as configured: false. */ }
  return {
    configured: Boolean(validUrl && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    visionMode,
  };
}

export function getServerConfig() {
  if (!getServiceStatus().configured) {
    throw new ReportError(503, "Reporting is not connected yet. You can still explore the sample map.");
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
  };
}
