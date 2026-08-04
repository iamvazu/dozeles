import { Link } from 'react-router-dom';
import Seo from '../seo.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import PriceCalculator from '../components/PriceCalculator.jsx';
import { FaqSection, CtaStrip } from '../components/Pseo.jsx';
import { RES_ADDONS, COM_ADDONS, PUBLISHED } from '../data/pricing.js';

/* ---- Pricing psychology, applied ----
   1. ANCHOR: Large tier shown beside the target so the middle reads reasonable
   2. CENTER-STAGE + DECOY: middle tier enlarged and badged
   3. CHARM PRICING: 149 / 249 / 329, never round
   4. LOSS AVERSION: recurring discount shown as money left on the table
   5. RISK REVERSAL: guarantee sits directly under the cards
   6. CHOICE ARCHITECTURE: three options, never more                        */
const PACKAGES = [
  {
    plan: 'Small',
    size: '1–2 bedroom condo or apartment',
    amount: 149,
    tagline: 'A standard clean for a smaller home.',
    features: ['Kitchen & bathroom cleaning', 'All floors vacuumed & mopped', 'Dusting of surfaces & fixtures', 'Trash & recycling removal', 'Green-certified products included'],
  },
  {
    plan: 'Medium',
    featured: true,
    badge: 'Most popular',
    size: '3–4 bedroom home',
    amount: 249,
    tagline: 'Our flagship — the plan most Bay Area families choose.',
    features: ['Everything in Small', 'Baseboards, door frames & switches', 'Interior glass & mirrors', 'Bed making & light tidying', 'Same crew every visit', 'Free re-clean guarantee'],
  },
  {
    plan: 'Large',
    size: '5–6 bedroom home',
    amount: 329,
    tagline: 'For larger and higher-traffic households.',
    features: ['Everything in Medium', 'Extra crew for faster turnaround', 'Priority scheduling window', 'Dedicated account manager', 'Seasonal deep-clean reminders'],
  },
];

const RECURRING = [
  { label: 'Every week', off: '20%' },
  { label: 'Every 2 weeks', off: '15%' },
  { label: 'Every 3 weeks', off: '10%' },
];

const DRIVERS = [
  { icon: 'home', t: 'Size of the space', d: 'Bedrooms and bathrooms for homes; square footage for commercial. The single biggest factor.' },
  { icon: 'clock', t: 'How often we come', d: 'More frequent service costs less per visit — less accumulates between cleanings.' },
  { icon: 'sliders', t: 'Scope & add-ons', d: 'Inside appliances, windows, floor finish programs, and disinfection each add scope.' },
  { icon: 'badge', t: 'Starting condition', d: 'A first deep clean prices higher than ongoing maintenance of an already-clean space.' },
];

