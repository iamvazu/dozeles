import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../seo.jsx';
import Icon from '../components/Icon.jsx';
import { PageBanner, Testimonials } from '../components/Shared.jsx';
import { FaqSection, CtaStrip } from '../components/Pseo.jsx';

// ---- Pricing psychology applied ----
// 1. ANCHORING: highest tier shown alongside so the middle looks reasonable
// 2. CENTER-STAGE + DECOY: "Most Popular" middle tier is the target
// 3. CHARM PRICING: $189 / $149 not $190 / $150
// 4. LOSS AVERSION: strike-through "first clean" pricing
// 5. RISK REVERSAL: guarantee block directly under the cards
// 6. CHOICE ARCHITECTURE: only 3 options per tab, never more

const RESIDENTIAL = [
  {
    plan: 'Essential',
    tagline: 'Maintenance cleaning for tidy homes that just need a regular reset.',
    amount: 149,
    was: 199,
    per: 'per visit · monthly service',
    features: [
      'Kitchen & bathroom cleaning',
      'All floors vacuumed & mopped',
      'Dusting of surfaces & fixtures',
      'Trash & recycling removal',
      'Eco-friendly products included',
    ],
    missing: ['Interior windows', 'Inside oven & fridge', 'Priority scheduling'],
    cta: 'Book Essential',
  },
  {
    plan: 'Complete',
    featured: true,
    badge: 'Most Popular',
    tagline: 'Our biweekly flagship — the plan 7 out of 10 clients choose.',
    amount: 189,
    was: 249,
    per: 'per visit · biweekly service',
    features: [
      'Everything in Essential',
      'Baseboards, door frames & switches',
      'Interior glass & mirrors',
      'Bed making & light tidying',
      'Same cleaning team every visit',
      'Free re-clean guarantee',
      'Priority scheduling window',
    ],
    missing: [],
    cta: 'Book Complete',
  },
  {
    plan: 'Signature',
    tagline: 'Weekly white-glove service for larger and high-traffic homes.',
    amount: 279,
    was: 349,
    per: 'per visit · weekly service',
    features: [
      'Everything in Complete',
      'Inside oven & refrigerator',
      'Interior windows & tracks',
      'Cabinet fronts & organization',
      'Laundry & linen service',
      'Dedicated account manager',
      'Same-day support line',
    ],
    missing: [],
    cta: 'Book Signature',
  },
];

const COMMERCIAL = [
  {
    plan: 'Office Standard',
    tagline: 'For professional offices under 5,000 sq ft on a light schedule.',
    amount: 0.09,
    unit: 'sq ft / visit',
    per: 'typical: $650–$1,100 / month',
    features: [
      'Restroom cleaning & restocking',
      'Trash, recycling & compost',
      'Vacuuming & hard-floor mopping',
      'Break room & kitchen cleaning',
      'Green-certified products',
    ],
    missing: ['Floor finish program', 'Disinfection add-on', 'Dedicated supervisor'],
    cta: 'Request Quote',
  },
  {
    plan: 'Janitorial Pro',
    featured: true,
    badge: 'Best Value',
    tagline: 'Nightly janitorial for offices, retail, and multi-tenant buildings.',
    amount: 0.13,
    unit: 'sq ft / visit',
    per: 'typical: $1,200–$2,600 / month',
    features: [
      'Everything in Office Standard',
      'Nightly or 3–5x weekly service',
      'High-touch disinfection program',
      'Hard-floor buffing & maintenance',
      'Carpet extraction (quarterly)',
      'Documented QC inspections',
      'Consumable supply management',
      'Free re-clean guarantee',
    ],
    missing: [],
    cta: 'Request Quote',
  },
  {
    plan: 'Facility Complete',
    tagline: 'Full-facility programs for large, regulated, or public buildings.',
    amount: 0.18,
    unit: 'sq ft / visit',
    per: 'typical: $3,000+ / month',
    features: [
      'Everything in Janitorial Pro',
      'Daily service, 7 days available',
      'Strip, wax & seal floor program',
      'Electrostatic disinfection',
      'Background-checked, badged crews',
      'Compliance & audit reporting',
      'Dedicated account manager',
      'Emergency response coverage',
    ],
    missing: [],
    cta: 'Request Quote',
  },
];

