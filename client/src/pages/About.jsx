import { useContent } from '../content.jsx';
import Icon from '../components/Icon.jsx';
import Seo from '../seo.jsx';
import { PageBanner, Stats, CtaBand } from '../components/Shared.jsx';

export default function About() {
  const { about, whyUs } = useContent();
  return (
    <>
      <Seo
        title="About Us | Professional Cleaners & Janitorial Services — Dozeles"
        description="Learn about Dozeles Professional Cleaning — 20+ years delivering premier commercial cleaners, janitorial services, and residential house cleaning across Northern California."
        keywords={[
          'cleaners',
          'cleaners near me',
          'cleaning services',
          'janitorial',
          'janitorial services',
          'about dozeles cleaning',
          'bay area cleaners',
          'commercial cleaners history',
          'licensed insured janitorial team',
          'professional cleaners northern california'
        ]}
        path="/about-us"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about-us' }
        ]}
      />
      <PageBanner title="About Us" crumb="About Us" />

      <section>
        <div className="container split">
          <div>
            <div className="eyebrow">Your Trusted Cleaners</div>
            <h2 className="h2">{about.heading}</h2>
            <p style={{ fontStyle: 'italic', fontWeight: 600, marginBottom: 16 }}>{about.subheading}</p>
            <p className="lead">{about.body}</p>
            <p style={{ marginTop: 16 }}>
              Whether you are searching for dedicated <a href="/services-offered" style={{ color: 'var(--blue)', fontWeight: 600 }}>commercial cleaners</a>, customized <a href="/services/janitorial-services" style={{ color: 'var(--blue)', fontWeight: 600 }}>janitorial services</a>, or top-rated <a href="/locations" style={{ color: 'var(--blue)', fontWeight: 600 }}>cleaners near me</a> throughout Northern California, Dozeles delivers reliable, high-touch results on every visit.
            </p>
          </div>
          <img src={about.image} alt="Dozeles Professional Cleaning cleaners team" loading="lazy" />
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">Why Choosing Us</div>
            <h2 className="h2">What Sets Us Apart</h2>
          </div>
          <div className="grid grid-3">
            {whyUs.map((w) => (
              <div className="card" key={w.title}>
                <div className="icon"><Icon name={w.icon} /></div>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Stats />

      <section>
        <div className="container split">
          <img src={about.missionImage} alt="Our mission" loading="lazy" />
          <div>
            <div className="eyebrow">Our Mission</div>
            <h2 className="h2">{about.mission.heading}</h2>
            <p className="lead">{about.mission.text}</p>
            <ul className="checklist">
              {about.mission.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
