/**
 * GeographicBackground
 *
 * The dashboard's ambient backdrop — plan sections 7–10. Built as six
 * distinct, individually-subtle layers rather than one busy scene, so
 * each layer stays legible as "a coordinate grid" or "contour lines"
 * instead of blurring into generic noise:
 *
 *   1. Base       — solid themed background (handled by CSS on the
 *                    parent; no separate element needed here)
 *   2. Grid        — fine + coarse latitude/longitude grid lines
 *   3. Contours    — a handful of curved, topographic-style paths
 *   4. Nodes       — small dots standing in for abstract geographic
 *                    points, never real unresolved data (this is a
 *                    decorative layer, see the aria-hidden root)
 *   5. Routes      — faint lines connecting a few of the nodes
 *   6. Coordinates — small corner labels; real coordinates from the
 *                    project's own reference area (Thane/Mumbai,
 *                    matching the mock data's geography) rather than
 *                    arbitrary numbers, though the labels themselves
 *                    are decorative, not live telemetry — see the
 *                    plan's own "clearly decorative unless they
 *                    correspond to actual application data" rule.
 *
 * Per section 9's animation rules, every layer's motion is slow,
 * low-opacity, and non-distracting on its own; the whole thing is
 * meant to be noticed after several seconds, not immediately. All
 * animation is opacity/transform-based (never triggers layout) so the
 * app's existing global prefers-reduced-motion rule (index.css) turns
 * it off cleanly.
 *
 * Per section 10, the layer reacts to one real application state:
 * `isActive` (an analysis request in flight) very slightly raises the
 * grid/contour opacity and adds a slow scanning line, rather than
 * introducing a whole separate "processing" animation vocabulary.
 *
 * Props:
 *  - isActive: boolean   True while an incident report is being
 *                         analyzed (App.jsx's isExtracting). Default
 *                         false — the idle state is the default look.
 */
const GeographicBackground = ({ isActive = false }) => {
  // Scattered, intentionally irregular node positions (percentage
  // coordinates so the layer reflows with the container) — abstract
  // geographic points, not real place data.
  const nodes = [
    { x: 12, y: 18 },
    { x: 34, y: 9 },
    { x: 61, y: 22 },
    { x: 82, y: 14 },
    { x: 91, y: 46 },
    { x: 73, y: 63 },
    { x: 48, y: 71 },
    { x: 22, y: 58 },
    { x: 8, y: 82 },
    { x: 55, y: 88 },
  ];

  // A few faint connections between nearby nodes — route traces, not
  // a complete graph, so it reads as sparse and organic rather than a
  // network diagram.
  const routes = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 0],
    [6, 9],
  ];

  return (
    <div
      className={`geo-bg ${isActive ? 'geo-bg--active' : ''}`}
      aria-hidden="true"
    >
      {/* Layer 2 — coordinate grid (fine + coarse), CSS gradients */}
      <div className="geo-bg-grid" />

      {/* Layers 3–5 — contours, nodes, routes, all SVG so curves and
          scattered points render cleanly at any viewport size */}
      <svg
        className="geo-bg-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="presentation"
      >
        {/* Layer 3 — topographic contours: a few nested, irregular
            curves suggesting elevation lines without depicting any
            real terrain */}
        <g className="geo-bg-contours">
          <path d="M -10,30 C 15,15 35,45 60,25 S 95,10 115,30" />
          <path d="M -10,45 C 20,32 40,58 65,40 S 100,28 115,48" />
          <path d="M -10,65 C 18,78 42,52 68,72 S 98,85 115,66" />
        </g>

        {/* Layer 5 — route traces, drawn under the nodes */}
        <g className="geo-bg-routes">
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

        {/* Layer 4 — geographic nodes */}
        <g className="geo-bg-nodes">
          {nodes.map((n, i) => (
            <circle
              key={`node-${i}`}
              cx={n.x}
              cy={n.y}
              r="0.5"
              style={{ animationDelay: `${(i % 5) * 1.4}s` }}
            />
          ))}
        </g>
      </svg>

      {/* Analysis-active scanning line (section 10) — only present
          while isActive is true, so it never runs during idle browsing */}
      {isActive && <div className="geo-bg-scanline" />}

      {/* Layer 6 — coordinate labels, decorative reference points
          drawn from the project's own real reference area */}
      <span className="geo-bg-coord geo-bg-coord--tl">
        19.2183° N, 72.9781° E
      </span>
      <span className="geo-bg-coord geo-bg-coord--br">
        EPSG:4326
      </span>
    </div>
  );
};

export default GeographicBackground;
