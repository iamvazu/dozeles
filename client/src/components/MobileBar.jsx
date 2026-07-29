import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';

/**
 * Persistent mobile action bar.
 * Most janitorial traffic arrives on a phone from Google Maps, Siri, or an AI
 * assistant with high intent — they want to call or price the job immediately.
 * This keeps both actions one thumb-tap away at all times.
 */
export default function MobileBar({ site }) {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Never cover the booking form itself
  const hidden = pathname.startsWith('/book') || pathname.startsWith('/admin');

  return (
    <div className={`mbar ${show && !hidden ? 'in' : ''}`} role="navigation" aria-label="Quick actions">
      <a href={`tel:${site.phoneRaw}`} className="mbar-btn call">
        <Icon name="phone" size={19} />
        <span>Call now</span>
      </a>
      <Link to="/#estimate" className="mbar-btn price">
        <Icon name="badge" size={19} />
        <span>Get price</span>
      </Link>
      <Link to="/book" className="mbar-btn book">
        <Icon name="calendar" size={19} />
        <span>Book</span>
      </Link>
    </div>
  );
}
