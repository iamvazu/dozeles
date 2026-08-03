import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import ReviewsShowcase from '../components/ReviewsShowcase.jsx';
import PriceCalculator from '../components/PriceCalculator.jsx';
import Seo from '../seo.jsx';
import { CountUp } from '../components/Shared.jsx';
import { api } from '../api.js';
import { SERVICES, FEATURED } from '../data/services.js';
import { CITIES, citiesByRegion } from '../data/cities.js';

const HOME_FAQS = [
  {
    q: "What's included in a cleaning?",
    a: 'Every Dozeles cleaning follows a written room-by-room checklist. For homes that means kitchens, bathrooms, bedrooms, and living areas — surfaces, floors, fixtures, baseboards, and high-touch points. For commercial and janitorial contracts it means restrooms, trash and recycling, floor care, break rooms, glass, and disinfection of shared surfaces. You get the checklist before we start, so nothing is ambiguous.',
  },
  {
    q: 'How much does cleaning cost in the Bay Area?',
    a: 'Residential house cleaning starts at $149 per visit and typically runs $149–$329 depending on size, frequency, and scope. Commercial janitorial is contracted monthly at roughly $0.10–$0.45 per square foot per month. Move-out and deep cleans run $280–$650. Use the calculator on our pricing page for an instant estimate — every quote is then fixed in writing after a free walkthrough.',
  },
  {
    q: 'Are cleaning supplies and equipment included?',
    a: 'Always, at no extra charge. We bring green-certified, low-VOC products and HEPA-filtered equipment that captures 99.97% of airborne particles. If you would prefer we use your own supplies, just tell us and we will.',
  },
  {
    q: 'What areas of Northern California do you serve?',
    a: `Dozeles serves ${CITIES.length}+ cities across the San Francisco Bay Area, East Bay, North Bay, Sacramento Valley, and Central Valley — including San Francisco, Oakland, San Jose, Daly City, Fremont, Walnut Creek, San Rafael, Santa Rosa, Napa, and Sacramento.`,
  },
  {
    q: 'Are your cleaners background-checked and insured?',
    a: 'Yes. Dozeles is licensed, bonded, and insured with general liability and workers compensation coverage, and we are a women-certified business enterprise. Every crew member is background-checked before their first shift. Certificates of insurance are provided before work begins.',
  },
  {
    q: 'What times do you offer cleaning services?',
    a: 'We clean Monday through Saturday, 9am to 6pm for residential work. Commercial and janitorial accounts are mostly serviced after hours — evenings, overnight, or early morning — so your team never works around a crew. Weekend and holiday coverage is available on most contracts.',
  },
];

const STEPS = [
  { n: 'Step 1', icon: 'calendar', title: 'Free quote', text: 'Tell us about your space and choose the date you want. Free walkthrough, fixed written pricing, no obligation.' },
  { n: 'Step 2', icon: 'spray', title: 'We clean', text: 'Our vetted, background-checked crew arrives on schedule with all equipment and green-certified supplies.' },
  { n: 'Step 3', icon: 'smile', title: 'You relax', text: 'Sit back and enjoy how amazing your space looks. If anything is missed, we fix it free within 24 hours.' },
];

function StepArrow() {
  return (
    <div className="hiw-arrow" aria-hidden="true">
      <svg viewBox="0 0 60 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path className="dash" d="M2 11h48" />
        <path d="M44 5l6 6-6 6" />
      </svg>
    </div>
  );
}

const WHY = [
  { icon: 'badge', title: 'Free Quote & Fixed Pricing', text: 'Get a written, flat-rate quote after a free walkthrough. No hourly billing, no surprise line items.' },
  { icon: 'leaf', title: 'Equipment & Supplies Provided', text: 'Green-certified products and HEPA-filtered equipment included in every job at no extra cost.' },
  { icon: 'shield', title: '100% Satisfaction Guarantee', text: "If you're not happy, we return and re-clean the missed areas free — no arguments, no invoice." },
  { icon: 'sparkles', title: 'Vetted & Background-Checked Crews', text: 'Every cleaner is background-checked, insured, and trained before setting foot in your space.' },
];

