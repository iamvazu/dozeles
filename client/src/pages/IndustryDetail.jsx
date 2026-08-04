import { useParams, Navigate, Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';
import { SERVICES } from '../data/services.js';
import Seo from '../seo.jsx';
import { Testimonials } from '../components/Shared.jsx';
import {
  CrumbStrip, PseoHero, WhyDozeles, CtaStrip, fill
} from '../components/Pseo.jsx';

export default function IndustryDetail() {
  const { industry: slug } = useParams();
  const industry = INDUSTRIES.find(ind => ind.slug === slug);
  if (!industry) return <Navigate to="/" replace />;

  const area = 'the Bay Area & Northern California';
  const path = `/industries/${industry.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
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

      <section>
        <div className="container split">
          <div className="prose">
            <div className="eyebrow">Industry Expertise</div>
            <h2 className="h2">Specialized Cleaning for {industry.short}</h2>
            <p>
              At Dozeles Professional Cleaning, we understand that {industry.name.toLowerCase()} require specific cleaning protocols, attention to detail, and a deep understanding of industry standards. 
              Our team is trained to deliver exceptional results tailored to the unique demands of your facility in {area}.
            </p>
            <p>
              From high-traffic public areas to sensitive environments, we utilize eco-friendly products and advanced cleaning techniques to ensure a safe, healthy, and pristine space for your employees, clients, and guests.
            </p>
            <Link to="/book" className="btn btn-blue" style={{ marginTop: 12 }}>Get a Custom Quote</Link>
          </div>
          <img src={industry.image} alt={`${industry.name} cleaning services in the Bay Area`} loading="lazy" style={{ borderRadius: '22px', boxShadow: 'var(--shadow)', width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' }} />
        </div>
      </section>

      <WhyDozeles city="Northern California" />
      <Testimonials heading="What Our Clients Say" />
      <CtaStrip service={`${industry.short} Cleaning`} />

      <section>
        <div className="container">
          <h3 className="h3">Services We Offer for {industry.short}</h3>
          <div className="link-mesh">
            {SERVICES.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`}>{s.title}</Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
