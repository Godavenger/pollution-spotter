import { ReportError } from "./errors";

export async function authenticateRequest(request: Request, verifyToken: (token: string) => Promise<string | null>): Promise<string> {
  const authorization = request.headers.get("authorization") ?? "";
  const token = /^Bearer\s+(\S+)$/i.exec(authorization)?.[1];
  if (!token || token.length > 8192) throw new ReportError(401, "Your session is missing. Please reload the page and try again.");
  const ownerId = await verifyToken(token);
  if (!ownerId) throw new ReportError(401, "Your session has expired. Please reload the page and try again.");
  return ownerId;
}
