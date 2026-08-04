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
        title="Service Areas | Cleaning & Janitorial Services Across Northern California"
        description={`Dozeles Professional Cleaning provides commercial and residential cleaning services in ${CITIES.length}+ cities across the Bay Area, East Bay, North Bay, Sacramento, and the Central Valley. Find your city.`}
        keywords={[
          'bay area cleaning services',
          'northern california janitorial services',
          'commercial cleaning bay area',
          'residential cleaning norcal',
          'east bay janitorial company',
          'sacramento cleaning services',
        ]}
        path="/locations"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Locations', path: '/locations' },
        ]}
      />
      <PageBanner title="Service Areas" crumb="Locations" />

      <section>
        <div className="container">
          <div className="center" style={{ marginBottom: 44 }}>
            <div className="eyebrow">Where We Work</div>
            <h2 className="h2">Serving {CITIES.length}+ Cities Across Northern California</h2>
            <p className="lead">
              From San Francisco to Sacramento, Napa to San Jose — Dozeles Professional Cleaning crews cover the Bay Area,
              East Bay, North Bay, Sacramento Valley, and Central Valley with commercial janitorial,
              office cleaning, residential house cleaning, and specialty services.
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
