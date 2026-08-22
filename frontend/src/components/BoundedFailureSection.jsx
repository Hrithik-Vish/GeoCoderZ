import { AlertTriangle, ArrowDown } from 'lucide-react';

/**
 * BoundedFailureSection
 *
 * Plan section 66 — presents the system's willingness to flag
 * uncertainty as a strength rather than hiding it.
 *
 * Worded to match what the product actually does today (an entity
 * either resolves or is flagged for review — see ResultsPanel.jsx's
 * "Needs review" state), not the removed multi-candidate picker
 * concept. The plan's own section 27 says not to present mocked
 * candidate data as live functionality; this section illustrates the
 * review flag itself, which is real, not a disambiguation UI, which
 * isn't built yet.
 */
export default function BoundedFailureSection() {
  return (
    <section className="bounded-failure-section">
      <div className="bounded-failure-copy">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          WHEN THE EVIDENCE ISN'T ENOUGH
        </span>

        <h2>GeoMapAI does not need to pretend.</h2>

        <p>
          If a place cannot be resolved reliably, the system flags it
          for review instead of silently returning a potentially wrong
          coordinate.
        </p>
      </div>

      <div className="bounded-failure-visual">
        <div className="bounded-failure-step">Springfield</div>
        <ArrowDown size={16} className="bounded-failure-arrow" />
        <div className="bounded-failure-step bounded-failure-step--warn">
          Ambiguous
        </div>
        <ArrowDown size={16} className="bounded-failure-arrow" />
        <div className="bounded-failure-step bounded-failure-step--flag">
          <AlertTriangle size={14} />
          Review
        </div>
      </div>
    </section>
  );
}
