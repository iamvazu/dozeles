import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { CITIES } from '../data/cities.js';
import { SERVICES } from '../data/services.js';

// Replace {city} tokens in templated copy
export const fill = (str, city) => (str || '').replaceAll('{city}', city || 'the Bay Area');

export function CrumbStrip({ items }) {
  return (
    <div className="crumb-strip">
      <div className="container">
        {items.map((it, i) => (
          <span key={it.path}>
            {i > 0 && ' / '}
            {i === items.length - 1 ? <span>{it.name}</span> : <Link to={it.path}>{it.name}</Link>}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PseoHero({ h1, sub, image, city }) {
  return (
    <div
      className="banner"
      style={{
        backgroundImage: `linear-gradient(rgba(10,37,64,0.84), rgba(10,37,64,0.84)), url('${image}')`,
      }}
    >
      <div className="container">
        <h1>{h1}</h1>
        <p style={{ color: '#dbe7f3', maxWidth: 720, marginTop: 14, fontSize: '1.05rem' }}>{sub}</p>
        <div style={{ marginTop: 26 }}>
          <Link to="/book" className="btn btn-blue">Get a Free Quote</Link>
          <a href="tel:6502900280" className="btn btn-white" style={{ marginLeft: 12 }}>
            Call 650-290-0280
          </a>
        </div>
        {city && (
          <div className="hero-badges" style={{ marginTop: 30 }}>
            <span>Serving {city}</span>
            <span>Licensed &amp; Insured</span>
            <span>20+ Years Experience</span>
            <span>Free On-Site Quote</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function IncludesGrid({ items, heading, sub }) {
  return (
    <section>
      <div className="container">
        <div className="center" style={{ marginBottom: 40 }}>
          <div className="eyebrow">Scope of Work</div>
          <h2 className="h2">{heading}</h2>
          {sub && <p className="lead">{sub}</p>}
        </div>
        <ul className="checklist two-col">
          {items.map((i) => <li key={i}>{i}</li>)}
        </ul>
      </div>
    </section>
  );
}

export function IndustriesGrid({ items, heading }) {
  return (
    <section className="section-alt">
      <div className="container">
        <div className="center" style={{ marginBottom: 40 }}>
          <div className="eyebrow">Who We Serve</div>
          <h2 className="h2">{heading}</h2>
        </div>
        <div className="chip-row" style={{ justifyContent: 'center' }}>
          {items.map((i) => <span className="chip" key={i}>{i}</span>)}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ faqs, city, heading = 'Frequently Asked Questions' }) {
  return (
    <section>
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="center" style={{ marginBottom: 40 }}>
          <div className="eyebrow">Answers</div>
          <h2 className="h2">{heading}</h2>
        </div>
        {faqs.map((f) => (
          <details className="faq-item" key={f.q}>
            <summary>{fill(f.q, city)}</summary>
            <div>{fill(f.a, city)}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function WhyDozeles({ city }) {
  const points = [
    { icon: 'badge', title: '20+ Years in Northern California', text: `Two decades cleaning ${city || 'Bay Area'} buildings means we have already solved whatever your facility is dealing with.` },
    { icon: 'shield', title: 'Licensed, Bonded & Insured', text: 'Certificates of insurance provided before we start, with your business named as additional insured.' },
    { icon: 'leaf', title: 'Green-Certified & HEPA Equipped', text: 'Eco-friendly products and HEPA filtration capturing 99.97% of airborne particles — safer for staff, families, and pets.' },
    { icon: 'clock', title: 'On Schedule, Every Time', text: 'Consistent crews, cross-trained backup staff, and same-day response when something needs attention.' },
    { icon: 'sparkles', title: 'Documented Quality Control', text: 'Supervisor walkthroughs and written inspection reports, not a promise that the work got done.' },
    { icon: 'sliders', title: '100% Satisfaction Guarantee', text: 'Flag an issue within 24 hours and we re-clean the area at no charge. No arguments, no invoices.' },
  ];
  return (
    <section className="section-cream">
      <div className="container">
        <div className="center" style={{ marginBottom: 40 }}>
          <div className="eyebrow">Why Dozeles Professional Cleaning</div>
          <h2 className="h2">Why {city || 'Northern California'} Chooses Dozeles Professional Cleaning</h2>
        </div>
        <div className="grid grid-3">
          {points.map((p) => (
            <div className="card" key={p.title}>
              <div className="icon"><Icon name={p.icon} /></div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaStrip({ city, service }) {
  return (
    <div className="cta-band">
      <div className="container">
        <h2>
          Get Your Free {service || 'Cleaning'} Quote{city ? ` in ${city}` : ''}
        </h2>
        <p style={{ maxWidth: 620, margin: '0 auto 26px', color: '#dbe7f3' }}>
          Free on-site walkthrough, fixed written pricing, and no long-term contract required.
          Most quotes are returned within one business day.
        </p>
        <Link to="/book" className="btn btn-white">Request My Quote</Link>
        <a href="tel:6502900280" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff', marginLeft: 12 }}>
          Call 650-290-0280
        </a>
      </div>
    </div>
  );
}

/** Internal link mesh — critical for PSEO crawl depth */
export function LinkMesh({ service, city, limit = 24 }) {
  const cityList = CITIES.slice(0, limit);
  return (
    <section className="section-alt">
      <div className="container">
        {service && (
          <>
            <h3 className="h3">{service.short} By City</h3>
            <div className="link-mesh" style={{ marginBottom: 40 }}>
              {cityList.map((c) => (
                <Link key={c.slug} to={`/services/${service.slug}/${c.slug}`}>
                  {service.short} in {c.name}
                </Link>
              ))}
            </div>
          </>
        )}
        {city && (
          <>
            <h3 className="h3">All Services in {city.name}</h3>
            <div className="link-mesh" style={{ marginBottom: 40 }}>
              {SERVICES.map((s) => (
                <Link key={s.slug} to={`/services/${s.slug}/${city.slug}`}>
                  {s.short} in {city.name}
                </Link>
              ))}
            </div>
            {city.neighbors?.length > 0 && (
              <>
                <h3 className="h3">Nearby Service Areas</h3>
                <div className="chip-row">
                  {city.neighbors
                    .map((n) => CITIES.find((c) => c.slug === n))
                    .filter(Boolean)
                    .map((n) => (
                      <Link className="chip" key={n.slug} to={`/cleaning-services/${n.slug}`}>
                        {n.name}
                      </Link>
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