const BLOG = [
  { tag: 'Commercial', title: 'How Often Should Your Office Actually Be Cleaned?', img: '/images/office_cleaning.png', excerpt: 'Foot traffic, headcount, and floor type matter more than square footage. Here is how we scope frequency.' },
  { tag: 'Eco-Friendly', title: 'Why HEPA Filtration Changes Indoor Air Quality', img: '/images/commercial_cleaning.png', excerpt: 'Standard vacuums recirculate fine particles. HEPA captures 99.97% of them — here is what that means for your team.' },
  { tag: 'Move-Out', title: 'The Move-Out Checklist Landlords Actually Inspect', img: '/images/residential_cleaning.png', excerpt: 'Inside appliances, window tracks, and baseboards decide your deposit. Standard cleaning skips all three.' },
];

function QuoteFormPanel() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', sqft: '', service: '', message: '' });
  const [state, setState] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState(null);
    try {
      await api.post('/api/contact', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `Service: ${form.service || 'Not specified'}\nSquare footage: ${form.sqft || 'Not specified'}\n\n${form.message}`,
      });
      setState({ ok: true, msg: "Thank you! We've received your request and will send your quote within one business day." });
      setForm({ name: '', email: '', phone: '', sqft: '', service: '', message: '' });
    } catch (err) {
      setState({ ok: false, msg: err.message });
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row">
        <input placeholder="Your name" value={form.name} onChange={set('name')} required />
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
      </div>
      <div className="form-row">
        <input placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <input placeholder="Total square footage" value={form.sqft} onChange={set('sqft')} />
      </div>
      <select value={form.service} onChange={set('service')} required>
        <option value="">Choose a service</option>
        {SERVICES.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
      </select>
      <textarea placeholder="Anything else we should know?" value={form.message} onChange={set('message')} />
      <p className="gdpr">
        By submitting this form you agree to be contacted about your quote. We never sell or share
        your information.
      </p>
      <button className="btn btn-white" type="submit">I'd Like a Quote</button>
      {state && <div className={`form-note ${state.ok ? 'ok' : 'err'}`}>{state.msg}</div>}
    </form>
  );
}

