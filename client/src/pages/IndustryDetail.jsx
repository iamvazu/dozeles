import { useParams, Navigate, Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';
import { CITIES } from '../data/cities.js';
import Seo from '../seo.jsx';
import { Testimonials, ClientLogos } from '../components/Shared.jsx';
import {
  CrumbStrip, PseoHero, WhyDozeles, CtaStrip, LinkMesh
} from '../components/Pseo.jsx';
import Icon from '../components/Icon.jsx';

export default function IndustryDetail() {
  const { industry: slug } = useParams();
  const industry = INDUSTRIES.find(ind => ind.slug === slug);
  if (!industry) return <Navigate to="/" replace />;

  const area = 'the Bay Area & Northern California';
  const path = `/industries/${industry.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services-offered' },
    { name: industry.name, path },
  ];

  return (
    <>
      <Seo
        title={`${industry.name} Cleaning Services in the Bay Area | Dozeles Professional Cleaning`}
        description={`Expert commercial cleaning and janitorial services for ${industry.name.toLowerCase()} in the Bay Area. Reliable, compliant, and professional.`}
        keywords={[
          `${industry.name.toLowerCase()} cleaning`,
          `${industry.name.toLowerCase()} janitorial services`,
          `${industry.short.toLowerCase()} cleaners bay area`,
          `commercial cleaning for ${industry.name.toLowerCase()}`
        ]}
        path={path}
        image={industry.image}
        breadcrumbs={crumbs}
        serviceName={industry.name}
      />
      <CrumbStrip items={crumbs} />
      <PseoHero
        h1={`${industry.name} Cleaning Services`}
        sub={industry.description}
        image={industry.image}
        city="the Bay Area"
      />

      <ClientLogos />

      <section className="bg-light">
        <div className="container split">
          <div className="prose">
            <div className="eyebrow">Industry Expertise</div>
            <h2 className="h2">Specialized Cleaning for {industry.short}</h2>
            {industry.body && industry.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <Link to="/book" className="btn btn-blue" style={{ marginTop: 12 }}>Get a Custom Quote</Link>
          </div>
          <img src={industry.image} alt={`${industry.name} cleaning services in the Bay Area`} loading="lazy" style={{ borderRadius: '22px', boxShadow: 'var(--shadow)', width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' }} />
        </div>
      </section>

      <section>
        <div className="container">
          <div className="text-center" style={{ maxWidth: 700, margin: '0 auto 40px' }}>
            <h3 className="h3 text-center">Services We Offer for {industry.short}</h3>
            <p className="text-center">Our cleaning crews are specifically trained in the following services tailored to the needs of {industry.name.toLowerCase()}:</p>
          </div>
          <ul className="checklist two-col">
            {industry.servicesList && industry.servicesList.map((service, i) => (
              <li key={i}>{service}</li>
            ))}
          </ul>
        </div>
      </section>

      <LinkMesh industry={industry} />

      <WhyDozeles city="Northern California" />
      <Testimonials heading="What Our Clients Say" />
      <CtaStrip service={`${industry.short} Cleaning`} />
    </>
  );
}