const ONE_TIME = [
  { name: 'Deep Clean (first visit)', price: 'from $289', note: 'Recommended before starting recurring service' },
  { name: 'Move-In / Move-Out Clean', price: '$280 – $650', note: 'Deposit-back guarantee included' },
  { name: 'Post-Construction Final Clean', price: '$0.30 – $0.75 / sq ft', note: 'Rough, final, and touch-up phases' },
  { name: 'Airbnb / Rental Turnover', price: '$110 – $260', note: 'Photo verification on every turnover' },
  { name: 'Disinfection Treatment', price: '$0.10 – $0.25 / sq ft', note: 'EPA-registered, electrostatic application' },
  { name: 'Carpet Hot-Water Extraction', price: 'from $0.25 / sq ft', note: 'Add-on or standalone service' },
];

const PRICING_FAQS = [
  {
    q: 'Why do you quote a flat rate instead of hourly?',
    a: 'Hourly pricing rewards slow work and punishes you when a crew hits an unexpected problem. Flat-rate pricing means we absorb that risk instead of you. After a free walkthrough we give you a fixed number, and that number does not change unless you change the scope.',
  },
  {
    q: 'Is there a contract or minimum commitment?',
    a: 'No long-term contract. Residential plans are cancelable anytime with 48 hours notice. Commercial janitorial agreements are month-to-month — most of our clients have stayed for years, but never because they were locked in.',
  },
  {
    q: 'Why is weekly service cheaper per visit than monthly?',
    a: 'Less accumulates between visits, so each cleaning takes less time. A monthly clean is closer to a light deep clean, which costs more per visit. If budget matters, more frequent service is usually better value per dollar than less frequent service.',
  },
  {
    q: 'Do you charge extra for cleaning supplies and equipment?',
    a: 'Never. All labor, green-certified products, and HEPA-filtered equipment are included in every quoted price. For commercial accounts we can also manage your consumables — paper, soap, liners — at cost plus a small handling fee, which most clients find cheaper than ordering themselves.',
  },
  {
    q: 'What if I am not satisfied with a cleaning?',
    a: 'Tell us within 24 hours and we return to re-clean the area at no charge. That guarantee applies to every plan, every service line, and every visit. We would rather fix it than lose you over something that takes us an hour to correct.',
  },
  {
    q: 'Do you offer discounts for multiple properties or locations?',
    a: 'Yes. Portfolio pricing is available for property managers, multi-location businesses, and hosts with several short-term rentals. Savings typically run 10–20% versus per-property pricing depending on route density. Call 650-290-0280 and we will build a portfolio quote.',
  },
];

