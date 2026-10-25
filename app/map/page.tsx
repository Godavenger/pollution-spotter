import { MapExplorer } from "@/components/map/map-explorer";

export default function MapPage() {
  return <>
    <header className="page-heading"><h1>Community map</h1><p>Observations from people on the ground, reviewed before they’re shared.</p></header>
    <section className="panel map-page"><MapExplorer refreshKey={0} /></section>
    <p className="page-footnote">A visual observation is not a water-quality test. Samples are fictional examples, shown separately.</p>
  </>;
}
