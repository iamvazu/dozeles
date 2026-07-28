import { useParams, Navigate, Link } from 'react-router-dom';
import { getCity, CITIES } from '../data/cities.js';
import { SERVICES } from '../data/services.js';
import Seo from '../seo.jsx';
import Icon from '../components/Icon.jsx';
import { Testimonials, Stats } from '../components/Shared.jsx';
import { CrumbStrip, PseoHero, WhyDozeles, CtaStrip, FaqSection, LinkMesh } from '../components/Pseo.jsx';

export default function CityPage() {
  const { city: slug } = useParams();
  const city = getCity(slug);
  if (!city) return <Navigate to="/locations" replace />;

  const path = `/cleaning-services/${city.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
    { name: city.name, path },
  ];

  const cityFaqs = [
    {
      q: `How much do cleaning services cost in ${city.name}?`,
      a: `Cleaning costs in ${city.name} depend on the service. Recurring house cleaning typically runs $149–$329 per visit; commercial and janitorial contracts are billed monthly at roughly $0.10–$0.45 per square foot per month depending on facility type and frequency; move-out deep cleans run $280–$650. Every Dozeles quote in ${city.name} is fixed and written after a free walkthrough, so there are no hourly surprises.`,
    },
    {
      q: `Do you offer same-week service in ${city.name}?`,
      a: `Yes. ${city.name} sits inside our ${city.region} service territory and we hold same-week capacity for new clients. Urgent move-out cleans, post-construction final cleans, and emergency disinfection can often be scheduled within 24–48 hours.`,
    },
    {
      q: `Are your ${city.name} cleaners background-checked and insured?`,
      a: `Every crew member serving ${city.name} is background-checked before their first shift, and Dozeles is fully licensed, bonded, and insured with general liability and workers compensation coverage. We provide certificates of insurance naming your business or property manager as additional insured.`,
    },
    {
      q: `What areas of ${city.name} do you serve?`,
      a: `We serve all of ${city.name}, including ${city.landmarks.join(', ')}, plus surrounding communities throughout ${city.county}. If you are near ${city.name} but not sure whether you are in our territory, call 650-290-0280 — we almost certainly cover you.`,
    },
    {
      q: `Do you use eco-friendly cleaning products in ${city.name}?`,
      a: `Yes, on every job. We use green-certified, low-VOC products and HEPA-filtered equipment that captures 99.97% of airborne particles. It is safer for your staff, your family, and your pets, and it meets the environmental standards that ${city.region} clients increasingly require.`,
    },
  ];

  return (
    <>
      <Seo
        title={`Cleaning & Janitorial Services in ${city.name}, CA | Dozeles`}
        description={`Top-rated commercial and residential cleaning services in ${city.name}, CA. Janitorial, office, house, move-out, and post-construction cleaning. Licensed, insured, eco-friendly. Free quote — 650-290-0280.`}
        keywords={[
          `cleaning services ${city.name.toLowerCase()}`,
          `janitorial services ${city.name.toLowerCase()}`,
          `commercial cleaning ${city.name.toLowerCase()}`,
          `house cleaning ${city.name.toLowerCase()}`,
          `office cleaning ${city.name.toLowerCase()}`,
          `cleaning company ${city.name.toLowerCase()} ca`,
          `${city.name.toLowerCase()} cleaners near me`,
          `commercial cleaning ${city.county.toLowerCase()}`,
          `janitorial company ${city.region.toLowerCase()}`,
        ]}
        path={path}
        faqs={cityFaqs}
        breadcrumbs={crumbs}
        serviceName="Commercial and Residential Cleaning Services"
        areaServed={city.name}
      />
      <CrumbStrip items={crumbs} />
      <PseoHero
        h1={`Cleaning & Janitorial Services in ${city.name}, CA`}
        sub={`Commercial janitorial, office cleaning, house cleaning, and specialty services across ${city.name} and all of ${city.county}. Licensed, insured, and eco-friendly for over 20 years.`}
        image="https://dozeles.com/wp-content/uploads/2024/01/hero-06.jpg"
        city={city.name}
      />

      <section>
        <div className="container split">
          <div className="prose">
            <div className="eyebrow">{city.county} · {city.region}</div>
            <h2 className="h2">Your Local {city.name} Cleaning Company</h2>
            <p>{city.blurb}</p>
            <p>
              Dozeles has provided commercial and residential cleaning services throughout{' '}
              {city.region} for more than twenty years. In {city.name} we serve offices, retail
              storefronts, medical suites, government facilities, apartments, and single-family
              homes — with the same crews, the same checklists, and the same guarantee on every job.
            </p>
            <p>
              We cover{' '}
              <strong>{city.landmarks.join(', ')}</strong> and every neighborhood in between.
              Because we schedule by route rather than by dispatch, {city.name} clients get
              consistent arrival times and the same team on every visit — which is the single
              biggest factor in whether a cleaning contract actually holds up over years.
            </p>
            <Link to="/book" className="btn btn-blue" style={{ marginTop: 12 }}>
              Get a Free {city.name} Quote
            </Link>
          </div>
          <img
            src="https://dozeles.com/wp-content/uploads/2024/04/60-1024x683.jpg"
            alt={`Professional cleaning services in ${city.name}, California`}
            loading="lazy"
          />
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">Services in {city.name}</div>
            <h2 className="h2">Every Cleaning Service {city.name} Needs</h2>
            <p className="lead">
              Nine specialized service lines, all available in {city.name} and throughout {city.county}.
            </p>
          </div>
          <div className="grid grid-3">
            {SERVICES.map((s) => (
              <Link className="card" key={s.slug} to={`/services/${s.slug}/${city.slug}`}>
                <div className="icon"><Icon name={s.icon} /></div>
                <h3>{s.short} in {city.name}</h3>
                <p>{s.tagline}</p>
                <div className="go">Learn more →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WhyDozeles city={city.name} />
      <Stats />
      <Testimonials heading={`What ${city.region} Clients Say`} />
      <FaqSection faqs={cityFaqs} city={city.name} heading={`Cleaning Services in ${city.name} — FAQs`} />
      <CtaStrip city={city.name} />
      <LinkMesh city={city} />

      <section>
        <div className="container">
          <h3 className="h3">Other Cities We Serve in {city.region}</h3>
          <div className="chip-row">
            {CITIES.filter((c) => c.region === city.region && c.slug !== city.slug)
              .slice(0, 18)
              .map((c) => (
                <Link className="chip" key={c.slug} to={`/cleaning-services/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
          </div>
          <p style={{ marginTop: 20 }}>
            <Link to="/locations" style={{ color: 'var(--blue)', fontWeight: 700 }}>
              View all {CITIES.length} service areas →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
