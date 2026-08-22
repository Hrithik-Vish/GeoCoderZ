import { ScanText, Compass, Split, ShieldCheck, Languages, MapPinned } from 'lucide-react';

/**
 * CapabilitiesSection
 *
 * Plan section 63 — exactly the six project-specific capability cards
 * the plan lists, in that order. Deliberately does NOT include generic
 * SaaS cards like "AI Assistant," "Analytics," "Smart Dashboard," or
 * "Real-Time Collaboration" — the plan explicitly forbids those unless
 * they're actual project features, and none of them are.
 */

const CAPABILITIES = [
  {
    title: 'Place-Name Extraction',
    description:
      'Identify geographic references from raw incident reports.',
    icon: ScanText,
  },
  {
    title: 'Canonical Resolution',
    description:
      'Convert messy or inconsistent place names into standardized geographic locations.',
    icon: Compass,
  },
  {
    title: 'Context-Aware Disambiguation',
    description:
      'Use surrounding geographic and contextual information to improve resolution.',
    icon: Split,
  },
  {
    title: 'Confidence & Reasoning',
    description:
      'Show how confident the system is and why a location was selected.',
    icon: ShieldCheck,
  },
  {
    title: 'Multilingual Processing',
    description:
      'Support real-world incident reports containing multiple languages and scripts.',
    icon: Languages,
  },
  {
    title: 'Map-Ready Output',
    description: 'Return resolved coordinates that can be visualized or exported.',
    icon: MapPinned,
  },
];

export default function CapabilitiesSection() {
  return (
    <section className="capabilities-section">
      <div className="section-heading">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          CAPABILITIES
        </span>

        <h2>What it can do</h2>
      </div>

      <div className="capabilities-grid">
        {CAPABILITIES.map((capability) => {
          const Icon = capability.icon;

          return (
            <div className="capability-card" key={capability.title}>
              <div className="capability-card-icon">
                <Icon size={20} />
              </div>

              <strong>{capability.title}</strong>
              <p>{capability.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