export default function Home() {
  const { site, stats } = useContent();
  const featured = FEATURED;
  const groups = citiesByRegion();

  return (
    <>
      <Seo
        title="Commercial & Residential Janitorial Services Bay Area | Dozeles Cleaning"
        description="Top-rated commercial janitorial and residential cleaning services across the San Francisco Bay Area and Northern California. Office cleaning, house cleaning, move-out, post-construction & government facilities. Licensed, insured, eco-friendly. Free quote."
        keywords={[
          'commercial janitorial services bay area',
          'residential cleaning services bay area',
          'janitorial services northern california',
          'commercial cleaning company san francisco',
          'office cleaning bay area',
          'house cleaning services norcal',
          'best janitorial company california',
          'eco friendly cleaning services bay area',
          'cleaning services near me',
        ]}
        path="/"
        faqs={HOME_FAQS}
        breadcrumbs={[{ name: 'Home', path: '/' }]}
        serviceName="Commercial and Residential Janitorial Services"
      />

      {/* ---------- HERO ---------- */}
      <div className="chero">
        <div className="container chero-grid">
          <div>
            <h1>
              Sparkling <span className="accent">Residential &amp; Commercial</span> Cleaning Services
            </h1>
            <p className="sub">
              Stop spending your evenings and weekends cleaning. Dozeles has kept Bay Area homes,
              offices, and public buildings spotless for over 20 years — eco-friendly, insured, and
              guaranteed.
            </p>
            <div className="chero-cta">
              <Link to="/book" className="btn btn-blue">Free Quote</Link>
              <Link to="/services-offered" className="btn btn-outline">Our Services</Link>
            </div>
            <div className="pill-row">
              <span className="pill-feat"><Icon name="badge" size={17} /> Professional</span>
              <span className="pill-feat"><Icon name="sparkles" size={17} /> Eco-Friendly</span>
              <span className="pill-feat"><Icon name="clock" size={17} /> Convenient</span>
            </div>
            <div className="review-badge">
              <span className="score">5.0</span>
              <span>
                <span className="stars">★★★★★</span>
                <br />
                <span className="count">Rated by Bay Area clients</span>
              </span>
            </div>
          </div>
          <div className="hero-images">
            <img src="/images/hero_residential.png" alt="Professional residential cleaning in the Bay Area" />
            <img src="/images/hero_commercial.png" alt="Professional commercial cleaning services" loading="lazy" />
          </div>
        </div>
      </div>

      {/* ---------- HOW IT WORKS ---------- */}
      <section>
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 56 }}>
            <div className="eyebrow">How It Works</div>
            <h2 className="h2">Quick and Easy</h2>
            <p className="lead">Three steps from first call to a spotless space. No contracts, no runaround.</p>
          </Reveal>
          <div className="hiw">
            {STEPS.map((s, i) => (
              <Fragment key={s.title}>
                {i > 0 && (
                  <Reveal variant="scale" delay={i * 180 - 60}>
                    <StepArrow />
                  </Reveal>
                )}
                <Reveal className="hiw-step" variant="up" delay={i * 180}>
                  <div className="hiw-circle">
                    <Icon name={s.icon} />
                    <Icon name="sparkles" size={34} className="hiw-spark" />
                    <span className="hiw-num">{s.n}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </Reveal>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHO WE ARE ---------- */}
      <section className="section-alt">
        <div className="container split">
          <img src="/images/residential_cleaning.png" alt="The Dozeles cleaning team at work" loading="lazy" />
          <div className="prose">
            <div className="eyebrow">Who We Are</div>
            <h2 className="h2">The Best Option For a Sparkling Home or Office</h2>
            <p>
              Dozeles is a women-certified, family-run cleaning company serving the San Francisco Bay
              Area and Northern California for more than two decades. Our mission is simple: connect
              you with exceptional, thoroughly vetted cleaners who deliver results you can see.
            </p>
            <ul className="checklist">
              <li>We keep you updated on every cleaning — no wondering whether it happened</li>
              <li>Our cleaners treat your home and office like their own</li>
              <li>Green-certified products safe around children, pets, and staff</li>
              <li>Same crew every visit, so they learn your space and your preferences</li>
            </ul>
            <Link to="/about-us" className="btn btn-blue" style={{ marginTop: 22 }}>Learn More</Link>
          </div>
        </div>
      </section>

      {/* ---------- WHY CHOOSE US — gradient standout band ---------- */}
      <section className="why-band">
        <span className="why-blob b1" aria-hidden="true" />
        <span className="why-blob b2" aria-hidden="true" />
        <span className="why-blob b3" aria-hidden="true" />
        <Icon name="sparkles" size={44} className="why-spark s1" />
        <Icon name="sparkles" size={34} className="why-spark s2" />

        <div className="container">
          <Reveal className="center" style={{ marginBottom: 52 }}>
            <div className="eyebrow">Why Choose Us</div>
            <h2 className="h2">We're Experienced &amp; We Have Expert Teams</h2>
            <p className="lead">
              Twenty years, thousands of buildings, and a guarantee we actually honor.
            </p>
          </Reveal>

          <div className="grid grid-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 120} variant="up">
                <div className="why-card">
                  <div className="icon"><Icon name={w.icon} /></div>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="why-stats" delay={120}>
            {stats.items.map((s) => (
              <div className="s" key={s.label}>
                <div className="n"><CountUp value={s.value} /><em>+</em></div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </Reveal>

          <div className="center" style={{ marginTop: 46 }}>
            <Link to="/cleaning-process" className="btn btn-white">Our Cleaning Process</Link>
          </div>
        </div>
      </section>

      {/* ---------- SERVICES ---------- */}
      <section className="section-alt">
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 46 }}>
            <div className="eyebrow">Our Services</div>
            <h2 className="h2">Here's What We Can Do for You</h2>
            <p className="lead">
              {SERVICES.length} specialized service lines covering every commercial janitorial and
              residential cleaning need in Northern California.
            </p>
          </Reveal>
          <div className="grid grid-4">
            {featured.map((s, i) => (
              <Reveal key={s.slug} delay={i * 120} as={Link} className="svc2" to={`/services/${s.slug}`}>
                <div className="svc2-img">
                  <img src={s.cardImg || s.hero} alt={s.cardName || s.short} loading="lazy" />
                  <span className="svc2-badge"><Icon name={s.icon} size={26} /></span>
                </div>
                <h3>{s.cardName || s.short}</h3>
                <p>{s.tagline}</p>
                <span className="svc2-more">
                  Learn more <span className="cir"><Icon name="arrow" size={14} /></span>
                </span>
              </Reveal>
            ))}
          </div>
          <div className="center" style={{ marginTop: 44 }}>
            <Link to="/services-offered" className="btn btn-blue">
              View All {SERVICES.length} Services
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- INSTANT PRICE CALCULATOR ---------- */}
      <section className="calc-home" id="estimate">
        <div className="container">
          <Reveal className="center calc-home-head">
            <div className="eyebrow">Instant Pricing</div>
            <h2 className="h2">Know Your Price in 30 Seconds</h2>
            <p className="lead">
              No waiting for a callback. Choose your options and see a real estimate instantly —
              home or business. Then book in three taps.
            </p>
          </Reveal>
          <Reveal variant="up">
            <PriceCalculator />
          </Reveal>
          <div className="center" style={{ marginTop: 28 }}>
            <Link to="/pricing" className="btn btn-outline">See full pricing &amp; packages</Link>
          </div>
        </div>
      </section>

      {/* ---------- REVIEWS SHOWCASE ---------- */}
      <ReviewsShowcase />

      {/* ---------- GET A QUOTE ---------- */}
      <section className="section-alt">
        <div className="container">
          <div className="quote-panel">
            <div className="split" style={{ gap: 46 }}>
              <div>
                <div className="eyebrow">Get Your Free Estimate</div>
                <h2 className="h2">Get a Quote</h2>
                <p className="lead">
                  Tell us about your space and we'll send a fixed, written quote within one business
                  day. Free walkthrough, no obligation, and no pressure.
                </p>
                <div className="guarantee-box">
                  <Icon name="shield" size={34} />
                  <div>
                    <strong>100% Satisfaction Guarantee</strong>
                    <p>
                      Your satisfaction is our top priority. If anything is missed, tell us within
                      24 hours and we return to re-clean it free.
                    </p>
                  </div>
                </div>
              </div>
              <QuoteFormPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section>
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 46 }}>
            <div className="eyebrow">FAQs</div>
            <h2 className="h2">Frequently Asked Questions</h2>
          </Reveal>
          <div className="faq-split">
            <div className="faq-contact">
              <h3>Looking for cleaning services in the Bay Area?</h3>
              <p>Talk to a real person today — no call centers, no bots.</p>
              <a href={`tel:${site.phoneRaw}`} className="bigphone">{site.phone}</a>
              <Link to="/book" className="btn btn-white">Get a Free Quote</Link>
            </div>
            <div>
              {HOME_FAQS.map((f) => (
                <details className="faq-item" key={f.q}>
                  <summary>{f.q}</summary>
                  <div>{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SERVICE AREAS ---------- */}
      <section className="section-cream">
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">Service Areas</div>
            <h2 className="h2">Serving {CITIES.length}+ Cities Across Northern California</h2>
            <p className="lead">Bay Area, East Bay, North Bay, Sacramento Valley, and the Central Valley.</p>
          </div>
          {groups.map((g) => (
            <div key={g.region} style={{ marginBottom: 26 }}>
              <h4 style={{ marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.82rem', color: 'var(--blue)' }}>
                {g.region}
              </h4>
              <div className="chip-row">
                {g.cities.slice(0, 14).map((c) => (
                  <Link className="chip" key={c.slug} to={`/cleaning-services/${c.slug}`}>{c.name}</Link>
                ))}
              </div>
            </div>
          ))}
          <div className="center" style={{ marginTop: 32 }}>
            <Link to="/locations" className="btn btn-outline">View All Service Areas</Link>
          </div>
        </div>
      </section>

      {/* ---------- BLOG ---------- */}
      <section>
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 46 }}>
            <div className="eyebrow">From Our Blog</div>
            <h2 className="h2">Cleaning Tips From the Pros</h2>
          </Reveal>
          <div className="grid grid-3">
            {BLOG.map((b, i) => (
              <Reveal className="blog-card" key={b.title} delay={i * 110}>
                <div className="thumb"><img src={b.img} alt={b.title} loading="lazy" /></div>
                <div className="body">
                  <span className="tag">{b.tag}</span>
                  <h3>{b.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginTop: 8 }}>{b.excerpt}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CLOSING CTA ---------- */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="wow-cta">
            <h2>Our Goal Is to Wow You With Every Clean</h2>
            <Link to="/book" className="btn btn-white">Get a Free Quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}
