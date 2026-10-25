import { LABEL_NAMES, type PublicReport } from "./contracts";

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${Math.abs(latitude).toFixed(5)}° ${latitude < 0 ? "S" : "N"}, ${Math.abs(longitude).toFixed(5)}° ${longitude < 0 ? "W" : "E"}`;
}

export function formatPublishedDate(value: string): string {
  return `${new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value))} IST`;
}

export function buildComplaint(report: PublicReport): string {
  const sampleNotice = report.is_demo
    ? "SAMPLE ONLY — fictional demonstration. Do not submit this as a real complaint.\n\n"
    : "";
  const source = report.analysis_source === "vision"
    ? "AI-assisted visual suggestion, reviewed by the reporting person"
    : report.analysis_source === "mock"
      ? "Fictional sample"
      : "Manual visual review by the reporting person";

  return `${sampleNotice}Subject: Request for inspection of a reported water-site observation

To [relevant local authority],

I would like to request an inspection of the location below, based on a reviewed visual observation recorded through Pollution Spotter.

Location: ${formatCoordinates(report.latitude, report.longitude)}
Coordinates: ${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}
Visible conditions: ${report.labels.map((label) => LABEL_NAMES[label]).join(", ")}
Reviewed description: ${report.evidence}
Report published: ${formatPublishedDate(report.published_at)}
Report reference: ${report.id}
Review source: ${source}

This visual observation is not a water-quality test and does not establish pollutant chemistry, toxicity or drinking-water safety. Please assess the site and arrange appropriate testing or action if needed.

Thank you,
[Your name and contact details, if you wish to include them]`;
}
