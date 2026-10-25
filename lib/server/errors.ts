export class ReportError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ReportError";
  }
}

export function errorResponse(error: unknown): Response {
  const known = error instanceof ReportError;
  return Response.json(
    { error: known ? error.message : "The report service is unavailable. Please try again shortly." },
    { status: known ? error.status : 503, headers: { "Cache-Control": "no-store" } },
  );
}

export function jsonResponse(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}
