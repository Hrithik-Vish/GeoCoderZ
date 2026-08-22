import { Layers } from 'lucide-react';

/**
 * SpatialDemonstrationSection
 *
 * Plan section 91 — a wide section showing the map itself with
 * several resolved locations, distinct from the smaller inline map
 * mockups used elsewhere (LiveDemonstrationSection, MultilingualSection).
 *
 * This uses the same three example locations from the plan's own
 * worked examples across other sections (Thane, Kalyan, Mahad) rather
 * than inventing a new example set, so the whole landing page tells
 * one consistent story instead of switching examples per section.
 *
 * Kept as a static illustration (not the real embedded Leaflet map) —
 * that's a deliberate choice for the landing page's performance rules
 * (plan section 105: "never make the landing page dependent on a
 * remote animation service," and the real map depends on remote tile
 * servers). The actual interactive map lives in the workspace itself.
 */
export default function SpatialDemonstrationSection() {
  const locations = [
    { name: 'Thane', x: 32, y: 28 },
    { name: 'Kalyan', x: 48, y: 44 },
    { name: 'Mahad', x: 68, y: 66 },
  ];

  return (
    <section className="spatial-demo-section" id="map">
      <div className="section-heading">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          SPATIAL RESOLUTION
        </span>

        <h2>Every location, one map</h2>
      </div>

      <div className="spatial-demo-map">
        <div className="spatial-demo-grid" aria-hidden="true" />

        {locations.map((location) => (
          <div
            key={location.name}
            className="spatial-demo-marker"
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
          >
            <span className="spatial-demo-marker-dot" />
            <span className="spatial-demo-marker-label">
              {location.name}
            </span>
          </div>
        ))}

        <div className="spatial-demo-counter">
          <Layers size={13} />
          {locations.length} locations resolved
        </div>
      </div>
    </section>
  );
}
