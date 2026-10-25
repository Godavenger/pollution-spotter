"use client";

import { useState } from "react";
import { MapExplorer } from "@/components/map/map-explorer";
import { ReportForm } from "./report-form";
import { ShieldCheck } from "lucide-react";

export function ReportWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);
  return <>
    <header className="page-heading workspace-heading"><div><h1>A closer look at <span>our water.</span></h1><p>Spot something? Document it, check the details, and put it on the map.</p></div><span className="privacy-context"><ShieldCheck size={16} strokeWidth={1.6} />Photos stay private</span></header>
    <div className="workspace-grid">
      <section className="panel report-panel" aria-label="Make an observation"><ReportForm onPublished={() => setRefreshKey((key) => key + 1)} /></section>
      <section className="panel explorer-panel" aria-label="Explore observations"><MapExplorer refreshKey={refreshKey} /></section>
    </div>
    <footer className="page-footnote"><span>Photos stay private. Every report gets a human review.</span><span>A visual observation is not a water-quality test.</span></footer>
  </>;
}
