import { Link } from 'react-router-dom';
import Seo from '../seo.jsx';
import { PageBanner } from '../components/Shared.jsx';
import Icon from '../components/Icon.jsx';

export default function NotFound() {
  const quickLinks = [
    { label: 'Commercial Janitorial', path: '/services/janitorial-services', icon: 'building', desc: 'Daily/weekly office & facility maintenance' },
    { label: 'Residential House Cleaning', path: '/services/residential-cleaning', icon: 'home', desc: 'Standard, deep & recurring house cleaning' },
    { label: 'Move-In / Move-Out', path: '/services/move-in-move-out-cleaning', icon: 'truck', desc: 'Deposit-back handover scope with photos' },
    { label: 'Instant Price Calculator', path: '/pricing', icon: 'sparkles', desc: 'Calculate transparent cleaning rates' },
    { label: '73 Bay Area Locations', path: '/locations', icon: 'landmark', desc: 'San Francisco, San Jose, Oakland & Peninsula' },
    { label: 'Free Site Walkthrough', path: '/book', icon: 'clock', desc: 'Book a certified cleanliness audit' },
  ];

  return (
    <>
      <Seo
        title="404 - Page Not Found | Dozeles Professional Cleaning"
        description="The page you requested could not be found. Explore Dozeles Professional Cleaning services, pricing calculator, locations, or schedule a free quote."
        path="/404"
        noindex={true}
      />
      <PageBanner title="Page Not Found" crumb="404 Error" />

      <section style={{ padding: '70px 0 90px', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: 880, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(14, 95, 216, 0.1)',
            color: 'var(--blue)',
            marginBottom: 20
          }}>
            <Icon name="shield" size={36} />
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>
            Looking for Cleaning Services in the Bay Area?
          </h1>
          <p className="lead" style={{ maxWidth: 620, margin: '0 auto 36px', color: 'var(--muted)', fontSize: '1.05rem' }}>
            The link you followed may be outdated or mistyped. Choose one of our verified services, locations, or calculators below:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            textAlign: 'left',
            marginBottom: 40
          }}>
            {quickLinks.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--blue)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 95, 216, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--blue)', fontWeight: 700, fontSize: '0.98rem' }}>
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                  {item.desc}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-blue" style={{ minWidth: 160 }}>
              Return to Homepage
            </Link>
            <Link to="/book" className="btn btn-cleanliness-score">
              Book a Cleaning / Free Estimate
            </Link>
            <Link to="/contact-us" className="btn btn-outline">
              Contact Operations
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
