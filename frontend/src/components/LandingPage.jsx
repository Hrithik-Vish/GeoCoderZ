import { ArrowRight, Search, Compass, Layers, AlertCircle } from 'lucide-react';

import LandingNav from './LandingNav';
import LandingBackground from './LandingBackground';
import HeroSequence from './HeroSequence';
import ProblemSection from './ProblemSection';
import HowItWorksSection from './HowItWorksSection';
import CapabilitiesSection from './CapabilitiesSection';
import LiveDemonstrationSection from './LiveDemonstrationSection';
import SpatialDemonstrationSection from './SpatialDemonstrationSection';
import TrustSection from './TrustSection';
import BoundedFailureSection from './BoundedFailureSection';
import MultilingualSection from './MultilingualSection';
import WhyItMattersSection from './WhyItMattersSection';
import CTASection from './CTASection';
import TeamSection from './TeamSection';
import Footer from './Footer';

/**
 * LandingPage
 *
 * The app's opening screen, shown once before the dashboard. Purely
 * presentational + one callback — no data fetching, no app state beyond
 * what App.jsx already owns (theme).
 *
 * The hero visual (globe + orbital rings + radiating tick-mark lines) is
 * built entirely from CSS classes, not inline styles, for the same
 * reason the map's accuracy circle is: keeping every color reference a
 * real stylesheet rule guarantees var() resolves correctly and the
 * whole scene re-themes for free when the person switches light/dark —
 * no separate light/dark art needed.
 *
 * Props:
 *  - theme: 'light' | 'dark'
 *  - onToggleTheme: () => void
 *  - onEnter: () => void   Called when the person continues into the app.
 */
export default function LandingPage({ theme, onToggleTheme, onEnter }) {
  return (
    <div className="landing-page" id="top">
      <LandingBackground />
      <LandingNav
        onEnter={onEnter}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div className="landing-hero-viewport">
        <div className="landing-content">
          <div className="landing-hero">
            <ResolvedLocationHero />
            <HeroSequence />
          </div>

          <div className="landing-copy">
            <span className="landing-eyebrow">
              <AlertCircle size={13} />
              Built for Disaster Response &amp; Situational Awareness
            </span>

            <h1 className="landing-title">
              Find every affected place —
              without reading every report
            </h1>

            <p className="landing-subtitle">
              During a disaster, reports pile
              up faster than anyone can read
              them. Paste in situation reports,
              field messages, or news text —
              GeoMapAI finds every place
              mentioned, resolves it to real
              coordinates, and puts it on a map,
              so responders can see where help
              is needed at a glance instead of
              searching for it by hand.
            </p>

            <button
              type="button"
              className="landing-cta"
              onClick={onEnter}
            >
              Launch GeoMapAI
              <ArrowRight size={16} />
            </button>

            <div className="landing-features">
              <div className="landing-feature">
                <Search size={16} />
                <div>
                  <strong>Scan</strong>
                  <span>
                    Every place name in a report
                    found automatically, so
                    nothing gets missed
                  </span>
                </div>
              </div>

              <div className="landing-feature">
                <Compass size={16} />
                <div>
                  <strong>Resolve</strong>
                  <span>
                    Matched to a real location,
                    with a documented reason why
                  </span>
                </div>
              </div>

              <div className="landing-feature">
                <Layers size={16} />
                <div>
                  <strong>Map</strong>
                  <span>
                    Every affected area on one
                    map, instead of buried across
                    dozens of separate reports
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProblemSection />
      <HowItWorksSection />
      <CapabilitiesSection />
      <LiveDemonstrationSection />
      <SpatialDemonstrationSection />
      <TrustSection />
      <BoundedFailureSection />
      <MultilingualSection />
      <WhyItMattersSection />
      <CTASection onEnter={onEnter} />
      <TeamSection />
      <Footer />
    </div>
  );
}

/**
 * ResolvedLocationHero: the landing page's hero visual. Rather than a
 * generic spinning globe, this dramatizes the product's actual job —
 * scattered, ambiguous place mentions resolving to one confident
 * coordinate — using the same mark as the sidebar/favicon logo, just
 * built at hero scale with its own supporting geometry (a soft locus
 * ring showing the search radius, and gentle in-place motion on the
 * candidate nodes rather than a rotating sphere). Colors come entirely
 * from CSS classes tied to theme tokens, so dark/light both work with
 * no separate artwork.
 */
function ResolvedLocationHero() {
  // Scattered candidate mentions, positioned with some asymmetry so it
  // reads as "found in the wild" rather than a neat geometric pattern.
  const candidates = [
    { cx: 96, cy: 88, r: 5, label: 'Thane' },
    { cx: 318, cy: 118, r: 4.5, label: 'Sector 12' },
    { cx: 336, cy: 288, r: 5, label: 'near the bridge' },
    { cx: 82, cy: 296, r: 4, label: 'riverside' },
    { cx: 150, cy: 350, r: 3.5, label: 'downtown' },
  ];

  const resolved = { cx: 200, cy: 200 };

  return (
    <svg
      viewBox="0 0 400 400"
      className="landing-globe"
      role="img"
      aria-label="Several scattered, ambiguous place mentions converging onto a single resolved map coordinate"
    >
      {/* Search-radius locus: a soft ring around the resolved point,
          standing in for "this is the area the model is reasoning
          over" without literally depicting a spinning planet. */}
      <circle cx={resolved.cx} cy={resolved.cy} r="150" className="landing-globe-ring" />
      <circle cx={resolved.cx} cy={resolved.cy} r="112" className="landing-globe-ring landing-globe-ring--tilt-a" />

      {/* Bearing lines from each scattered mention toward the resolved
          coordinate, dashed to read as candidate/unconfirmed. */}
      {candidates.map((c, i) => (
        <line
          key={`bearing-${i}`}
          x1={c.cx}
          y1={c.cy}
          x2={resolved.cx}
          y2={resolved.cy}
          className="landing-hero-bearing"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}

      {/* Candidate mention nodes, each a small hollow ring — an
          unresolved piece of text somewhere on the map. */}
      {candidates.map((c, i) => (
        <circle
          key={`candidate-${i}`}
          cx={c.cx}
          cy={c.cy}
          r={c.r}
          className="landing-hero-candidate"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}

      {/* The resolved coordinate: solid marker with crosshair ticks,
          identical visual language to the sidebar/favicon mark so the
          brand reads as one consistent system. */}
      <g className="landing-hero-resolved">
        <line x1={resolved.cx - 26} y1={resolved.cy} x2={resolved.cx - 15} y2={resolved.cy} />
        <line x1={resolved.cx + 15} y1={resolved.cy} x2={resolved.cx + 26} y2={resolved.cy} />
        <line x1={resolved.cx} y1={resolved.cy - 26} x2={resolved.cx} y2={resolved.cy - 15} />
        <line x1={resolved.cx} y1={resolved.cy + 15} x2={resolved.cx} y2={resolved.cy + 26} />
        <circle cx={resolved.cx} cy={resolved.cy} r="10" className="landing-hero-resolved-ring" />
        <circle cx={resolved.cx} cy={resolved.cy} r="5.5" />
      </g>
    </svg>
  );
}
