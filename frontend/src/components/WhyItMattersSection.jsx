import { Zap, Target, Brain, Globe2 } from 'lucide-react';

/**
 * WhyItMattersSection
 *
 * Plan sections 89 & 94 — four focused value propositions connecting
 * directly to the SIH incident-response problem statement, not
 * generic AI-product marketing. Copy taken close to verbatim from
 * section 89's four cards, since the plan gives fully-formed text
 * that already avoids the "generic AI marketing" trap it warns
 * against.
 */

const VALUE_PROPS = [
  {
    title: 'Faster Resolution',
    description:
      'Reduce the manual map cross-referencing needed when incident reports arrive under time pressure.',
    icon: Zap,
  },
  {
    title: 'Geographic Accuracy',
    description:
      'Resolve place names into canonical geographic locations rather than simply extracting text.',
    icon: Target,
  },
  {
    title: 'Explainable Results',
    description:
      'Show confidence, source, and the reason behind the selected location.',
    icon: Brain,
  },
  {
    title: 'Multilingual Ready',
    description:
      'Support real-world reports containing multilingual place names and text as the implementation allows.',
    icon: Globe2,
  },
];

export default function WhyItMattersSection() {
  return (
    <section className="why-matters-section">
      <div className="why-matters-copy">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          WHY IT MATTERS
        </span>

        <h2>
          When every minute matters, manually resolving place names
          should not be the bottleneck.
        </h2>
      </div>

      <div className="why-matters-grid">
        {VALUE_PROPS.map((prop) => {
          const Icon = prop.icon;

          return (
            <div className="why-matters-card" key={prop.title}>
              <div className="why-matters-card-icon">
                <Icon size={18} />
              </div>

              <strong>{prop.title}</strong>
              <p>{prop.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
