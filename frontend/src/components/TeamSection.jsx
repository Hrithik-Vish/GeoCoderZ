/**
 * TeamSection
 *
 * The "Geocoderz" developer credits section (plan sections 71–73).
 *
 * The six names, their roll/class identifiers, and their order are
 * all fixed by the plan ("The order must not be changed") —
 * TEAM_MEMBERS below preserves that exact order and should not be
 * resorted or filtered for display.
 *
 * No roles are assigned to any member (plan section 73: "Do not add
 * fabricated roles... unless those roles are officially defined by
 * the team"). Every card shows only a name and the person's real
 * roll/class identifier — that identifier is provided data, not an
 * invented role, and the plan calls for it to be shown as secondary
 * metadata under the name.
 *
 * No photos are available, so every card uses a plain initials mark
 * rather than inventing a photograph.
 */

const TEAM_NAME = 'Geocoderz';

// Fixed order and identifiers — see file header. Do not resort.
const TEAM_MEMBERS = [
  { name: 'Hrithik Vishwakarma', id: 'TE_COMPS_D_42' },
  { name: 'Divyajyot Sinha', id: 'TE_COMPS_D_20' },
  { name: 'Saurabh Vishwakarma', id: 'TE_COMPS_D_45' },
  { name: 'Bhavika Vasule', id: 'TE_COMPS_D_35' },
  { name: 'Aman Jha', id: 'TE_E&TC_A_35' },
  { name: 'Riya Katiyar', id: 'TE_IT_C_64' },
];

const initialsFor = (fullName) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function TeamSection() {
  return (
    <section className="team-section" id="team">
      <div className="team-section-heading">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          {TEAM_NAME.toUpperCase()}
        </span>

        <h2>The team behind GeoMapAI</h2>
      </div>

      <div className="team-grid">
        {TEAM_MEMBERS.map((member) => (
          <div className="team-card" key={member.id}>
            <div className="team-card-avatar">
              {initialsFor(member.name)}
            </div>

            <strong>{member.name}</strong>
            <span>{member.id}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export { TEAM_NAME, TEAM_MEMBERS };
