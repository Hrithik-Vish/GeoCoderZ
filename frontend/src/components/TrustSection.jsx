import { ShieldCheck } from 'lucide-react';

/**
 * TrustSection
 *
 * Plan section 65 — explains that the system doesn't just output a
 * pin, it explains itself. Deliberately avoids "100% accurate" or
 * similar marketing claims (the plan is explicit about this); the
 * copy instead emphasizes confidence, reasoning, source, unresolved
 * states, and human review, which is what the actual product does
 * (see ResultsPanel.jsx — reason is always the backend's real text,
 * never invented factors).
 */
export default function TrustSection() {
  const principles = [
    'Confidence',
    'Reasoning',
    'Source',
    'Unresolved states',
    'Human review when necessary',
  ];

  return (
    <section className="trust-section">
      <div className="trust-copy">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          TRUST &amp; EXPLAINABILITY
        </span>

        <h2>Every resolution should be understandable and auditable.</h2>

        <p>
          GeoMapAI does not simply output a pin. Every resolved
          location comes with a plain-language reason for why it was
          selected, so the answer can be checked, not just trusted.
        </p>

        <ul className="trust-principles">
          {principles.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </div>

      <div className="trust-card">
        <div className="trust-card-icon">
          <ShieldCheck size={20} />
        </div>

        <span className="trust-card-label">WHY THIS LOCATION?</span>

        <ul className="trust-card-reasons">
          <li>Canonical match</li>
          <li>Geographic context</li>
          <li>Regional relevance</li>
        </ul>

        <div className="trust-card-confidence">
          <span>Confidence</span>
          <strong>94%</strong>
        </div>
      </div>
    </section>
  );
}
