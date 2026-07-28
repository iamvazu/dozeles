import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { api } from '../api.js';
import Header from './Header.jsx';
import { SERVICES } from '../data/services.js';
import { CITIES } from '../data/cities.js';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about-us', label: 'About' },
  { to: '/services-offered', label: 'Services' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/locations', label: 'Locations' },
  { to: '/government-contract', label: 'Government' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact-us', label: 'Contact' },
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
          <div className="footer-grid">
            <div>
              <span className="logo-white"><img src={site.logo} alt={site.name} /></span>
              <p>{site.footerText}</p>
              <p style={{ marginTop: 14 }}>
                <a href={`tel:${site.phoneRaw}`} style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>
                  {site.phone}
                </a>
                <br />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </div>
            <div>
              <h4>Company</h4>
              <div className="footer-links">
                {NAV.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
                <Link to="/before-after">Before &amp; After</Link>
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
              <h4>Get Our Tips</h4>
              <p>Cleaning tips, seasonal checklists, and exclusive offers for Bay Area businesses and homeowners.</p>
              <form className="subscribe" onSubmit={subscribe}>
                <input type="email" placeholder="Your email" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} required />
                <button className="btn btn-blue" type="submit">Join</button>
              </form>
              {subMsg && <p style={{ marginTop: 8, fontSize: '0.85rem' }}>{subMsg}</p>}
            </div>
          </div>

          <div className="footer-mesh">
            <h4>Popular Service Areas</h4>
            <div className="link-mesh">
              {CITIES.slice(0, 32).map((c) => (
                <Link key={c.slug} to={`/cleaning-services/${c.slug}`}>
                  Cleaning Services {c.name}
                </Link>
              ))}
            </div>
            <p style={{ marginTop: 16 }}>
              <Link to="/locations" style={{ color: '#fff', fontWeight: 700 }}>
                View all {CITIES.length} service areas →
              </Link>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          Copyright © {new Date().getFullYear()} Dozeles Professional Cleaning. All Rights Reserved. ·
          Commercial &amp; Residential Janitorial Services · Bay Area &amp; Northern California
        </div>
      </footer>
    </>
  );
}
