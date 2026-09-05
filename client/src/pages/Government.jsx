import { useContent } from '../content.jsx';
import Icon from '../components/Icon.jsx';
import Seo from '../seo.jsx';
import { PageBanner, Stats, CtaBand } from '../components/Shared.jsx';

export default function Government() {
  const { government, about } = useContent();
  const f = government.facilities;

  return (
    <>
      <Seo
        title="Government Facility Cleaning & Contracts | Dozeles Professional Cleaning"
        description="Certified Small Business and DIR Registered government facility cleaning contractor in California. Municipal, state, and federal facility janitorial services in Northern California."
        keywords={[
          'government facility cleaning',
          'certified small business janitorial',
          'california DIR registered cleaners',
          'municipal building cleaning',
          'government cleaning contractor norcal'
        ]}
        path="/government-contract"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Government Contract', path: '/government-contract' }
        ]}
      />
      <PageBanner title="Government Contract" crumb="Government Contract" />

      <section>
        <div className="container split">
          <div>
            <div className="eyebrow">Government Contracts</div>
            <h2 className="h2">{government.heading}</h2>
            <p className="lead" style={{ marginBottom: 14, fontWeight: 600 }}>{government.intro}</p>
            <p className="lead">{government.body}</p>
          </div>
          <div style={{ display: 'grid', gap: 20 }}>
            {government.images.map((img) => (
              <img key={img} src={img} alt="Government facility cleaning" loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* Government Facilities section */}
      <section className="section-alt">
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">Government Facilities</div>
            <h2 className="h2">{f.heading}</h2>
            <p className="lead" style={{ margin: '0 auto' }}>{f.intro}</p>
          </div>
          <div className="grid grid-3">
            {f.items.map((item) => (
              <div className="card" key={item.title}>
                <div className="icon"><Icon name="landmark" /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container split">
          <div>
            <div className="eyebrow">Compliance & Credentials</div>
            <h2 className="h2">Built for Government Standards</h2>
            <ul className="checklist">
              {f.compliance.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div>
            <div className="eyebrow">Our Mission</div>
            <h2 className="h2" style={{ fontSize: '1.4rem' }}>{about.mission.heading}</h2>
            <p className="lead">{about.mission.text}</p>
          </div>
        </div>
      </section>

      <Stats />
      <CtaBand />
    </>
  );
}
