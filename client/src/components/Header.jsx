import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import Social, { SOCIALS } from './Social.jsx';
import { SERVICES } from '../data/services.js';

const ABOUT_LINKS = [
  { to: '/about-us', label: 'Who We Are', sub: '20+ years in Northern California', icon: 'users' },
  { to: '/cleaning-process', label: 'Cleaning Process', sub: 'Exactly how we work, room by room', icon: 'spray' },
  { to: '/reviews', label: 'Reviews & FAQ', sub: 'What our clients say', icon: 'star' },
  { to: '/before-after', label: 'Before & After', sub: 'See our work', icon: 'image' },
  { to: '/government-contract', label: 'Government Contracts', sub: 'Certified & compliant', icon: 'landmark' },
];

export default function Header({ site }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [acc, setAcc] = useState(null); // mobile accordion: 'services' | 'about'
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close drawer on route change
  useEffect(() => {
    setOpen(false);
    setAcc(null);
  }, [location.pathname]);

  // lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ---------- utility bar ---------- */}
      <div className="topbar">
        <div className="container">
          <div className="tb-group">
            <span className="tb-soc">
              {SOCIALS.map((s) => (
                <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                  <Social name={s.key} size={14} />
                </a>
              ))}
            </span>
            <span className="tb-dot tb-hide-sm" />
            <a href={`mailto:${site.email}`} className="tb-hide-sm"><Icon name="mail" size={14} /> {site.email}</a>
            <span className="tb-dot tb-hide-sm" />
            <span className="tb-badge tb-hide-sm"><Icon name="clock" size={13} /> {site.hours}</span>
          </div>
          <div className="tb-group tb-hide-sm">
            <span className="tb-badge"><Icon name="shield" size={13} /> Licensed &amp; Insured</span>
            <span className="tb-dot" />
            <span className="tb-badge"><Icon name="badge" size={13} /> Women-Certified Business</span>
          </div>
        </div>
      </div>

      {/* ---------- main header ---------- */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container hdr">
          <Link to="/" className="logo">
            <img src={site.logo} alt="Dozeles Professional Cleaning" />
          </Link>

          <nav className="nav-desktop">
            <div className="nav-item">
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
            </div>

            <div className="nav-item wide">
              <button className="nav-link" aria-haspopup="true">
                Services <Icon name="caret" size={11} />
              </button>
              <div className="drop mega">
                {SERVICES.map((s) => (
                  <Link key={s.slug} to={`/services/${s.slug}`} className="drop-link">
                    <span className="di"><Icon name={s.icon} size={17} /></span>
                    <span>
                      {s.short}
                      <small>{s.tagline}</small>
                    </span>
                  </Link>
                ))}
                <Link to="/services-offered" className="drop-foot">
                  View all services <Icon name="arrow" size={15} />
                </Link>
              </div>
            </div>

            <div className="nav-item">
              <NavLink to="/locations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Locations
              </NavLink>
            </div>

            <div className="nav-item">
              <NavLink to="/pricing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Pricing
              </NavLink>
            </div>

            <div className="nav-item">
              <button className="nav-link">
                About <Icon name="caret" size={11} />
              </button>
              <div className="drop" style={{ width: 320 }}>
                {ABOUT_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="drop-link">
                    <span className="di"><Icon name={l.icon} size={17} /></span>
                    <span>
                      {l.label}
                      <small>{l.sub}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="nav-item">
              <NavLink to="/blog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Blog
              </NavLink>
            </div>

            <div className="nav-item">
              <NavLink to="/contact-us" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Contact
              </NavLink>
            </div>
          </nav>

          <div className="hdr-actions">
            <a href={`tel:${site.phoneRaw}`} className="call-chip">
              <span className="ring"><Icon name="phone" size={19} /></span>
              <span>
                <small>Call us today</small>
                <strong>{site.phone}</strong>
              </span>
            </a>

            <Link to="/book" className="btn-quote">
              Free Quote <Icon name="arrow" size={15} />
            </Link>

            <button
              className={`burger ${open ? 'on' : ''}`}
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- mobile drawer ---------- */}
      <div className={`drawer-back ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <img src={site.logo} alt="Dozeles" />
          <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">×</button>
        </div>

        <nav className="drawer-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>

          <button
            className={`drawer-acc-btn ${acc === 'services' ? 'open' : ''}`}
            onClick={() => setAcc(acc === 'services' ? null : 'services')}
          >
            Services <Icon name="caret" size={13} />
          </button>
          <div className={`drawer-sub ${acc === 'services' ? 'open' : ''}`}>
            {SERVICES.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`}>{s.short}</Link>
            ))}
            <Link to="/services-offered" style={{ color: 'var(--blue)', fontWeight: 700 }}>
              View all services →
            </Link>
          </div>

          <NavLink to="/locations" className={({ isActive }) => (isActive ? 'active' : '')}>Locations</NavLink>
          <NavLink to="/pricing" className={({ isActive }) => (isActive ? 'active' : '')}>Pricing</NavLink>

          <button
            className={`drawer-acc-btn ${acc === 'about' ? 'open' : ''}`}
            onClick={() => setAcc(acc === 'about' ? null : 'about')}
          >
            About <Icon name="caret" size={13} />
          </button>
          <div className={`drawer-sub ${acc === 'about' ? 'open' : ''}`}>
            {ABOUT_LINKS.map((l) => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </div>

          <NavLink to="/contact-us" className={({ isActive }) => (isActive ? 'active' : '')}>Contact</NavLink>
        </nav>

        <div className="drawer-foot">
          <Link to="/book" className="btn-quote">
            Get a Free Quote <Icon name="arrow" size={15} />
          </Link>
          <a href={`tel:${site.phoneRaw}`} className="drawer-call">
            <span className="ring"><Icon name="phone" size={19} /></span>
            <span>
              <small>Call us today</small>
              <strong>{site.phone}</strong>
            </span>
          </a>
          <div className="drawer-meta">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <br />
            {site.hours}
          </div>
        </div>
      </aside>
    </>
  );
}
