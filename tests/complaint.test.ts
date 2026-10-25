import { describe, expect, it } from "vitest";
import { buildComplaint, formatCoordinates } from "../lib/complaint";
import type { PublicReport } from "../lib/contracts";
import { SAMPLE_REPORTS } from "../lib/sample-reports";

const report: PublicReport = {
  id: "323e4567-e89b-42d3-a456-426614174000",
  published_at: "2026-10-25T04:30:00.000Z",
  latitude: 22.5726,
  longitude: 88.3639,
  labels: ["garbage", "oil_sheen"],
  evidence: "A bottle and a reflective patch are visible near the bank.",
  analysis_source: "manual_fallback",
  is_demo: false,
};

describe("complaint drafting", () => {
  it("uses reviewed facts and labels, with publication time and source", () => {
    const text = buildComplaint(report);
    expect(text).toContain(report.evidence);
    expect(text).toContain("22.57260, 88.36390");
    expect(text).toContain("Visible litter, Sheen-like surface");
    expect(text).toContain(report.id);
    expect(text).toContain("25 Oct 2026");
    expect(text).toContain("10:00 am IST");
    expect(text).toContain("Manual visual review");
    expect(text).not.toContain("SAMPLE ONLY");
  });

  it("states the visual limits and leaves recipient and sender editable", () => {
    const text = buildComplaint(report);
    expect(text).toContain("not a water-quality test");
    expect(text).toContain("does not establish pollutant chemistry, toxicity or drinking-water safety");
    expect(text).toContain("[relevant local authority]");
    expect(text).toContain("[Your name and contact details");
    expect(text).not.toMatch(/automatically (sent|submitted)/i);
  });

  it("identifies human review of AI-assisted suggestions", () => {
    expect(buildComplaint({ ...report, analysis_source: "vision" })).toContain("AI-assisted visual suggestion, reviewed by the reporting person");
  });

  it("marks every built-in sample as fictional and unsuitable for a real complaint", () => {
    for (const sample of SAMPLE_REPORTS) {
      expect(sample.is_demo).toBe(true);
      expect(sample.analysis_source).toBe("mock");
      expect(sample.evidence).toMatch(/^Fictional example:/);
      expect(buildComplaint(sample)).toMatch(/^SAMPLE ONLY/);
      expect(buildComplaint(sample)).toContain("Do not submit this as a real complaint.");
    }
  });

  it("preserves location hemispheres and valid zero coordinates", () => {
    expect(formatCoordinates(-33.9249, -18.4241)).toBe("33.92490° S, 18.42410° W");
    expect(formatCoordinates(0, 0)).toBe("0.00000° N, 0.00000° E");
  });
});
