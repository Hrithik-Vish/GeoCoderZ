import { ArrowRight, ScanText, SpellCheck, MapPinned, Split, Map } from 'lucide-react';

/**
 * HowItWorksSection
 *
 * Plan section 62 — the actual pipeline (Extract, Normalize, Resolve,
 * Disambiguate, Map) shown as a horizontal flow. Step 4, Disambiguate,
 * is described here only as what the pipeline conceptually does with
 * context and geographic evidence — it does not claim the interactive
 * multi-candidate picker is live in the product (that UI was
 * deliberately removed; see plan section 27, "Do Not Fake Candidate
 * Pickers Yet").
 */

const STEPS = [
  {
    number: '01',
    title: 'Extract',
    description: 'Find geographic place mentions',
    icon: ScanText,
  },
  {
    number: '02',
    title: 'Normalize',
    description: 'Handle spelling and aliases',
    icon: SpellCheck,
  },
  {
    number: '03',
    title: 'Resolve',
    description: 'Use geographic reference data',
    icon: MapPinned,
  },
  {
    number: '04',
    title: 'Disambiguate',
    description: 'Use context and geographic evidence',
    icon: Split,
  },
  {
    number: '05',
    title: 'Map',
    description: 'Return coordinates and confidence',
    icon: Map,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="section-heading">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          THE PIPELINE
        </span>

        <h2>How GeoMapAI works</h2>
      </div>

      <div className="pipeline-flow">
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <div className="pipeline-step-wrapper" key={step.number}>
              <div className="pipeline-step">
                <div className="pipeline-step-icon">
                  <Icon size={20} />
                </div>

                <span className="pipeline-step-number">{step.number}</span>
                <strong>{step.title}</strong>
                <span className="pipeline-step-description">
                  {step.description}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <ArrowRight size={16} className="pipeline-step-arrow" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
