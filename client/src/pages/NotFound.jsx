import { Link } from 'react-router-dom';
import Seo from '../seo.jsx';
import { PageBanner } from '../components/Shared.jsx';
import Icon from '../components/Icon.jsx';

export default function NotFound() {
  return (
    <>
      <Seo
        title="404 - Page Not Found | Dozeles Professional Cleaning"
        description="The page you are looking for does not exist or has been moved. Explore our commercial and residential cleaning services."
        path="/404"
        noindex={true}
      />
      <PageBanner title="404 - Page Not Found" crumb="404" />

      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--blue, #0A2540)', lineHeight: 1, marginBottom: 16 }}>
            404
          </div>
          <h2 className="h2" style={{ marginBottom: 16 }}>Oops! Page Not Found</h2>
          <p className="lead" style={{ marginBottom: 32 }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-blue">
              Back to Home
            </Link>
            <Link to="/services-offered" className="btn btn-outline">
              View All Services
            </Link>
            <Link to="/contact-us" className="btn btn-white">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
