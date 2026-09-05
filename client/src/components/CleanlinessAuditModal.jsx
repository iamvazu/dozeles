import { useState } from 'react';
import Icon from './Icon.jsx';
import CaptchaChallenge from './CaptchaChallenge.jsx';
import { api } from '../api.js';

export default function CleanlinessAuditModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    businessName: '',
    facilityType: 'Tech / Corporate Office',
    sqft: '',
    currentStatus: 'Currently have a contractor — want an objective cleanliness score',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    preferredDate: '',
    notes: '',
  });
  const [captchaData, setCaptchaData] = useState({ answer: '', expected: 0, token: '', hp_website: '' });
  const [captchaError, setCaptchaError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCaptchaError(null);

    // Validate Honeypot
    if (captchaData.hp_website) {
      // Bot detected
      return;
    }

    // Validate Math Captcha
    if (!captchaData.answer || parseInt(captchaData.answer, 10) !== captchaData.expected) {
      setCaptchaError('Please solve the math security question correctly to proceed.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/walkthrough', {
        ...form,
        captchaAnswer: captchaData.answer,
        captchaToken: captchaData.token,
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audit-modal-overlay" onClick={onClose}>
      <div 
        className="audit-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
      >
        <button className="audit-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {!submitted ? (
          <div>
            <div className="audit-modal-header">
              <div className="audit-pill-badge">
                <Icon name="badge" size={15} /> 100% Free • No Obligation • 15-Point Facility Audit
              </div>
              <h2 id="audit-modal-title" className="audit-modal-title">
                Get a Free Site Walkthrough &amp; Cleanliness Score
              </h2>
              <p className="audit-modal-subtitle">
                Curious how your existing janitorial contractor is performing? Our certified inspectors will conduct a 
                confidential 15-minute facility audit and deliver an objective, graded Cleanliness &amp; Safety Report Card.
              </p>
            </div>

            {/* Value Pillars */}
            <div className="audit-pillars-grid">
              <div className="audit-pillar-item">
                <span className="pillar-icon">🔬</span>
                <div>
                  <strong>ATP Surface Bio-Load Swab</strong>
                  <p>Tests bacteria &amp; touchpoint residue on desks &amp; breakrooms</p>
                </div>
              </div>
              <div className="audit-pillar-item">
                <span className="pillar-icon">🧼</span>
                <div>
                  <strong>Restroom &amp; Grout Hygiene</strong>
                  <p>In-depth fixture, drain &amp; odor elimination inspection</p>
                </div>
              </div>
              <div className="audit-pillar-item">
                <span className="pillar-icon">🛡️</span>
                <div>
                  <strong>Cal/OSHA Safety Audit</strong>
                  <p>Checks SDS compliance, chemical storage &amp; slip hazards</p>
                </div>
              </div>
              <div className="audit-pillar-item">
                <span className="pillar-icon">📊</span>
                <div>
                  <strong>$/Sq.Ft Scope Benchmark</strong>
                  <p>Compare what you pay vs. actual market deliverables</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="audit-error-banner">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="audit-form">
              <div className="audit-form-grid">
                <div>
                  <label className="audit-label">Company / Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Inc. or Bay Health Dental"
                    value={form.businessName}
                    onChange={handleChange('businessName')}
                    className="audit-input"
                  />
                </div>
                <div>
                  <label className="audit-label">Facility Type</label>
                  <select
                    value={form.facilityType}
                    onChange={handleChange('facilityType')}
                    className="audit-input"
                  >
                    <option value="Tech / Corporate Office">Corporate &amp; Tech Office</option>
                    <option value="Medical / Dental Clinic">Medical, Dental or Surgery Clinic</option>
                    <option value="Warehouse / Industrial Facility">Warehouse / Logistics &amp; Industrial</option>
                    <option value="Daycare / School Facility">Daycare, Preschool or Private School</option>
                    <option value="Retail / Cannabis Dispensary">Retail Store or Cannabis Dispensary</option>
                    <option value="HOA / Condominium Common Areas">HOA / Multi-Family Commons</option>
                    <option value="Residential Property">Luxury Residential Estate</option>
                  </select>
                </div>
              </div>

              <div className="audit-form-grid">
                <div>
                  <label className="audit-label">Approximate Square Footage</label>
                  <input
                    type="text"
                    placeholder="e.g. 5,000 – 15,000 sq ft"
                    value={form.sqft}
                    onChange={handleChange('sqft')}
                    className="audit-input"
                  />
                </div>
                <div>
                  <label className="audit-label">Your Current Situation</label>
                  <select
                    value={form.currentStatus}
                    onChange={handleChange('currentStatus')}
                    className="audit-input"
                  >
                    <option value="Currently have a contractor — want an objective cleanliness score">
                      Have a cleaner — want an objective quality check
                    </option>
                    <option value="Looking to replace current cleaning company">
                      Unhappy with current company — looking to switch
                    </option>
                    <option value="New facility / No current contractor">
                      New location / First time hiring cleaners
                    </option>
                  </select>
                </div>
              </div>

              <div className="audit-form-grid-3">
                <div>
                  <label className="audit-label">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={form.contactName}
                    onChange={handleChange('contactName')}
                    className="audit-input"
                  />
                </div>
                <div>
                  <label className="audit-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    className="audit-input"
                  />
                </div>
                <div>
                  <label className="audit-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(415) 555-0199"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    className="audit-input"
                  />
                </div>
              </div>

              <div className="audit-form-grid">
                <div>
                  <label className="audit-label">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, San Jose, Oakland, Palo Alto"
                    value={form.city}
                    onChange={handleChange('city')}
                    className="audit-input"
                  />
                </div>
                <div>
                  <label className="audit-label">Preferred Walkthrough Date</label>
                  <input
                    type="date"
                    value={form.preferredDate}
                    onChange={handleChange('preferredDate')}
                    className="audit-input"
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="audit-label">Specific Areas of Concern (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bathrooms always smell, trash skipped on Thursdays, dust on conference room blinds..."
                  value={form.notes}
                  onChange={handleChange('notes')}
                  className="audit-input"
                />
              </div>

              {/* Security Captcha Challenge */}
              <CaptchaChallenge
                onVerify={setCaptchaData}
                error={captchaError}
              />

              <div className="audit-submit-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-blue audit-submit-btn"
                >
                  {loading ? 'Submitting Request...' : 'Get My Free Cleanliness Score & Walkthrough →'}
                </button>
                <div className="audit-privacy-notice">
                  🔒 Confidential &amp; Zero Obligation. We will never contact or notify your existing contractor.
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="audit-success-state">
            <div className="audit-success-icon">✓</div>
            <h3>Walkthrough &amp; Cleanliness Audit Requested!</h3>
            <p className="audit-success-text">
              Thank you, <strong>{form.contactName}</strong>. We've received your audit request for <strong>{form.businessName || 'your facility'}</strong>.
            </p>
            <div className="audit-success-card">
              <h4>What Happens Next:</h4>
              <ol>
                <li>Our senior facility manager will call/email you within <strong>2 business hours</strong> to confirm your walkthrough time.</li>
                <li>We conduct the 15-minute on-site inspection and ATP surface test with zero disruption to your team.</li>
                <li>You receive a digital <strong>15-Point Cleanliness &amp; Safety Report Card</strong> with rate comparison.</li>
              </ol>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="btn btn-blue"
              style={{ marginTop: 20 }}
            >
              Done / Return to Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
