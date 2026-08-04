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
        title="Cleaning Services | Commercial Janitorial & Residential — Dozeles Professional Cleaning"
        description="Explore all Dozeles Professional Cleaning services: commercial cleaning, janitorial, office cleaning, residential house cleaning, move-out, post-construction, government facilities, Airbnb turnover, and disinfection. Bay Area & Northern California."
        keywords={[
          'commercial cleaning services',
          'janitorial services',
          'office cleaning services',
          'residential cleaning services',
          'move out cleaning',
          'post construction cleaning',
          'government facility cleaning',
          'airbnb cleaning service',
          'disinfection services',
          'cleaning services bay area',
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
            <h2 className="h2">Nine Specialized Cleaning Service Lines</h2>
            <p className="lead">
              Dozeles Professional Cleaning provides commercial janitorial, office cleaning, residential house cleaning,
              and specialty services across {CITIES.length}+ cities in the San Francisco Bay Area
              and Northern California. Every service uses green-certified products, HEPA-filtered
              equipment, licensed and insured crews, and carries our free re-clean guarantee.
            </p>
          </div>
          <div className="grid grid-3">
            {SERVICES.map((s) => (
              <Link className="card" key={s.slug} to={`/services/${s.slug}`}>
                <div className="icon"><Icon name={s.icon} /></div>
                <h3>{s.title}</h3>
                <p>{s.tagline}</p>
                <div className="go">View {s.short} →</div>
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
