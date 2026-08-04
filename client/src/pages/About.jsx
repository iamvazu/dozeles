import { useContent } from '../content.jsx';
import Icon from '../components/Icon.jsx';
import { PageBanner, Stats, CtaBand } from '../components/Shared.jsx';

export default function About() {
  const { about, whyUs } = useContent();
  return (
    <>
      <PageBanner title="About" crumb="About Us" />

      <section>
        <div className="container split">
          <div>
            <div className="eyebrow">Your Trusted Cleaners</div>
            <h2 className="h2">{about.heading}</h2>
            <p style={{ fontStyle: 'italic', fontWeight: 600, marginBottom: 16 }}>{about.subheading}</p>
            <p className="lead">{about.body}</p>
          </div>
          <img src={about.image} alt="Dozeles Professional Cleaning team" loading="lazy" />
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
