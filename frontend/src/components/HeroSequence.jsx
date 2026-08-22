import { useEffect, useState } from 'react';

/**
 * HeroSequence
 *
 * Plan section 59 — a non-interactive visual explanation of the
 * product, cycling through the four pipeline stages using the plan's
 * own worked example (Thane / Kalyan). This is explicitly NOT meant
 * to look like the app processing a real request — see the plan's own
 * instruction: "Do not create a fake loading loop that pretends to
 * process a report continuously. The animation is a visual
 * explanation of the product, not fake backend activity." To keep
 * that distinction clear:
 *
 *  - No spinner, no progress bar, no "Processing..." language — those
 *    are the real dashboard's vocabulary (ResolveLoader.jsx) and
 *    reusing them here would blur demo and reality.
 *  - Every stage is labeled and stays on screen long enough to read
 *    (4s per stage, matching the "slow enough to understand"
 *    instruction) rather than flickering through quickly.
 *  - The cycle pauses indefinitely (does not restart) once reduced
 *    motion is preferred — see the prefers-reduced-motion check
 *    below, which freezes on the final "resolved" stage rather than
 *    continuing to animate.
 */

const STAGES = [
  {
    key: 'raw',
    label: 'RAW INCIDENT TEXT',
    content: '“Heavy rainfall reported near Thane and Kalyan…”',
  },
  {
    key: 'extraction',
    label: 'PLACE EXTRACTION',
    chips: ['Thane', 'Kalyan'],
  },
  {
    key: 'resolution',
    label: 'GEO-RESOLUTION',
    chips: ['Thane, MH', 'Kalyan, MH'],
  },
  {
    key: 'map',
    label: 'MAP',
    markers: 2,
  },
];

const STAGE_DURATION_MS = 4000;

export default function HeroSequence() {
  // Compute the reduced-motion starting stage during initial render
  // (via useState's lazy initializer) rather than setting it inside an
  // effect — this is the one instance in this codebase where that's
  // actually clean to do, since the initial value has no dependency on
  // props or a previous value, unlike the other components' timing
  // states (see ResolveLoader.jsx / TextHighlighter.jsx for why those
  // stay effect-based instead).
  const [stageIndex, setStageIndex] = useState(() => {
    if (typeof window === 'undefined') {
      return 0;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    return prefersReducedMotion ? STAGES.length - 1 : 0;
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Respect the plan's own reduced-motion instruction (section 69):
    // stay frozen on the final, resolved stage rather than looping.
    if (prefersReducedMotion) {
      return undefined;
    }

    const interval = setInterval(() => {
      setStageIndex((previous) => (previous + 1) % STAGES.length);
    }, STAGE_DURATION_MS);

    return () => clearInterval(interval);
  }, []);

  const stage = STAGES[stageIndex];

  return (
    <div className="hero-sequence" aria-hidden="true">
      <span className="hero-sequence-label">{stage.label}</span>

      {stage.content && (
        <p className="hero-sequence-text">{stage.content}</p>
      )}

      {stage.chips && (
        <div className="hero-sequence-chips">
          {stage.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      )}

      {stage.markers && (
        <div className="hero-sequence-markers">
          {Array.from({ length: stage.markers }).map((_, i) => (
            <span key={i} className="hero-sequence-marker" />
          ))}
        </div>
      )}

      <div className="hero-sequence-dots">
        {STAGES.map((s, i) => (
          <span
            key={s.key}
            className={i === stageIndex ? 'active' : ''}
          />
        ))}
      </div>
    </div>
  );
}
