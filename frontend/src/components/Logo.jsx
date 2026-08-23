/**
 * Logo
 *
 * GeoMapAI's brand mark: a geometric location pin whose head opens into
 * the letter "G", with the ring's opening cut on a diagonal so it also
 * reads as a compass bearing rather than a plain circular counter. One
 * shape carries all three ideas the brief calls for — place marker,
 * initial, direction — without adding a separate globe, circuit
 * decoration, or floating accent glyph.
 *
 * Deliberately flat: solid fills, no gradients, no drop shadow baked
 * into the artwork itself (any elevation/shadow is applied by the
 * container that hosts it, e.g. the sidebar chip). This keeps the mark
 * legible at favicon size and reduces cleanly to a single color for
 * monochrome placements.
 *
 * Color is driven entirely by CSS (the `.geomapai-logo-pin` /
 * `.geomapai-logo-g` classes in App.css, keyed off theme variables) so
 * the mark tracks the active theme automatically and needs no separate
 * light/dark artwork — the geometry is identical between themes, only
 * the two fills swap.
 *
 * Props:
 *  - size: number       Rendered width/height in px. Default 32.
 *  - className: string  Extra class(es) merged onto the root <svg>.
 */
const Logo = ({ size = 32, className = '' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={`geomapai-logo ${className}`}
      role="img"
      aria-label="GeoMapAI"
    >
      {/* Pin silhouette. */}
      <path
        className="geomapai-logo-pin"
        d="M20 3.2 C12.16 3.2 5.8 9.56 5.8 17.4 C5.8 20.9 7.6 24.6 10.2 28 C12.8 31.4 16.1 34.4 18.35 36.45 C19.3 37.3 20.7 37.3 21.65 36.45 C23.9 34.4 27.2 31.4 29.8 28 C32.4 24.6 34.2 20.9 34.2 17.4 C34.2 9.56 27.84 3.2 20 3.2 Z"
      />

      {/* "G" counter cut from the pin head, evenodd so it renders as
          negative space against whatever sits behind the mark. The
          ring's opening is cut on a diagonal (top right) rather than
          straight across, doubling as a compass-bearing cue. */}
      <path
        className="geomapai-logo-g"
        fillRule="evenodd"
        d="M20 8.9 A8.4 8.4 0 1 0 28.4 17.3 L28.4 16.3 L20.9 16.3 L20.9 19.3 L24.9 19.3 A5.2 5.2 0 1 1 25.15 12.9 L27.85 10.5 A8.38 8.38 0 0 0 20 8.9 Z"
      />
    </svg>
  );
};

export default Logo;
