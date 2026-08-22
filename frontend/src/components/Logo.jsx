/**
 * Logo
 *
 * GeoMapAI's mark, built directly from the product's actual mechanism
 * rather than a generic map-pin-plus-circuit-board: several ambiguous
 * candidate nodes (dashed, faint) converge along bearing lines onto one
 * solid, confident coordinate marker with crosshair ticks. This is
 * Concept C from the brand plan ("Resolved Location") — the same
 * ambiguous-mention-to-resolved-coordinate story the product itself
 * tells on every search, so the mark stays legible even at favicon
 * size and in monochrome (it's read as a convergence shape, not
 * dependent on hue).
 *
 * Props:
 *  - size: number       Rendered width/height in px. Default 32.
 *  - animated: boolean  When true, candidate nodes softly pulse and
 *                        drift toward center (loading-state use, e.g.
 *                        a future page-load or processing moment).
 *                        Off by default; respects prefers-reduced-motion
 *                        globally via the app's existing CSS rule.
 *  - className: string  Extra class(es) merged onto the root <svg>.
 */
const Logo = ({ size = 32, animated = false, className = '' }) => {
  // Three unresolved candidate mentions at consistent angles, and the
  // one canonical point they resolve to at center. Coordinates are
  // fixed in a 40x40 viewBox so the mark scales cleanly to any size.
  const candidates = [
    { cx: 9, cy: 10 },
    { cx: 31, cy: 12 },
    { cx: 12, cy: 30 },
  ];

  const resolved = { cx: 22, cy: 22 };

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={`geomapai-logo ${animated ? 'geomapai-logo--animated' : ''} ${className}`}
      role="img"
      aria-label="GeoMapAI"
    >
      {/* Bearing lines from each candidate toward the resolved point —
          dashed to read as "possible", not as a committed connection. */}
      {candidates.map((c, i) => (
        <line
          key={`line-${i}`}
          x1={c.cx}
          y1={c.cy}
          x2={resolved.cx}
          y2={resolved.cy}
          className="geomapai-logo-bearing"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* Candidate nodes: small, hollow, faint — unresolved mentions. */}
      {candidates.map((c, i) => (
        <circle
          key={`node-${i}`}
          cx={c.cx}
          cy={c.cy}
          r={2.4}
          className="geomapai-logo-candidate"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* The resolved coordinate: solid disc + crosshair ticks, same
          visual language as a map's center-pin reticle. */}
      <g className="geomapai-logo-resolved">
        <line x1={resolved.cx - 7} y1={resolved.cy} x2={resolved.cx - 4.2} y2={resolved.cy} />
        <line x1={resolved.cx + 4.2} y1={resolved.cy} x2={resolved.cx + 7} y2={resolved.cy} />
        <line x1={resolved.cx} y1={resolved.cy - 7} x2={resolved.cx} y2={resolved.cy - 4.2} />
        <line x1={resolved.cx} y1={resolved.cy + 4.2} x2={resolved.cx} y2={resolved.cy + 7} />
        <circle cx={resolved.cx} cy={resolved.cy} r={3.4} />
      </g>
    </svg>
  );
};

export default Logo;
