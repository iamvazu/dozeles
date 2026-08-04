import { useParams, Navigate, Link } from 'react-router-dom';
import { getService, SERVICES } from '../data/services.js';
import Seo from '../seo.jsx';
import { Testimonials } from '../components/Shared.jsx';
import {
  CrumbStrip, PseoHero, IncludesGrid, IndustriesGrid, FaqSection,
  WhyDozeles, CtaStrip, LinkMesh, fill,
} from '../components/Pseo.jsx';

export default function ServiceDetail() {
  const { service: slug } = useParams();
  // Legacy/merged slugs → canonical destination (office cleaning merged into commercial)
  const REDIRECTS = { 'office-cleaning': 'commercial-cleaning' };
  if (REDIRECTS[slug]) return <Navigate to={`/services/${REDIRECTS[slug]}`} replace />;
  const service = getService(slug);
  if (!service) return <Navigate to="/services-offered" replace />;

  const area = 'the Bay Area & Northern California';
  const path = `/services/${service.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services-offered' },
    { name: service.short, path },
  ];

  return (
    <>
      <Seo
        title={`${fill(service.metaTitle, 'Bay Area')} | Dozeles Professional Cleaning`}
        description={fill(service.metaDesc, 'the Bay Area')}
        keywords={[
          ...service.keywords,
          ...service.keywords.map((k) => `${k} bay area`),
          ...service.keywords.map((k) => `${k} northern california`),
          `${service.short.toLowerCase()} near me`,
        ]}
        path={path}
        image={service.hero}
        faqs={service.faqs.map((f) => ({ q: fill(f.q, 'the Bay Area'), a: fill(f.a, 'the Bay Area') }))}
        breadcrumbs={crumbs}
        serviceName={service.title}
      />
      <CrumbStrip items={crumbs} />
      <PseoHero
        h1={`${service.title} in the Bay Area & Northern California`}
        sub={service.tagline}
        image={service.hero}
        city="the Bay Area"
      />

      <section>
        <div className="container split">
          <div className="prose">
            <div className="eyebrow">{service.short}</div>
            <h2 className="h2">Professional {service.title} You Can Rely On</h2>
            <p>{fill(service.intro, area)}</p>
            {service.body.map((p, i) => <p key={i}>{fill(p, area)}</p>)}
            <Link to="/book" className="btn btn-blue" style={{ marginTop: 12 }}>Get a Free Quote</Link>
          </div>
          <img src={service.hero} alt={`${service.title} in the Bay Area`} loading="lazy" />
        </div>
      </section>

      <IncludesGrid
        items={service.includes}
        heading={`What Our ${service.short} Service Includes`}
        sub={`Every ${service.short.toLowerCase()} contract is scoped to your building. This is the standard checklist we work from.`}
      />
      <IndustriesGrid items={service.industries} heading={`${service.short} For Every Property Type`} />
      <WhyDozeles city="Northern California" />
      <Testimonials heading="What Our Clients Say" />
      <FaqSection
        faqs={service.faqs}
        city="the Bay Area"
        heading={`${service.short} FAQs`}
      />
      <CtaStrip service={service.short} />
      <LinkMesh service={service} />
    </>
  );
}
