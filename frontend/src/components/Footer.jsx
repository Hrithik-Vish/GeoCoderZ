import Logo from './Logo';
import { TEAM_NAME, TEAM_MEMBERS } from './TeamSection';

/**
 * Footer
 *
 * Plan sections 71, 74: GeoMapAI identity + "Built by Geocoderz" +
 * the six team names with their roll/class identifiers (same fixed
 * order as TeamSection, imported directly so the two can never drift
 * out of sync) + "GEOCODERZ · GeoMapAI · Geospatial Intelligence."
 *
 * No links are rendered — the plan says "Only include links that
 * actually exist," and no GitHub/docs/contact URL has been provided,
 * so inventing one would be a broken or misleading link. Add real
 * hrefs here once they exist rather than guessing.
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <div className="app-footer-logo">
            <Logo size={20} />
          </div>

          <div>
            <strong>GeoMapAI</strong>
            <span>Geospatial Intelligence</span>
          </div>
        </div>

        <div className="app-footer-divider" />

        <div className="app-footer-team">
          <span className="app-footer-team-label">Built by</span>
          <strong className="app-footer-team-name">
            {TEAM_NAME.toUpperCase()}
          </strong>

          <div className="app-footer-team-members">
            {TEAM_MEMBERS.map((member) => (
              <span key={member.id}>
                {member.name}
                <span className="app-footer-team-id">{member.id}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="app-footer-divider" />

        <div className="app-footer-meta">
          GEOCODERZ · GeoMapAI · Geospatial Intelligence
        </div>
      </div>
    </footer>
  );
}
