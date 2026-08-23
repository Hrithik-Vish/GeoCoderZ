import Logo from './Logo';
import { TEAM_MEMBERS } from './TeamSection';

/**
 * Footer
 *
 * GeoMapAI identity + "Built by GeoCoderz" + the six team names with
 * their roll/class identifiers (same fixed order as TeamSection,
 * imported directly so the two can never drift out of sync) +
 * "GeoCoderz · GeoMapAI · Geospatial Intelligence."
 *
 * Team name is written directly as the literal "GeoCoderz" (capital
 * G, capital C) rather than imported from TeamSection's TEAM_NAME, so
 * this footer's spelling stays correct even if that constant is ever
 * changed for its own uppercased eyebrow-label use.
 *
 * No links are rendered — no GitHub/docs/contact URL has been
 * provided, so inventing one would be a broken or misleading link.
 * Add real hrefs here once they exist rather than guessing.
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
            <span className="app-footer-credit">By GeoCoderz</span>
          </div>
        </div>

        <div className="app-footer-divider" />

        <div className="app-footer-team">
          <span className="app-footer-team-label">Built by</span>
          <strong className="app-footer-team-name">GeoCoderz</strong>

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
          GeoCoderz · GeoMapAI · Geospatial Intelligence
        </div>
      </div>
    </footer>
  );
}
