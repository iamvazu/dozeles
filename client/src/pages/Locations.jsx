import { Link } from 'react-router-dom';
import { citiesByRegion, CITIES } from '../data/cities.js';
import { SERVICES } from '../data/services.js';
import Seo from '../seo.jsx';
import { PageBanner, CtaBand } from '../components/Shared.jsx';

export default function Locations() {
  const groups = citiesByRegion();
  return (
    <>
      <Seo
        title="Find Cleaners Near Me | Cleaning Services Across Northern California — Dozeles"
        description={`Find local cleaners near me in ${CITIES.length}+ cities across Northern California. Dozeles Professional Cleaning provides commercial cleaners, janitorial services, and residential house cleaning across the Bay Area.`}
        keywords={[
          'cleaners near me',
          'cleaners',
          'cleaning services',
          'janitorial services',
          'bay area cleaners',
          'northern california janitorial services',
          'commercial cleaners bay area',
          'residential cleaners norcal',
          'east bay janitorial company',
          'sacramento cleaning services',
        ]}
        path="/locations"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Locations', path: '/locations' },
        ]}
      />
      <PageBanner title="Service Areas &amp; Locations" crumb="Locations" />

      <section>
        <div className="container">
          <div className="center" style={{ marginBottom: 44 }}>
            <div className="eyebrow">Local Coverage</div>
            <h2 className="h2">Find Professional Cleaners &amp; Janitorial Services Near You</h2>
            <p className="lead">
              Searching for top-rated <strong>cleaners near me</strong>? From San Francisco to Sacramento, Napa to San Jose — Dozeles Professional Cleaning crews cover the Bay Area,
              East Bay, North Bay, Sacramento Valley, and Central Valley with licensed <Link to="/services/commercial-cleaning" style={{ color: 'var(--blue)', fontWeight: 600 }}>commercial cleaning services</Link>, <Link to="/services/janitorial-services" style={{ color: 'var(--blue)', fontWeight: 600 }}>janitorial programs</Link>, and residential <Link to="/services/residential-cleaning" style={{ color: 'var(--blue)', fontWeight: 600 }}>house cleaners</Link>.
            </p>
          </div>

          {groups.map((g) => (
            <div key={g.region} style={{ marginBottom: 46 }}>
              <h3 className="h3">{g.region}</h3>
              <div className="chip-row">
                {g.cities.map((c) => (
                  <Link className="chip" key={c.slug} to={`/cleaning-services/${c.slug}`}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <h3 className="h3">Popular Service + City Pages</h3>
          <p className="lead" style={{ marginBottom: 24 }}>
            Looking for a specific service in your city? Start here.
          </p>
          <div className="link-mesh">
            {SERVICES.slice(0, 4).flatMap((s) =>
              CITIES.slice(0, 12).map((c) => (
                <Link key={`${s.slug}-${c.slug}`} to={`/services/${s.slug}/${c.slug}`}>
                  {s.short} in {c.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
