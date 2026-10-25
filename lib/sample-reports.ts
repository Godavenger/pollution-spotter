import type { PublicReport } from "./contracts";

/** Fictional examples for the Samples view. These are not observations of these places. */
export const SAMPLE_REPORTS: PublicReport[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    published_at: "2026-10-25T04:30:00.000Z",
    latitude: 22.5836,
    longitude: 88.3477,
    labels: ["garbage"],
    evidence: "Fictional example: bottles and wrappers gathered along the water's edge.",
    analysis_source: "mock",
    is_demo: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    published_at: "2026-10-25T05:00:00.000Z",
    latitude: 22.5694,
    longitude: 88.4095,
    labels: ["algal_bloom"],
    evidence: "Fictional example: a patch of green surface growth near a bank.",
    analysis_source: "mock",
    is_demo: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    published_at: "2026-10-25T05:30:00.000Z",
    latitude: 22.5111,
    longitude: 88.3621,
    labels: ["unclear"],
    evidence: "Fictional example: reflections make the surface difficult to assess.",
    analysis_source: "mock",
    is_demo: true,
  },
];

export const SAMPLE_REPORT_NOTICE =
  "Sample reports are fictional examples, not observations of these locations.";
