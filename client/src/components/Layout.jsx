import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { api } from '../api.js';
import Header from './Header.jsx';
import MobileBar from './MobileBar.jsx';
import Icon from './Icon.jsx';
import Social, { SOCIALS } from './Social.jsx';
import { SERVICES } from '../data/services.js';
import { CITIES } from '../data/cities.js';

const COMPANY = [
  { to: '/', label: 'Home' },
  { to: '/about-us', label: 'About Us' },
  { to: '/cleaning-process', label: 'Cleaning Process' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/locations', label: 'Locations' },
  { to: '/government-contract', label: 'Government' },
  { to: '/reviews', label: 'Reviews & FAQ' },
  { to: '/before-after', label: 'Before & After' },
  { to: '/contact-us', label: 'Contact' },
];

const HOURS = [
  ['Mon – Fri', '9:00am – 6:00pm'],
  ['Saturday', '9:00am – 6:00pm'],
  ['Sunday', 'Closed'],
];

export default function Layout() {
  const { site } = useContent();
  const [subEmail, setSubEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  async function subscribe(e) {
    e.preventDefault();
    try {
      await api.post('/api/subscribe', { email: subEmail });
      setSubMsg('Subscribed — thank you!');
      setSubEmail('');
    } catch (err) {
      setSubMsg(err.message);
    }
  }

  return (
    <>
      <Header site={site} />

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          {/* ---------- CTA + newsletter ---------- */}
          <div className="footer-cta">
            <div>
              <h2>Our Goal Is to Wow You With Every Clean</h2>
              <Link to="/book" className="btn-quote">
                Get a Free Quote <Icon name="arrow" size={15} />
              </Link>
            </div>
            <div>
              <div className="footer-sub-label">Subscribe to our newsletter</div>
              <form className="subscribe" onSubmit={subscribe}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                />
                <button className="btn-quote" type="submit">Subscribe</button>
              </form>
              {subMsg && <p style={{ marginTop: 10, fontSize: '0.85rem' }}>{subMsg}</p>}
            </div>
          </div>

          {/* ---------- columns ---------- */}
          <div className="footer-grid">
            <div>
              <Link to="/" className="logo-white" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', borderRadius: '14px', padding: '12px 20px', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}>
                <Icon name="sparkles" size={28} style={{ color: 'var(--blue)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--ink)', letterSpacing: '1px', lineHeight: 1, marginTop: '2px' }}>
                  DOZELES
                </span>
              </Link>
              <p>{site.footerText}</p>
              <div className="soc-row" style={{ marginTop: 22 }}>
                {SOCIALS.map((s) => (
                  <a
                    key={s.key}
                    className="soc-btn"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                  >
                    <Social name={s.key} size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4>Company</h4>
              <div className="footer-links">
                {COMPANY.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
              </div>
            </div>

            <div>
              <h4>Services</h4>
              <div className="footer-links">
                {SERVICES.map((s) => (
                  <Link key={s.slug} to={`/services/${s.slug}`}>{s.short}</Link>
                ))}
              </div>
            </div>

            <div>
              <h4>Contact Info</h4>
              <div className="footer-contact">
                <a href={`tel:${site.phoneRaw}`}>
                  <span className="footer-ico"><Icon name="phone" size={17} /></span>
                  <span className="footer-phone">{site.phone}</span>
                </a>
                <a href={`mailto:${site.email}`}>
                  <span className="footer-ico"><Icon name="mail" size={17} /></span>
                  <span>{site.email}</span>
                </a>
                <div>
                  <span className="footer-ico"><Icon name="pin" size={17} /></span>
                  <span>{site.address}<br />Serving the Bay Area &amp; NorCal</span>
                </div>
              </div>

              <h4 style={{ marginTop: 30 }}>Working Hours</h4>
              <div>
                {HOURS.map(([d, h]) => (
                  <div className="hours-row" key={d}>
                    <span>{d}</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---------- certifications ---------- */}
          <div className="footer-certs">
            {(site.certifications || []).map((c) => (
              <div className="cert-card" key={c.id}>
                <span className="cert-ico"><Icon name={c.icon} size={19} /></span>
                <div>
                  <strong>{c.label}</strong>
                  {c.number && <span className="cert-no">{c.numberLabel} {c.number}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* ---------- service-area link mesh (SEO) ---------- */}
          <div className="footer-mesh">
            <h4>Popular Service Areas</h4>
            <div className="link-mesh">
              {CITIES.slice(0, 32).map((c) => (
                <Link key={c.slug} to={`/cleaning-services/${c.slug}`}>
                  Cleaning Services {c.name}
                </Link>
              ))}
            </div>
            <p style={{ marginTop: 18 }}>
              <Link to="/locations" style={{ color: '#fff', fontWeight: 700 }}>
                View all {CITIES.length} service areas →
              </Link>
            </p>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Dozeles Professional Cleaning. All Rights Reserved.</span>
            <span>Commercial &amp; Residential Janitorial · Bay Area &amp; Northern California</span>
          </div>
        </div>
      </footer>

      <MobileBar site={site} />
    </>
  );
}
