import { useContent } from '../content.jsx';
import Icon from '../components/Icon.jsx';
import Seo from '../seo.jsx';
import { PageBanner, QuoteForm, CtaBand } from '../components/Shared.jsx';

export default function Contact() {
  const { site } = useContent();
  return (
    <>
      <Seo
        title="Contact Us | Dozeles Professional Cleaning — Free Quote & Inquiries"
        description="Get in touch with Dozeles Professional Cleaning for commercial janitorial and residential cleaning quotes across the San Francisco Bay Area and Northern California. Call 650-290-0280."
        keywords={[
          'contact dozeles cleaning',
          'cleaning quote bay area',
          'janitorial estimate daly city',
          'hire commercial cleaners',
          'cleaning company phone number'
        ]}
        path="/contact-us"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact-us' }
        ]}
      />
      <PageBanner title="Contact" crumb="Contact" />

      <section>
        <div className="container">
          <div className="grid grid-3" style={{ marginBottom: 56 }}>
            <a className="card center" href={`tel:${site.phoneRaw}`}>
              <div className="icon" style={{ margin: '0 auto' }}><Icon name="phone" /></div>
              <h3>Call us</h3>
              <p>{site.phone}</p>
            </a>
            <a className="card center" href={`mailto:${site.email}`}>
              <div className="icon" style={{ margin: '0 auto' }}><Icon name="mail" /></div>
              <h3>Have any questions?</h3>
              <p>{site.email}</p>
            </a>
            <div className="card center">
              <div className="icon" style={{ margin: '0 auto' }}><Icon name="pin" /></div>
              <h3>Address</h3>
              <p>{site.address}</p>
            </div>
          </div>

          <div className="split">
            <div>
              <div className="eyebrow">Get a Quote</div>
              <h2 className="h2">Reach out today for a customized cleaning quote</h2>
              <p className="lead">
                We offer quick, no-obligation estimates to meet your specific needs. {site.workingDays},{' '}
                {site.workingHours}
              </p>
            </div>
            <QuoteForm />
          </div>
        </div>
      </section>

      <div className="map container" style={{ paddingBottom: 60 }}>
        <iframe title="Dozeles Professional Cleaning location" src={site.mapEmbed} loading="lazy" allowFullScreen />
      </div>

      <CtaBand />
    </>
  );
}
