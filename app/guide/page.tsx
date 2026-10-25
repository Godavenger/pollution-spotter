import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LABEL_NAMES } from "@/lib/contracts";

export default function GuidePage() {
  return <>
    <header className="page-heading"><h1>A little care goes a long way.</h1><p>A field guide to useful, responsible water observations.</p></header>
    <div className="guide-grid">
      <section className="panel guide-section"><h2>Make the observation useful</h2>
        <ol className="guide-steps">
          <li><strong>Take one clear photo.</strong><p>Stay on safe, accessible ground. Include the water surface and some surrounding context. Avoid faces, number plates, and private property.</p></li>
          <li><strong>Check the location.</strong><p>Choose a point on the map, enter coordinates, or use your current location. Check that the point marks the observation, not where you are now.</p></li>
          <li><strong>Review what is visible.</strong><p>An AI suggestion may be available. Edit the labels and description yourself, and choose “Unclear” when the photo doesn’t support a conclusion.</p></li>
          <li><strong>Share deliberately.</strong><p>Your reviewed description and coordinates become public. Your uploaded photo stays private. You can then edit and copy a complaint for a recipient you verify.</p></li>
        </ol>
        <Link className="button primary" href="/">Make an observation <ArrowRight size={16} /></Link>
      </section>
      <section className="panel guide-section"><h2>Describe what you see</h2>
        <dl className="label-guide">
          <div><dt>{LABEL_NAMES.garbage}</dt><dd>Visible bags, bottles, wrappers, or other litter in or beside the water.</dd></div>
          <div><dt>{LABEL_NAMES.algal_bloom}</dt><dd>Green growth or a layer on the surface. A photo cannot confirm algae species or toxicity.</dd></div>
          <div><dt>{LABEL_NAMES.oil_sheen}</dt><dd>A sheen-like surface. Glare and natural films can look similar; a photo cannot identify the substance.</dd></div>
          <div><dt>{LABEL_NAMES.no_visible_pollution}</dt><dd>No visible signs in this photo. This does not mean the water is safe.</dd></div>
          <div><dt>{LABEL_NAMES.unclear}</dt><dd>Blur, distance, lighting, or ambiguity make an observation difficult.</dd></div>
        </dl>
      </section>
      <section className="guide-disclosure"><h2>What happens to your report?</h2><p>Drafts and photos are private. Publishing shares only the reviewed description, labels, location, publication time, report ID, and whether the suggestion came from AI, manual review, or a sample. Complaints stay editable in your browser; Pollution Spotter does not send them or provide emergency response.</p><p>Visual reports cannot establish pollutant chemistry, toxicity, or drinking-water safety.</p></section>
    </div>
  </>;
}
