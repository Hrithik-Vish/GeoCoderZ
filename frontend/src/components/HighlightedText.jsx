import { useMemo, useState } from 'react';

/**
 * HighlightedText
 *
 * Renders the exact text that was analyzed with each detected place name
 * (place.raw) wrapped in a clickable, hoverable span, colored by
 * confidence band. This is the text<->map linking surface described in
 * frontend_build.md as "the single most important interaction for the
 * demo" — clicking a highlighted name selects that place the same way
 * clicking its result-card row or map marker does.
 *
 * Matching strategy: places are matched against `text` by literal,
 * case-sensitive substring search for `raw`, in the order the backend
 * returned them (which response_assembly.py sorts by position_in_text
 * server-side) — so scanning left-to-right and taking the first
 * unclaimed occurrence of each `raw` after the previous match's end
 * naturally reproduces the true order without needing separate
 * position data the contract doesn't provide. A `raw` that can't be
 * found verbatim (defensive — contract.md guarantees raw is a real
 * substring of original_text, but text is never trusted blindly here)
 * is simply skipped, not force-highlighted somewhere wrong.
 *
 * Props:
 *  - text: string                 The analyzed source text (original_text).
 *  - places: array                Normalized places (same shape as
 *                                  extractedPlaces in App.jsx).
 *  - selectedPlace: object|null   Currently selected place, for the
 *                                  active-highlight state.
 *  - onSelectPlace: (place) => void   Called when a highlighted span is
 *                                      clicked or activated via keyboard.
 */
const HighlightedText = ({
  text,
  places = [],
  selectedPlace = null,
  onSelectPlace,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const segments = useMemo(
    () => buildSegments(text, places),
    [text, places]
  );

  if (!text) {
    return null;
  }

  const getConfidenceBand = (place) => {
    if (place.status !== 'resolved') return 'unresolved';

    const value =
      typeof place.confidence === 'number'
        ? place.confidence
        : 0;

    if (value >= 0.9) return 'high';
    if (value >= 0.6) return 'medium';
    return 'low';
  };

  const isSamePlace = (a, b) =>
    a &&
    b &&
    a.raw === b.raw &&
    a.lat === b.lat &&
    a.long === b.long;

  return (
    <p className="highlighted-text">
      {segments.map((segment, index) => {
        if (segment.type === 'plain') {
          return (
            <span key={`plain-${index}`}>
              {segment.value}
            </span>
          );
        }

        const band = getConfidenceBand(segment.place);
        const isSelected = isSamePlace(
          segment.place,
          selectedPlace
        );
        const isHovered = hoveredIndex === index;

        return (
          <button
            type="button"
            key={`entity-${index}`}
            className={`highlighted-entity highlighted-entity--${band} ${
              isSelected ? 'is-selected' : ''
            } ${isHovered ? 'is-hovered' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
            onClick={() => onSelectPlace?.(segment.place)}
          >
            {segment.value}

            {isHovered && (
              <span className="highlighted-tooltip" role="tooltip">
                <strong>
                  {segment.place.status === 'resolved'
                    ? segment.place.canonical
                    : segment.place.raw}
                </strong>

                {segment.place.status === 'resolved' ? (
                  <span className="highlighted-tooltip-confidence">
                    {Math.round(
                      (segment.place.confidence || 0) * 100
                    )}
                    % confidence
                  </span>
                ) : (
                  <span className="highlighted-tooltip-confidence highlighted-tooltip-confidence--failed">
                    Not resolved
                  </span>
                )}
              </span>
            )}
          </button>
        );
      })}
    </p>
  );
};

/**
 * Splits `text` into an ordered list of { type: 'plain', value } and
 * { type: 'entity', value, place } segments. Each place in `places` is
 * searched for once, starting from just after the end of the previous
 * match, so repeated raw names (e.g. "Thane" mentioned twice) each land
 * on a distinct occurrence rather than all pointing at the first one.
 */
function buildSegments(text, places) {
  if (!text || !places.length) {
    return text ? [{ type: 'plain', value: text }] : [];
  }

  const matches = [];
  let searchFrom = 0;

  for (const place of places) {
    if (!place.raw) continue;

    const foundAt = text.indexOf(place.raw, searchFrom);

    if (foundAt === -1) {
      // raw not found from the current cursor onward — try from the
      // very start in case ordering doesn't strictly match text order
      // (defensive; contract.md's response_assembly.py sorts by
      // position_in_text, but this never assumes that blindly).
      const fallbackAt = text.indexOf(place.raw);
      if (fallbackAt === -1) continue;

      matches.push({
        start: fallbackAt,
        end: fallbackAt + place.raw.length,
        place,
      });
      continue;
    }

    matches.push({
      start: foundAt,
      end: foundAt + place.raw.length,
      place,
    });

    searchFrom = foundAt + place.raw.length;
  }

  // Matches found via the fallback branch above can be out of order —
  // put everything back into text order before slicing.
  matches.sort((a, b) => a.start - b.start);

  const segments = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start < cursor) {
      // Overlaps a previous match (can happen if one raw name is a
      // substring of another, e.g. "Thane" inside a longer span) —
      // skip rather than render broken/overlapping spans.
      continue;
    }

    if (match.start > cursor) {
      segments.push({
        type: 'plain',
        value: text.slice(cursor, match.start),
      });
    }

    segments.push({
      type: 'entity',
      value: text.slice(match.start, match.end),
      place: match.place,
    });

    cursor = match.end;
  }

  if (cursor < text.length) {
    segments.push({
      type: 'plain',
      value: text.slice(cursor),
    });
  }

  return segments;
}

export default HighlightedText;
