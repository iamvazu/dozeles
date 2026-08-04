import { useParams, Navigate, Link } from 'react-router-dom';
import { getCity, CITIES } from '../data/cities.js';
import { INDUSTRIES } from '../data/industries.js';
import Seo from '../seo.jsx';
import { Testimonials } from '../components/Shared.jsx';
import {
  CrumbStrip, PseoHero, IncludesGrid, FaqSection,
  WhyDozeles, CtaStrip, LinkMesh
} from '../components/Pseo.jsx';

export default function IndustryCity() {
  const { industry: iSlug, city: cSlug } = useParams();
  
  const industry = INDUSTRIES.find(ind => ind.slug === iSlug);
  const city = getCity(cSlug);

  if (!industry) return <Navigate to="/industries" replace />;
  if (!city) return <Navigate to={`/industries/${iSlug}`} replace />;

  const path = `/industries/${industry.slug}/${city.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Industries', path: '/industries' },
    { name: industry.short, path: `/industries/${industry.slug}` },
    { name: city.name, path },
  ];

  // Synthesize dynamic FAQs for this IndustryxCity
  const dynamicFaqs = [
    {
      q: `Do you provide ${industry.short} cleaning services in ${city.name}?`,
      a: `Yes! Dozeles Professional Cleaning is fully equipped to handle ${industry.name.toLowerCase()} properties across ${city.name}, including neighborhoods like ${city.landmarks.join(' and ')}. Our local crews are typically available on short notice.`
    },
    {
      q: `What janitorial services are included for ${city.name} ${industry.short} facilities?`,
      a: `Our specialized packages for ${city.name} include ${industry.servicesList.join(', ').toLowerCase()}, all tailored to the exact requirements of ${industry.name.toLowerCase()} environments.`
    },
    {
      q: `Are your cleaning crews in ${city.county} insured and bonded?`,
      a: `Absolutely. We carry comprehensive liability insurance and workers' compensation covering all our operations in ${city.name} and the greater ${city.region}, giving facility managers total peace of mind.`
    }
  ];

  const keywords = [
    `${industry.name.toLowerCase()} cleaning ${city.name.toLowerCase()}`,
    `${industry.short.toLowerCase()} janitorial services ${city.name.toLowerCase()} ca`,
    `best ${industry.short.toLowerCase()} cleaners in ${city.name.toLowerCase()}`,
    `affordable ${industry.name.toLowerCase()} cleaning company ${city.county.toLowerCase()}`,
    ...industry.servicesList.map(s => `${s.toLowerCase()} in ${city.name.toLowerCase()}`)
  ];

  const metaTitle = `${industry.name} Cleaning Services in ${city.name}, CA`;
  const metaDesc = `Expert ${industry.name} cleaning and janitorial services in ${city.name}, California. We specialize in ${industry.servicesList[0].toLowerCase()} and more for local businesses. Get a free quote today!`;

  return (
    <>
      <Seo
        title={metaTitle}
        description={metaDesc}
        keywords={keywords}
        path={path}
        image={industry.image}
        faqs={dynamicFaqs}
        breadcrumbs={crumbs}
        serviceName={`${industry.name} Cleaning`}
        areaServed={city.name}
      />
      <CrumbStrip items={crumbs} />
      <PseoHero
        h1={`${industry.name} Cleaning in ${city.name}, CA`}
        sub={`Specialized janitorial and commercial cleaning for ${industry.short.toLowerCase()} facilities. Trusted by property managers across ${city.name} and ${city.county}.`}
        image={industry.image}
        city={city.name}
      />

      <section>
        <div className="container split">
          <div className="prose">
            <div className="eyebrow">{city.name}, {city.county}</div>
            <h2 className="h2">{industry.name} Janitorial Services Built For {city.name}</h2>
            <p>{city.blurb}</p>
            {industry.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p>
              <strong>Extensive {city.name} Coverage:</strong>{' '}
              We proudly service {industry.name.toLowerCase()} facilities throughout the local {city.name} neighborhoods, including{' '}
              {city.landmarks.join(', ')}. Whether your building is located in the heart of downtown or near the outskirts of {city.region}, 
              our dedicated crews are ready to deploy. With a local population of {city.pop}, {city.name} is a key service hub for our operations.
            </p>
            <p>
              By combining our industry-leading <strong>{industry.short} protocols</strong> with our deep knowledge of the {city.name} commercial landscape, 
              we ensure your property meets the highest standards of hygiene and presentation.
            </p>
            <Link to="/book" className="btn btn-blue" style={{ marginTop: 12 }}>
              Get a Free {city.name} {industry.short} Quote
            </Link>
          </div>
          <img src={industry.image} alt={`${industry.name} Cleaning in ${city.name}, California`} loading="lazy" style={{ borderRadius: '1rem', objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>
      </section>

      <IncludesGrid
        items={industry.servicesList}
        heading={`Specialized Services We Offer for ${city.name} ${industry.short}`}
        sub={`A comprehensive janitorial checklist designed specifically for ${industry.name.toLowerCase()} environments.`}
      />

      <WhyDozeles city={city.name} />
      <Testimonials heading={`What Our ${city.region} Commercial Clients Say`} />
      
      <FaqSection
        faqs={dynamicFaqs}
        city={city.name}
        heading={`${industry.short} Cleaning in ${city.name} — FAQs`}
      />
      
      <CtaStrip city={city.name} service={`${industry.short.toLowerCase()} cleaning`} />
      <LinkMesh city={city} />

      <section>
        <div className="container">
          <h3 className="h3 text-center" style={{ marginBottom: 40 }}>
            More {industry.short} Cleaning Locations
          </h3>
          <div className="chip-row">
            {CITIES.slice(0, 30).map((c) => (
              <Link key={c.slug} to={`/industries/${industry.slug}/${c.slug}`} className="chip">
                {c.name}, CA
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
