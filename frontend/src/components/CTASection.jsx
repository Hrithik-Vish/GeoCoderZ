import { ArrowRight, Map } from 'lucide-react';

/**
 * CTASection
 *
 * Plan section 70 — the main and secondary calls to action, worded
 * exactly per the plan ("Open Analysis Workspace" / "Explore Map"),
 * deliberately avoiding generic SaaS phrases like "Get Started Free"
 * or "Book a Demo" that the plan explicitly calls out as not fitting
 * the project.
 *
 * Props:
 *  - onEnter: () => void   Same callback the hero's primary CTA uses.
 */
export default function CTASection({ onEnter }) {
  return (
    <section className="cta-section">
      <h2>See your next report become a map.</h2>

      <div className="cta-buttons">
        <button
          type="button"
          className="landing-cta"
          onClick={onEnter}
        >
          Open Analysis Workspace
          <ArrowRight size={16} />
        </button>

        <button
          type="button"
          className="cta-secondary"
          onClick={onEnter}
        >
          <Map size={15} />
          Explore Map
        </button>
      </div>
    </section>
  );
}