const PRICING_FAQS = [
  {
    q: 'How accurate is the price calculator?',
    a: 'It is built on the same rate card our estimators use, so for a typical property it lands within about 10% of the final written quote. What it cannot see is condition, access, and anything unusual — a home that has not been cleaned in a year, or a building with restricted-access floors. That is what the free walkthrough is for, and your written quote is fixed once we have done it.',
  },
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
    q: 'How is commercial janitorial priced?',
    a: `Commercial work is contracted monthly, not per visit. Rates in the Bay Area typically run $${PUBLISHED.comPerSqFtMonthLow} to $${PUBLISHED.comPerSqFtMonthHigh} per square foot per month depending on facility type and frequency. A 3,000 sq ft office cleaned twice a week lands around $${PUBLISHED.comExample3k}/month; a 5,000 sq ft office cleaned three nights a week runs about $${PUBLISHED.comExample5k.toLocaleString()}/month.`,
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
  return (
    <>
      <Seo
        title="Cleaning Price Calculator & Rates | House & Commercial — Dozeles Professional Cleaning"
        description={`Instant cleaning price calculator for the Bay Area & Northern California. House cleaning from $${PUBLISHED.resStandardFrom}/visit, commercial janitorial from $${PUBLISHED.comPerSqFtMonthLow}/sq ft per month. No contracts, free quotes, satisfaction guaranteed.`}
        keywords={[
          'cleaning price calculator',
          'house cleaning cost bay area',
          'commercial cleaning rates',
          'janitorial services pricing',
          'office cleaning cost per square foot',
          'maid service prices northern california',
          'how much does cleaning cost',
          'cleaning cost estimator',
        ]}
        path="/pricing"
        faqs={PRICING_FAQS}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ]}
      />

      {/* ---------- calculator hero ---------- */}
      <section className="calc-hero">
        <span className="why-blob b1" aria-hidden="true" />
        <span className="why-blob b2" aria-hidden="true" />
        <div className="container">
          <div className="center calc-hero-head">
            <div className="eyebrow">Transparent Pricing</div>
            <h1 className="h2">Know Your Price Before You Call</h1>
            <p className="lead">
              No hidden fees, no hourly billing, no waiting three days for a callback. Move the
              sliders and see a real estimate instantly — residential or commercial.
            </p>
            <div className="calc-hero-badges">
              <span><Icon name="badge" size={17} /> Transparent rates, no surprises</span>
              <span><Icon name="sliders" size={17} /> Flexible packages</span>
              <span><Icon name="sparkles" size={17} /> Custom add-ons</span>
            </div>
          </div>

          <Reveal variant="up">
            <PriceCalculator />
          </Reveal>
        </div>
      </section>

      {/* ---------- packages ---------- */}
      <section>
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 46 }}>
            <div className="eyebrow">Packages</div>
            <h2 className="h2">Get the Cleanliness You Deserve at a Price You'll Love</h2>
            <p className="lead">
              Prefer a simple package? These are our standard residential visits. Recurring clients
              save up to 20% on every single one.
            </p>
          </Reveal>

          <div className="price-grid">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.plan} delay={i * 110}>
                <div className={`price-card ${p.featured ? 'featured' : ''}`}>
                  {p.badge && <span className="badge-pop">{p.badge}</span>}
                  <div className="plan">{p.plan}</div>
                  <div className="tagline">{p.tagline}</div>
                  <div className="amount">${p.amount}</div>
                  <div className="per">per visit · {p.size}</div>
                  <ul>
                    {p.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <div className="recur-box">
                    <strong>Recurring customers save</strong>
                    {RECURRING.map((r) => (
                      <span key={r.label}>{r.label} <em>−{r.off}</em></span>
                    ))}
                  </div>
                  <Link to="/book" className={`btn ${p.featured ? 'btn-blue' : 'btn-outline'}`}>
                    Book {p.plan}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="guarantee">
            <span className="icon"><Icon name="shield" size={38} /></span>
            <div>
              <strong style={{ color: 'var(--ink)', fontSize: '1.05rem' }}>
                The Dozeles Professional Cleaning guarantee — zero risk to try us
              </strong>
              <p style={{ color: 'var(--muted)', fontSize: '0.94rem', marginTop: 4 }}>
                Not completely satisfied? Tell us within 24 hours and we re-clean the area free. No
                contract, cancel anytime. Over 20 years, the vast majority of clients who tried us
                stayed with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- add-ons ---------- */}
      <section className="why-band">
        <span className="why-blob b1" aria-hidden="true" />
        <span className="why-blob b2" aria-hidden="true" />
        <Icon name="sparkles" size={42} className="why-spark s1" />
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 46 }}>
            <div className="eyebrow">Add-on Services</div>
            <h2 className="h2">Add-ons for a Deeper Clean</h2>
            <p className="lead">
              Our service goes beyond a basic clean. Before each visit you can choose the add-ons
              that make your life simpler — priced upfront, never upsold at the door.
            </p>
          </Reveal>

          <h4 style={{ color: '#9FC8FF', textTransform: 'uppercase', letterSpacing: 1.6, fontSize: '0.78rem', marginBottom: 16 }}>
            Residential
          </h4>
          <div className="addon-grid" style={{ marginBottom: 40 }}>
            {RES_ADDONS.map((a, i) => (
              <Reveal key={a.id} delay={(i % 4) * 80}>
                <div className="addon-card">
                  <span className="ai"><Icon name={a.icon} size={20} /></span>
                  <strong>${a.price} extra</strong>
                  <span>{a.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <h4 style={{ color: '#9FC8FF', textTransform: 'uppercase', letterSpacing: 1.6, fontSize: '0.78rem', marginBottom: 16 }}>
            Commercial programs
          </h4>
          <div className="addon-grid">
            {COM_ADDONS.map((a, i) => (
              <Reveal key={a.id} delay={(i % 4) * 80}>
                <div className="addon-card">
                  <span className="ai"><Icon name={a.icon} size={20} /></span>
                  <strong>{a.unit === 'flat' ? `$${a.price}/mo` : `$${a.price} / ft²`}</strong>
                  <span>{a.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- price drivers ---------- */}
      <section>
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 46 }}>
            <div className="eyebrow">What Drives Your Price</div>
            <h2 className="h2">How We Build Your Quote</h2>
          </Reveal>
          <div className="grid grid-4">
            {DRIVERS.map((c, i) => (
              <Reveal key={c.t} delay={i * 110}>
                <div className="card">
                  <div className="icon"><Icon name={c.icon} /></div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FaqSection faqs={PRICING_FAQS} heading="Pricing FAQs" />
      <CtaStrip />
    </>
  );
}
