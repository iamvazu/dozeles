import Icon from './Icon.jsx';

export default function CleanlinessAuditSection({ onOpenAuditModal }) {
  return (
    <section className="cleanliness-audit-section" id="cleanliness-audit">
      <div className="container">
        <div className="audit-section-grid">
          {/* Left Column: Offer & Details */}
          <div>
            <div className="audit-pill-badge" style={{ marginBottom: 16 }}>
              <Icon name="badge" size={15} /> 15-Point Objective Inspection
            </div>
            <h2 className="audit-section-heading">
              How Clean Is Your Facility Really? <br />
              <span className="accent">Let Us Audit Your Current Janitorial Contractor.</span>
            </h2>
            <p className="audit-section-sub">
              Most commercial cleaning contractors start strong, but gradually cut corners within 90 days. 
              Let our certified inspectors visit your facility, run objective scientific ATP surface tests, 
              audit restroom hygiene, and give you an unbiased <strong>Cleanliness Scorecard</strong> — 100% Free with zero obligation.
            </p>

            <div className="audit-feature-list">
              <div className="audit-feature-item">
                <div className="audit-feature-icon">🔬</div>
                <div>
                  <h4>ATP Surface Residue &amp; Bio-Load Swab</h4>
                  <p>We test high-touch desks, door handles, and kitchen areas for microscopic bacteria and chemical residue.</p>
                </div>
              </div>

              <div className="audit-feature-item">
                <div className="audit-feature-icon">🧼</div>
                <div>
                  <h4>Restroom Deep Sanitation &amp; Odor Check</h4>
                  <p>In-depth inspection of hidden grout bacteria, plumbing fixtures, dispenser hygiene, and ventilation airflow.</p>
                </div>
              </div>

              <div className="audit-feature-item">
                <div className="audit-feature-icon">🛡️</div>
                <div>
                  <h4>Cal/OSHA &amp; DIR Safety Compliance</h4>
                  <p>Verification of safety data sheets (SDS), chemical storage hazards, and non-slip floor traction safety.</p>
                </div>
              </div>

              <div className="audit-feature-item">
                <div className="audit-feature-icon">💰</div>
                <div>
                  <h4>Contract Scope &amp; Market Rate Benchmark</h4>
                  <p>We compare what you currently pay per square foot against current Bay Area market averages to uncover overspending.</p>
                </div>
              </div>
            </div>

            <div className="audit-cta-wrap">
              <button 
                onClick={onOpenAuditModal}
                className="btn btn-gold btn-cleanliness-score"
              >
                Get a Free Site Walkthrough &amp; Cleanliness Score →
              </button>
              <div className="audit-guarantee-note">
                ✓ 15-minute quick walkthrough • Zero disruption • 100% confidential
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup of the Cleanliness Scorecard */}
          <div className="audit-card-preview">
            <div className="scorecard-mockup">
              <div className="scorecard-header">
                <div>
                  <span className="scorecard-tag">SAMPLE REPORT CARD</span>
                  <h3 className="scorecard-title">Commercial Facility Cleanliness Audit</h3>
                  <p className="scorecard-meta">15-Point Inspection Protocol • EPA &amp; OSHA Compliant</p>
                </div>
                <div className="scorecard-grade-badge">
                  <span className="grade-letter">96</span>
                  <span className="grade-label">Grade A+</span>
                </div>
              </div>

              <div className="scorecard-metrics">
                <div className="metric-row">
                  <div className="metric-info">
                    <span className="metric-name">High-Touch Bio-Load (ATP Swab)</span>
                    <span className="metric-val text-emerald">12 RLU (Pass &lt; 30)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill emerald" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric-info">
                    <span className="metric-name">Restroom &amp; Grout Disinfection</span>
                    <span className="metric-val text-emerald">98% Sterile</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill emerald" style={{ width: '98%' }}></div>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric-info">
                    <span className="metric-name">Air Quality &amp; HEPA 0.3μ Filtration</span>
                    <span className="metric-val text-emerald">99.97% Particulate Free</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill emerald" style={{ width: '99%' }}></div>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric-info">
                    <span className="metric-name">Cal/OSHA Safety &amp; SDS Logs</span>
                    <span className="metric-val text-blue">100% Compliant</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill blue" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              <div className="scorecard-footer-box">
                <div className="footer-box-title">Why Companies Love This Audit:</div>
                <p>
                  "Dozeles inspected our 18,000 sq ft tech campus and proved our previous contractor hadn't sanitized conference room touchpoints in months. We switched and saved $450/month."
                </p>
                <div className="footer-box-author">— Operations Director, Palo Alto Tech Campus</div>
              </div>

              <button 
                onClick={onOpenAuditModal}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}
              >
                Claim Your Facility's Audit Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
