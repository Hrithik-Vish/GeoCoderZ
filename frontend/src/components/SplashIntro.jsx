import { useEffect, useState } from 'react';

import Logo from './Logo';

/**
 * SplashIntro
 *
 * A short, one-time boot/branding sequence — "GEOCODERZ PRESENTS
 * GeoMapAI" — that plays before the existing LandingPage is shown.
 * Purely presentational: it owns no app state beyond its own timing,
 * and it never touches LandingPage or any of its children. Once the
 * sequence finishes it calls onFinish and unmounts; App.jsx swaps it
 * out for the untouched LandingPage underneath.
 *
 * Visual language is deliberately reused rather than invented: the
 * background layer (grid + faint contour lines + a few geographic
 * nodes) mirrors LandingBackground.jsx's restraint, and the mark
 * itself is the same <Logo /> already used in the nav/sidebar/favicon
 * — no separate splash-only artwork.
 *
 * Timing (real-motion path, ~2.6s total):
 *   0.0s – 0.3s   background settles in
 *   0.3s – 0.9s   "GEOCODERZ" fades/resolves up
 *   0.9s – 1.2s   "PRESENTS" fades in beneath it
 *   1.2s – 2.0s   GeoMapAI mark + wordmark + tagline resolve in
 *   2.0s – 2.4s   brief hold on the full composition
 *   2.4s – 2.6s+  cross-fade out (App.jsx's landing-page mount
 *                 already fades in on its own, so the two overlap
 *                 into a seamless handoff rather than a hard cut)
 *
 * Reduced motion: skip straight to a short, static hold on the full
 * composition (no staged reveal, no moving parts) and then hand off —
 * matching HeroSequence.jsx's approach of freezing on the resolved
 * state rather than looping or animating.
 *
 * Props:
 *  - onFinish: () => void   Called once, when the splash should be
 *                           unmounted and the landing page revealed.
 */

const REAL_MOTION_STAGE_TIMES_MS = {
  geocoderz: 300,
  presents: 900,
  mark: 1200,
  hold: 2400,
  exit: 2850,
};

const REDUCED_MOTION_STAGE_TIMES_MS = {
  geocoderz: 0,
  presents: 0,
  mark: 0,
  hold: 900,
  exit: 1200,
};

export default function SplashIntro({ onFinish }) {
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const [stage, setStage] = useState('background');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const times = prefersReducedMotion
      ? REDUCED_MOTION_STAGE_TIMES_MS
      : REAL_MOTION_STAGE_TIMES_MS;

    const timers = [
      setTimeout(() => setStage('geocoderz'), times.geocoderz),
      setTimeout(() => setStage('presents'), times.presents),
      setTimeout(() => setStage('mark'), times.mark),
      setTimeout(() => setIsExiting(true), times.hold),
      setTimeout(() => onFinish?.(), times.exit),
    ];

    return () => timers.forEach(clearTimeout);
    // Intentionally run once on mount — the splash plays through a
    // fixed sequence regardless of prop identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageReached = (target) => {
    const order = ['background', 'geocoderz', 'presents', 'mark'];
    return order.indexOf(stage) >= order.indexOf(target);
  };

  return (
    <div
      className={`splash-intro ${isExiting ? 'is-exiting' : ''} ${
        prefersReducedMotion ? 'is-reduced-motion' : ''
      }`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="splash-intro-bg">
        <div className="splash-intro-grid" />

        <svg
          className="splash-intro-bg-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <g className="splash-intro-contours">
            <path d="M -10,30 C 20,18 45,42 70,25 S 105,15 120,32" />
            <path d="M -10,68 C 22,78 50,54 75,74 S 100,85 120,66" />
          </g>

          <g className="splash-intro-nodes">
            <circle cx="14" cy="20" r="0.35" style={{ animationDelay: '0.2s' }} />
            <circle cx="82" cy="16" r="0.3" style={{ animationDelay: '0.6s' }} />
            <circle cx="88" cy="78" r="0.35" style={{ animationDelay: '1s' }} />
            <circle cx="10" cy="82" r="0.3" style={{ animationDelay: '1.4s' }} />
          </g>
        </svg>
      </div>

      <div className="splash-intro-content">
        <div
          className={`splash-intro-geocoderz ${
            stageReached('geocoderz') ? 'is-visible' : ''
          }`}
        >
          GEOCODERZ
        </div>

        <div
          className={`splash-intro-presents ${
            stageReached('presents') ? 'is-visible' : ''
          }`}
        >
          PRESENTS
        </div>

        <div
          className={`splash-intro-mark ${
            stageReached('mark') ? 'is-visible' : ''
          }`}
        >
          <div className="splash-intro-mark-row">
            <div className="splash-intro-mark-icon">
              <Logo size={34} />
            </div>
            <span className="splash-intro-mark-word">GeoMapAI</span>
          </div>

          <span className="splash-intro-mark-tagline">
            GEOSPATIAL INTELLIGENCE
          </span>
        </div>
      </div>
    </div>
  );
}
