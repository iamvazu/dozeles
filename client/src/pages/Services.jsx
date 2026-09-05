import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Seo from '../seo.jsx';
import { PageBanner } from '../components/Shared.jsx';
import { CtaStrip, WhyDozeles } from '../components/Pseo.jsx';
import { SERVICES } from '../data/services.js';
import { CITIES } from '../data/cities.js';

export default function Services() {
  return (
    <>
      <Seo
        title="Professional Cleaners & Cleaning Services | Commercial Janitorial & House Cleaning — Dozeles"
        description="Looking for trusted cleaners near me? Explore all Dozeles Professional Cleaning services: commercial cleaners, janitorial services, office cleaning, residential house cleaning, move-out, and post-construction across Northern California."
        keywords={[
          'cleaners',
          'cleaning services',
          'cleaners near me',
          'janitorial services',
          'commercial cleaners',
          'office cleaning services',
          'residential cleaning services',
          'move out cleaners',
          'post construction cleaning',
          'government facility cleaning',
          'bay area cleaners',
        ]}
        path="/services-offered"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services-offered' },
        ]}
      />
      <PageBanner title="Our Services" crumb="Services" />

      <section>
        <div className="container">
          <div className="center" style={{ marginBottom: 44 }}>
            <div className="eyebrow">Complete Coverage</div>
            <h2 className="h2">Nine Specialized Cleaning Services &amp; Janitorial Lines</h2>
            <p className="lead">
              Looking for reliable <strong>cleaners near me</strong>? Dozeles Professional Cleaning delivers premier{' '}
              <Link to="/services/commercial-cleaning" style={{ color: 'var(--blue)', fontWeight: 600 }}>commercial cleaning services</Link>, comprehensive{' '}
              <Link to="/services/janitorial-services" style={{ color: 'var(--blue)', fontWeight: 600 }}>janitorial programs</Link>, and residential{' '}
              <Link to="/services/residential-cleaning" style={{ color: 'var(--blue)', fontWeight: 600 }}>house cleaners</Link> across {CITIES.length}+ cities in the Bay Area.
              Every service is eco-friendly, fully licensed, bonded, and backed by our free re-clean guarantee.
            </p>
          </div>
          <div className="grid grid-3">
            {SERVICES.map((s) => (
              <Link className="card" key={s.slug} to={`/services/${s.slug}`}>
                <div className="icon"><Icon name={s.icon} /></div>
                <h3>{s.title}</h3>
                <p>{s.tagline}</p>
                <div className="go">Explore {s.short} Cleaners →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WhyDozeles city="Northern California" />

      <section className="section-alt">
        <div className="container">
          <h3 className="h3">Find Your Service By City</h3>
          <p className="lead" style={{ marginBottom: 26 }}>
            Every service is available across our full Northern California territory.
          </p>
          <div className="chip-row">
            {CITIES.map((c) => (
              <Link className="chip" key={c.slug} to={`/cleaning-services/${c.slug}`}>{c.name}</Link>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
