import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';

/**
 * Persistent mobile action bar.
 * Most janitorial traffic arrives on a phone from Google Maps, Siri, or an AI
 * assistant with high intent — they want to call or price the job immediately.
 * This keeps all three actions one thumb-tap away at all times.
 */
export default function MobileBar({ site }) {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * React Router does NOT scroll to hash fragments on navigation, so a plain
   * <Link to="/#estimate"> silently does nothing. Scroll manually instead, and
   * when we're on another page, navigate home first and scroll once it mounts.
   */
  function goToEstimate(e) {
    e.preventDefault();

    const scrollToCalc = (attempt = 0) => {
      const el = document.getElementById('estimate');
      if (!el) {
        // page still mounting — retry briefly, then give up gracefully
        if (attempt < 12) setTimeout(() => scrollToCalc(attempt + 1), 60);
        return;
      }
      const header = document.querySelector('.header');
      const offset = (header?.offsetHeight || 70) + 12;
      const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({
        top: y,
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth',
      });
    };

    if (pathname === '/') {
      scrollToCalc();
    } else {
      navigate('/');
      // Seo() resets scroll to top on route change; wait for that, then scroll.
      setTimeout(() => scrollToCalc(), 220);
    }
  }

  // Never cover the booking form itself
  const hidden = pathname.startsWith('/book') || pathname.startsWith('/admin');

  return (
    <div className={`mbar ${show && !hidden ? 'in' : ''}`} role="navigation" aria-label="Quick actions">
      <a href={`tel:${site.phoneRaw}`} className="mbar-btn call">
        <Icon name="phone" size={19} />
        <span>Call now</span>
      </a>
      <a href="/#estimate" className="mbar-btn price" onClick={goToEstimate}>
        <Icon name="badge" size={19} />
        <span>Get price</span>
      </a>
      <Link to="/book" className="mbar-btn book">
        <Icon name="calendar" size={19} />
        <span>Book</span>
      </Link>
    </div>
  );
}
