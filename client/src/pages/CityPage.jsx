import { useParams, Navigate, Link } from 'react-router-dom';
import { getCity, CITIES } from '../data/cities.js';
import { SERVICES } from '../data/services.js';
import Seo from '../seo.jsx';
import Icon from '../components/Icon.jsx';
import { Testimonials, Stats } from '../components/Shared.jsx';
import { CrumbStrip, PseoHero, WhyDozeles, CtaStrip, FaqSection, LinkMesh } from '../components/Pseo.jsx';

const HERO_IMAGES = [
  '/images/office_desk_cleaning.png',
  '/images/commercial_cleaning.png',
  '/images/janitorial_services.png',
  '/images/office_cleaning.png',
];

const CONTENT_IMAGES = [
  '/images/city_cleaning_1.png',
  '/images/city_cleaning_2.png',
  '/images/deep_cleaning.png',
  '/images/family_cleaning.png',
  '/images/hero_residential.png',
  '/images/residential_cleaning.png',
  '/images/vacuum_cleaning.png',
  '/images/hero_commercial.png',
];

const getConsistentIndex = (str, max) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
};

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
      a: `Cleaning costs in ${city.name} depend on the service. Recurring house cleaning typically runs $149–$329 per visit; commercial and janitorial contracts are billed monthly at roughly $0.10–$0.45 per square foot per month depending on facility type and frequency; move-out deep cleans run $280–$650. Every Dozeles Professional Cleaning quote in ${city.name} is fixed and written after a free walkthrough, so there are no hourly surprises.`,
    },
    {
      q: `Do you offer same-week service in ${city.name}?`,
      a: `Yes. ${city.name} sits inside our ${city.region} service territory and we hold same-week capacity for new clients. Urgent move-out cleans, post-construction final cleans, and emergency disinfection can often be scheduled within 24–48 hours.`,
    },
    {
      q: `Are your ${city.name} cleaners background-checked and insured?`,
      a: `Every crew member serving ${city.name} is background-checked before their first shift, and Dozeles Professional Cleaning is fully licensed, bonded, and insured with general liability and workers compensation coverage. We provide certificates of insurance naming your business or property manager as additional insured.`,
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
        title={`Top-Rated Cleaners & Janitorial Services in ${city.name}, CA | Dozeles`}
        description={`Looking for professional cleaners near me in ${city.name}, CA? Dozeles Professional Cleaning delivers commercial cleaners, janitorial services, office cleaning, and residential house cleaning in ${city.name}. Free quote.`}
        keywords={[
          `cleaners in ${city.name.toLowerCase()}`,
          `cleaners near me in ${city.name.toLowerCase()}`,
          `cleaning services ${city.name.toLowerCase()}`,
          `janitorial services ${city.name.toLowerCase()}`,
          `commercial cleaners ${city.name.toLowerCase()}`,
          `house cleaners ${city.name.toLowerCase()}`,
          `office cleaning ${city.name.toLowerCase()}`,
          `${city.name.toLowerCase()} cleaners`,
          `${city.name.toLowerCase()} janitorial company`,
          `cleaning company ${city.county.toLowerCase()}`,
        ]}
        path={path}
        faqs={cityFaqs}
        breadcrumbs={crumbs}
        serviceName="Commercial and Residential Cleaning Services"
        areaServed={city.name}
      />
      <CrumbStrip items={crumbs} />
      <PseoHero
        h1={`Professional Cleaners & Janitorial Services in ${city.name}, CA`}
        sub={`Top-rated commercial cleaners, janitorial programs, office cleaning, and house cleaning services across ${city.name} and ${city.county}. Licensed, insured, eco-friendly for over 20 years.`}
        image={HERO_IMAGES[getConsistentIndex(city.name, HERO_IMAGES.length)]}
        city={city.name}
      />

      <section>
        <div className="container split">
          <div className="prose">
            <div className="eyebrow">{city.county} · {city.region}</div>
            <h2 className="h2">Your Trusted Local Cleaners &amp; Janitorial Team in {city.name}</h2>
            <p>{city.blurb}</p>
            <p>
              Looking for reliable <strong>cleaners near me in {city.name}</strong>? Dozeles Professional Cleaning has provided premier commercial and residential cleaning services throughout{' '}
              {city.region} for more than twenty years. In {city.name} we serve offices, retail
              storefronts, medical suites, government facilities, and homes with dedicated programs:
            </p>
            <ul className="checklist">
              <li><Link to={`/services/commercial-cleaning/${city.slug}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>Commercial &amp; Office Cleaners in {city.name}</Link></li>
              <li><Link to={`/services/janitorial-services/${city.slug}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>Nightly &amp; Recurring Janitorial Services in {city.name}</Link></li>
              <li><Link to={`/services/residential-cleaning/${city.slug}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>Residential House Cleaners in {city.name}</Link></li>
              <li><Link to={`/services/deep-cleaning/${city.slug}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>Deep Cleaning &amp; Sanitizing in {city.name}</Link></li>
            </ul>
            <div style={{ marginTop: 22 }}>
              <Link to="/book" className="btn btn-blue">Book Cleaners in {city.name}</Link>
              <a href="tel:6502900280" className="btn btn-outline" style={{ marginLeft: 12 }}>650-290-0280</a>
            </div>
          </div>
          <img
            src={CONTENT_IMAGES[getConsistentIndex(city.name + 'body', CONTENT_IMAGES.length)]}
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
    </>
  );
}
