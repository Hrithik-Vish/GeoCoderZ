import { useEffect, useState } from 'react';

/**
 * LandingBackground
 *
 * The landing page's own ambient backdrop (plan section 68) — spans
 * the full scrollable page (fixed positioning, not tied to hero
 * height) and is allowed more visual presence than the dashboard's
 * GeographicBackground.jsx ("more visually dramatic than the
 * dashboard"), while still following the same "living digital map,
 * not an AI particle wallpaper" restraint from the same section.
 *
 * Layers: topographic contours (slow drift), coordinate grid (slow
 * parallax), geographic nodes (appear/disappear), route traces
 * (thin connecting lines), and a scan line.
 *
 * Deliberately does NOT duplicate the hero's own convergence
 * animation (ResolvedLocationHero / HeroSequence already do that in
 * the foreground) — this layer stays ambient scenery so it
 * complements rather than competes with the actual hero mark.
 *
 * The scan line only renders once (not looping indefinitely) each
 * time the page loads, consistent with section 59's instruction not
 * to build a "fake loading loop that pretends to process a report
 * continuously" — a background element sweeping forever would read
 * the same way. It re-arms every 25s so it's an occasional flourish,
 * not a hero-competing constant motion.
 */
export default function LandingBackground() {
  const [scanKey, setScanKey] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    const interval = setInterval(() => {
      setScanKey((previous) => previous + 1);
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // Scattered node positions across the full page (percentage-based
  // so they reflow with page height as content is added below).
  const nodes = [
    { x: 8, y: 6 },
    { x: 22, y: 14 },
    { x: 41, y: 5 },
    { x: 68, y: 11 },
    { x: 88, y: 8 },
    { x: 15, y: 32 },
    { x: 52, y: 28 },
    { x: 79, y: 35 },
    { x: 6, y: 55 },
    { x: 35, y: 60 },
    { x: 63, y: 52 },
    { x: 91, y: 58 },
    { x: 18, y: 78 },
    { x: 46, y: 82 },
    { x: 74, y: 75 },
    { x: 90, y: 88 },
  ];

  const routes = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [5, 6],
    [6, 7],
    [8, 9],
    [9, 10],
    [10, 11],
    [12, 13],
    [13, 14],
    [14, 15],
  ];

  return (
    <div className="landing-bg" aria-hidden="true">
      <div className="landing-bg-grid" />

      <svg
        className="landing-bg-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="presentation"
      >
        <g className="landing-bg-contours">
          <path d="M -10,20 C 20,8 45,32 70,15 S 105,5 120,22" />
          <path d="M -10,38 C 25,50 48,22 72,42 S 100,55 120,36" />
          <path d="M -10,60 C 18,48 42,72 68,55 S 98,42 120,62" />
          <path d="M -10,80 C 22,90 50,66 75,86 S 100,95 120,78" />
        </g>

        <g className="landing-bg-routes">
          {routes.map(([a, b], i) => (
            <line
              key={`route-${i}`}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={nodes[b].x}
              y2={nodes[b].y}
            />
          ))}
        </g>

        <g className="landing-bg-nodes">
          {nodes.map((n, i) => (
            <circle
              key={`node-${i}-${scanKey}`}
              cx={n.x}
              cy={n.y}
              r="0.3"
              style={{ animationDelay: `${(i % 6) * 1.1}s` }}
            />
          ))}
        </g>
      </svg>

      <div key={scanKey} className="landing-bg-scanline" />
    </div>
  );
}
