import { ArrowDown, MapPin } from 'lucide-react';

/**
 * LiveDemonstrationSection
 *
 * Plan section 64 — a worked example walking through one complete
 * incident end to end. This is a static illustration of the pipeline,
 * not an interactive demo or a claim that this exact text was run
 * through the live system — it's presented as "here's what a
 * resolution looks like," matching the plan's own example almost
 * verbatim (Mahad / Savitri River). No "try it live" affordance is
 * included here; the actual interactive workspace is what "Launch
 * GeoMapAI" leads to.
 */
export default function LiveDemonstrationSection() {
  return (
    <section className="demo-section" id="resolution">
      <div className="section-heading">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          WALKTHROUGH
        </span>

        <h2>Seeing a report become a location</h2>
      </div>

      <div className="demo-flow">
        <div className="demo-step demo-step--report">
          <span className="demo-step-label">INCIDENT REPORT</span>
          <p>
            Heavy rainfall caused flooding near Mahad. The Savitri
            River breached its banks…
          </p>
        </div>

        <ArrowDown size={18} className="demo-arrow" />

        <div className="demo-step demo-step--detected">
          <span className="demo-step-label">DETECTED LOCATIONS</span>
          <div className="demo-chips">
            <span>Mahad</span>
            <span>Savitri River</span>
          </div>
        </div>

        <ArrowDown size={18} className="demo-arrow" />

        <div className="demo-step demo-step--resolved">
          <span className="demo-step-label">RESOLVED</span>
          <strong>Mahad, Raigad, Maharashtra</strong>
          <span className="demo-confidence-tag">High Confidence</span>
        </div>

        <ArrowDown size={18} className="demo-arrow" />

        <div className="demo-step demo-step--map">
          <span className="demo-step-label">MAP</span>
          <div className="demo-map-marker">
            <MapPin size={16} />
            Mahad
          </div>
        </div>
      </div>
    </section>
  );
}