export default function Pricing() {
  const [tab, setTab] = useState('residential');
  const plans = tab === 'residential' ? RESIDENTIAL : COMMERCIAL;

  return (
    <>
      <Seo
        title="Cleaning Service Pricing | House & Commercial Cleaning Rates — Dozeles"
        description="Transparent cleaning service pricing for the Bay Area & Northern California. House cleaning from $149/visit, commercial janitorial from $0.09/sq ft. No contracts, free quotes, satisfaction guaranteed."
        keywords={[
          'cleaning service prices',
          'house cleaning cost bay area',
          'commercial cleaning rates',
          'janitorial services pricing',
          'office cleaning cost per square foot',
          'maid service prices northern california',
          'how much does cleaning cost',
        ]}
        path="/pricing"
        faqs={PRICING_FAQS}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ]}
      />
      <PageBanner title="Pricing" crumb="Pricing" />

      <section>
        <div className="container">
          <div className="center" style={{ marginBottom: 34 }}>
            <div className="eyebrow">Transparent Pricing</div>
            <h2 className="h2">Straightforward Rates. No Surprises.</h2>
            <p className="lead">
              Every quote is fixed and written after a free walkthrough. No hourly billing, no
              contracts, no charge for supplies or equipment — and a free re-clean if we miss
              something.
            </p>
          </div>

          <div className="admin-tabs" style={{ justifyContent: 'center', marginBottom: 40 }}>
            <button className={tab === 'residential' ? 'on' : ''} onClick={() => setTab('residential')}>
              Residential
            </button>
            <button className={tab === 'commercial' ? 'on' : ''} onClick={() => setTab('commercial')}>
              Commercial &amp; Janitorial
            </button>
          </div>

          <div className="price-grid">
            {plans.map((p) => (
              <div className={`price-card ${p.featured ? 'featured' : ''}`} key={p.plan}>
                {p.badge && <span className="badge-pop">{p.badge}</span>}
                <div className="plan">{p.plan}</div>
                <div className="tagline">{p.tagline}</div>
                <div className="amount">
                  {p.was && <span className="strike">${p.was}</span>}$
                  {p.amount}
                  {p.unit && <small> / {p.unit}</small>}
                </div>
                <div className="per">{p.per}</div>
                <ul>
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                  {p.missing?.map((f) => <li className="dim" key={f}>{f}</li>)}
                </ul>
                <Link to="/book" className={`btn ${p.featured ? 'btn-blue' : 'btn-outline'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="guarantee">
            <span className="icon"><Icon name="shield" size={38} /></span>
            <div>
              <strong style={{ color: 'var(--ink)', fontSize: '1.05rem' }}>
                The Dozeles Guarantee — zero risk to try us
              </strong>
              <p style={{ color: 'var(--muted)', fontSize: '0.94rem', marginTop: 4 }}>
                If you are not completely satisfied, tell us within 24 hours and we re-clean the
                area free. No contract, cancel anytime, and your first visit is discounted while
                you decide whether we are worth keeping. Over 20 years, we have kept the vast
                majority of clients who tried us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">One-Time Services</div>
            <h2 className="h2">Project & Specialty Pricing</h2>
            <p className="lead">
              Not every job is recurring. These are our typical ranges for one-time work — all
              quoted flat rate after a walkthrough or a few photos.
            </p>
          </div>
          <table className="table">
            <thead>
              <tr><th>Service</th><th>Typical Price</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {ONE_TIME.map((r) => (
                <tr key={r.name}>
                  <td><strong>{r.name}</strong></td>
                  <td style={{ color: 'var(--blue)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.price}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 18, fontSize: '0.9rem', color: 'var(--muted)' }}>
            Prices reflect typical Bay Area and Northern California ranges and vary with square
            footage, condition, and access. Your written quote is fixed before any work begins.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">What Drives Your Price</div>
            <h2 className="h2">How We Build Your Quote</h2>
          </div>
          <div className="grid grid-4">
            {[
              { icon: 'home', t: 'Square Footage', d: 'The single biggest factor. Larger spaces take longer and need more crew.' },
              { icon: 'clock', t: 'Frequency', d: 'More frequent service costs less per visit because less accumulates between cleans.' },
              { icon: 'sliders', t: 'Scope & Add-Ons', d: 'Inside appliances, windows, floor finish programs, and disinfection each add scope.' },
              { icon: 'badge', t: 'Condition', d: 'A first deep clean prices higher than ongoing maintenance of an already-clean space.' },
            ].map((c) => (
              <div className="card" key={c.t}>
                <div className="icon"><Icon name={c.icon} /></div>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials heading="Clients Who Decided We Were Worth It" />
      <FaqSection faqs={PRICING_FAQS} heading="Pricing FAQs" />
      <CtaStrip />
    </>
  );
}
