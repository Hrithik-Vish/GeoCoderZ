import { ArrowDown } from 'lucide-react';

/**
 * MultilingualSection
 *
 * Plan section 67 — the Marathi/Mahad worked example, illustrating
 * that multilingual incident text can lead to a canonical geographic
 * result.
 *
 * Worded carefully: this shows what the pipeline is designed to
 * support, not a claim that language detection is live in the
 * current product — see backend_contract_extensions.md section 1,
 * which documents that the actual /resolve contract has no language
 * fields yet. Matches the plan's own qualifier elsewhere ("as the
 * implementation allows") rather than presenting this as a working
 * feature today.
 */
export default function MultilingualSection() {
  return (
    <section className="multilingual-section">
      <div className="section-heading">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          DESIGNED FOR MULTILINGUAL TEXT
        </span>

        <h2>One canonical result, regardless of script</h2>

        <p className="multilingual-subtitle">
          The pipeline is built so multilingual incident text can still
          resolve to a canonical geographic location, as the underlying
          language support allows.
        </p>
      </div>

      <div className="multilingual-flow">
        <div className="multilingual-step multilingual-step--source">
          <span className="demo-step-label">मराठी INCIDENT REPORT</span>
          <p lang="mr">
            “महाडमध्ये मुसळधार पावसामुळे पूरस्थिती निर्माण झाली…”
          </p>
        </div>

        <ArrowDown size={18} className="demo-arrow" />

        <div className="multilingual-step multilingual-step--detected">
          <span className="demo-step-label">DETECTED</span>
          <div className="demo-chips">
            <span lang="mr">महाड</span>
          </div>
        </div>

        <ArrowDown size={18} className="demo-arrow" />

        <div className="multilingual-step multilingual-step--canonical">
          <span className="demo-step-label">CANONICAL</span>
          <strong>Mahad</strong>
          <span className="multilingual-region">Raigad, Maharashtra</span>
        </div>

        <ArrowDown size={18} className="demo-arrow" />

        <div className="demo-step demo-step--map">
          <span className="demo-step-label">MAP</span>
          <div className="demo-map-marker">Mahad</div>
        </div>
      </div>
    </section>
  );
}
