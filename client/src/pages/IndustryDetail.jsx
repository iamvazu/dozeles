import { useParams, Navigate, Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';
import Seo from '../seo.jsx';
import { Testimonials } from '../components/Shared.jsx';
import {
  CrumbStrip, PseoHero, WhyDozeles, CtaStrip
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
    { name: 'Industries', path: '#' },
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
            <h3 className="h3">Services We Offer for {industry.short}</h3>
            <p>Our cleaning crews are specifically trained in the following services tailored to the needs of {industry.name.toLowerCase()}:</p>
          </div>
          <div className="grid-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {industry.servicesList && industry.servicesList.map((service, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 20, background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ color: 'var(--blue)', flexShrink: 0 }}><Icon name="check" size={24} /></span>
                <span style={{ fontWeight: 600 }}>{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light">
        <div className="container">
          <h3 className="h3 text-center">Major Cities We Serve in the Bay Area</h3>
          <div className="link-mesh" style={{ marginTop: 30, justifyContent: 'center' }}>
            {industry.cities && industry.cities.map((city, i) => (
              <span key={i} style={{ padding: '10px 20px', background: '#fff', borderRadius: 30, fontWeight: 500, boxShadow: 'var(--shadow-sm)' }}>
                <Icon name="map-pin" size={14} style={{ marginRight: 8, color: 'var(--blue)' }} />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      <WhyDozeles city="Northern California" />
      <Testimonials heading="What Our Clients Say" />
      <CtaStrip service={`${industry.short} Cleaning`} />
    </>
  );
}
