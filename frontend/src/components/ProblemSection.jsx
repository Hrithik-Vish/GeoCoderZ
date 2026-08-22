import { ArrowDown } from 'lucide-react';

/**
 * ProblemSection
 *
 * Plan section 61 — explains the problem using the project's actual
 * use case (messy, pressured incident-report text) rather than a
 * generic "data is hard" framing. The example pipeline below (Amboli
 * / Sawantwadi) is the plan's own worked example, kept verbatim.
 */
export default function ProblemSection() {
  const messyTraits = [
    'Spelling variations',
    'Aliases',
    'Local place names',
    'Ambiguous names',
    'Multilingual text',
    'Inconsistent geographic references',
  ];

  return (
    <section className="problem-section">
      <div className="problem-copy">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          THE PROBLEM
        </span>

        <h2>Incident reports are messy.</h2>

        <p>
          A report written under pressure may contain spelling
          variations, aliases, local place names, ambiguous names,
          multilingual text, and inconsistent geographic references.
        </p>

        <ul className="problem-traits">
          {messyTraits.map((trait) => (
            <li key={trait}>{trait}</li>
          ))}
        </ul>

        <p>
          A human operator may have to manually cross-reference those
          names before the information can be used spatially. GeoMapAI
          is designed to reduce that delay.
        </p>
      </div>

      <div className="problem-visual">
        <div className="problem-visual-step problem-visual-step--raw">
          <span className="problem-visual-label">RAW REPORT</span>
          <p>“Rainfall near Amboli, close to Sawantwadi…”</p>
        </div>

        <ArrowDown size={18} className="problem-visual-arrow" />

        <div className="problem-visual-step problem-visual-step--extracted">
          <span className="problem-visual-label">EXTRACTED</span>
          <div className="problem-visual-chips">
            <span>Amboli</span>
            <span>Sawantwadi</span>
          </div>
        </div>

        <ArrowDown size={18} className="problem-visual-arrow" />

        <div className="problem-visual-step problem-visual-step--canonical">
          <span className="problem-visual-label">CANONICAL LOCATIONS</span>
          <div className="problem-visual-chips">
            <span>Amboli, Maharashtra</span>
            <span>Sawantwadi, Maharashtra</span>
          </div>
        </div>

        <ArrowDown size={18} className="problem-visual-arrow" />

        <div className="problem-visual-step problem-visual-step--map">
          <span className="problem-visual-label">MAP</span>
        </div>
      </div>
    </section>
  );
}
