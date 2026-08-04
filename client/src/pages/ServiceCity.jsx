import { useParams, Navigate, Link } from 'react-router-dom';
import { getService, SERVICES } from '../data/services.js';
import { getCity } from '../data/cities.js';
import Seo from '../seo.jsx';
import { Testimonials } from '../components/Shared.jsx';
import {
  CrumbStrip, PseoHero, IncludesGrid, IndustriesGrid, FaqSection,
  WhyDozeles, CtaStrip, LinkMesh, fill,
} from '../components/Pseo.jsx';

export default function ServiceCity() {
  const { service: sSlug, city: cSlug } = useParams();
  // Legacy/merged slugs → canonical destination (office cleaning merged into commercial)
  const REDIRECTS = { 'office-cleaning': 'commercial-cleaning' };
  if (REDIRECTS[sSlug]) return <Navigate to={`/services/${REDIRECTS[sSlug]}/${cSlug}`} replace />;
  const service = getService(sSlug);
  const city = getCity(cSlug);
  if (!service) return <Navigate to="/services-offered" replace />;
  if (!city) return <Navigate to={`/services/${sSlug}`} replace />;

  const path = `/services/${service.slug}/${city.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services-offered' },
    { name: service.short, path: `/services/${service.slug}` },
    { name: city.name, path },
  ];

  const keywords = [
    ...service.keywords.map((k) => `${k} ${city.name.toLowerCase()}`),
    ...service.keywords.map((k) => `${k} ${city.name.toLowerCase()} ca`),
    `${service.short.toLowerCase()} near me`,
    `${service.short.toLowerCase()} ${city.county.toLowerCase()}`,
    `best ${service.keywords[0]} in ${city.name.toLowerCase()}`,
    `affordable ${service.keywords[0]} ${city.name.toLowerCase()}`,
    `${city.name.toLowerCase()} cleaning company`,
    `${city.name.toLowerCase()} janitorial services`,
  ];

  return (
    <>
      <Seo
        title={fill(service.metaTitle, city.name)}
        description={fill(service.metaDesc, city.name)}
        keywords={keywords}
        path={path}
        image={service.hero}
        faqs={service.faqs.map((f) => ({ q: fill(f.q, city.name), a: fill(f.a, city.name) }))}
        breadcrumbs={crumbs}
        serviceName={service.title}
        areaServed={city.name}
      />
      <CrumbStrip items={crumbs} />
      <PseoHero
        h1={`${service.title} in ${city.name}, CA`}
        sub={`${service.tagline} Trusted by ${city.name} businesses and homeowners for over 20 years.`}
        image={service.hero}
        city={city.name}
      />

      <section>
        <div className="container split">
          <div className="prose">
            <div className="eyebrow">{city.name}, {city.county}</div>
            <h2 className="h2">{service.title} Built For {city.name}</h2>
            <p>{city.blurb}</p>
            <p>{fill(service.intro, city.name)}</p>
            {service.body.map((p, i) => <p key={i}>{fill(p, city.name)}</p>)}
            <p>
              <strong>Neighborhoods and districts we serve in {city.name}:</strong>{' '}
              {city.landmarks.join(', ')} — and everywhere in between. With a population of roughly{' '}
              {city.pop}, {city.name} is a core part of our {city.region} service territory, and our
              crews are typically on site within days of your first call.
            </p>
            <Link to="/book" className="btn btn-blue" style={{ marginTop: 12 }}>
              Get a Free {city.name} Quote
            </Link>
          </div>
          <img src={service.hero} alt={`${service.title} in ${city.name}, California`} loading="lazy" />
        </div>
      </section>

      <IncludesGrid
        items={service.includes}
        heading={`What's Included In Our ${city.name} ${service.short} Service`}
        sub={`Every ${city.name} property is scoped individually — this is our standard checklist.`}
      />
      <IndustriesGrid items={service.industries} heading={`${service.short} For ${city.name} Properties`} />
      <WhyDozeles city={city.name} />
      <Testimonials heading={`Reviews From ${city.region} Clients`} />
      <FaqSection
        faqs={service.faqs}
        city={city.name}
        heading={`${service.short} in ${city.name} — FAQs`}
      />
      <CtaStrip city={city.name} service={service.short} />
      <LinkMesh city={city} service={service} />
    </>
  );
}
