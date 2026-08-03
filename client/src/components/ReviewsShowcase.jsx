import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content.jsx';
import Icon from './Icon.jsx';
import Social from './Social.jsx';
import Reveal from './Reveal.jsx';

const SHOTS = [
  '/images/hero_main.png',
  '/images/family_cleaning.png',
  '/images/vacuum_cleaning.png',
  '/images/deep_cleaning.png',
];

const EXTRA_TRUST = [
  { icon: 'leaf', label: 'Green Certified' },
  { icon: 'sparkles', label: 'HEPA Equipped' },
];

const Stars = ({ n = 5 }) => (
  <span className="stars" aria-label={`${n} out of 5 stars`}>
    {'★'.repeat(n)}
  </span>
);

export default function ReviewsShowcase() {
  const { reviews = [], site } = useContent();

  /* ---------- left image carousel ---------- */
  const [shot, setShot] = useState(0);
  const nextShot = useCallback(() => setShot((s) => (s + 1) % SHOTS.length), []);
  const prevShot = () => setShot((s) => (s - 1 + SHOTS.length) % SHOTS.length);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
    const t = setInterval(nextShot, 5200);
    return () => clearInterval(t);
  }, [nextShot]);

  /* ---------- review carousel ---------- */
  const [perView, setPerView] = useState(3);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 900 ? 1 : w < 1180 ? 2 : 3);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const maxIdx = Math.max(0, reviews.length - perView);
  useEffect(() => { setIdx((i) => Math.min(i, maxIdx)); }, [maxIdx]);

  const go = (n) => setIdx(Math.min(maxIdx, Math.max(0, n)));
  const next = useCallback(() => setIdx((i) => (i >= maxIdx ? 0 : i + 1)), [maxIdx]);
  const prev = () => setIdx((i) => (i <= 0 ? maxIdx : i - 1));

  useEffect(() => {
    if (paused || maxIdx === 0) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, next, maxIdx]);

  // swipe support
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let x0 = null;
    const start = (e) => { x0 = e.touches[0].clientX; };
    const end = (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) (dx < 0 ? next : prev)();
      x0 = null;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', end, { passive: true });
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchend', end);
    };
  }, [next, maxIdx]);

  const featured = reviews[shot % Math.max(reviews.length, 1)] || reviews[0];

  return (
    <>
      {/* ================= blue band ================= */}
      <section className="rev-band">
        <span className="why-blob b1" aria-hidden="true" />
        <span className="why-blob b2" aria-hidden="true" />
        <div className="container">
          <div className="rev-top">
            <Reveal variant="left" className="rev-shot-wrap">
              <div className="rev-shot">
                {SHOTS.map((s, i) => (
                  <img
                    key={s}
                    src={s}
                    alt="Dozeles cleaning results in the Bay Area"
                    className={i === shot ? 'on' : ''}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                ))}
                <button className="rev-nav prev" onClick={prevShot} aria-label="Previous photo">
                  <Icon name="caret" size={18} />
                </button>
                <button className="rev-nav next" onClick={nextShot} aria-label="Next photo">
                  <Icon name="caret" size={18} />
                </button>
              </div>

              {featured && (
                <div className="rev-float" key={featured.id}>
                  <Stars n={featured.rating || 5} />
                  <p>{featured.text.length > 120 ? `${featured.text.slice(0, 118).trim()}…` : featured.text}</p>
                  <div className="who">
                    {featured.image && <img src={featured.image} alt={featured.name} loading="lazy" />}
                    <span>
                      <strong>{featured.name}</strong>
                      <span>Verified customer</span>
                    </span>
                    <span className="who-google" title="Review from Google">
                      <Social name="google" size={17} />
                    </span>
                  </div>
                </div>
              )}
            </Reveal>

            <Reveal variant="right" delay={120}>
              <div className="eyebrow">Reviews</div>
              <h2 className="h2">Trusted by Thousands of Homes &amp; Companies</h2>
              <p className="lead">
                Our team is here to answer questions, adjust schedules, and fix anything that is not
                right — quickly and without an argument. Twenty years of Bay Area clients is the
                result of taking that seriously.
              </p>
              <div className="rev-trust">
                {(site.certifications || []).map((c) => (
                  <span className="rev-trust-item" key={c.id} title={c.note}>
                    <Icon name={c.icon} size={20} /> {c.label}
                    {c.number && <em className="rev-cert-no">{c.number}</em>}
                  </span>
                ))}
                {EXTRA_TRUST.map((t) => (
                  <span className="rev-trust-item" key={t.label}>
                    <Icon name={t.icon} size={20} /> {t.label}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= rating badge + carousel ================= */}
      <div className="rev-panel-wrap">
        <div className="container">
          <div className="rev-panel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <a
              className="rev-badge"
              href={site.googleReviewUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="rev-badge-top">
                <Social name="google" size={20} />
                <Stars n={5} />
              </span>
              <strong>Exceptional {site.googleRating || '5.0'} rating</strong>
              <small>Based on {site.googleReviewCount || reviews.length} verified reviews</small>
            </a>

            <div className="rev-carousel" ref={wrapRef}>
              <button className="rev-arrow left" onClick={prev} aria-label="Previous reviews">
                <Icon name="caret" size={20} />
              </button>

              <div className="rev-viewport">
                <div
                  className="rev-track"
                  style={{ transform: `translateX(-${idx * (100 / perView)}%)` }}
                >
                  {reviews.map((r) => (
                    <div className="rev-slide" style={{ flex: `0 0 ${100 / perView}%` }} key={r.id}>
                      <div className="rev-card">
                        <Stars n={r.rating || 5} />
                        <p>{r.text}</p>
                        <div className="who">
                          {r.image && <img src={r.image} alt={r.name} loading="lazy" />}
                          <span>
                            <strong>{r.name}</strong>
                            <span>Posted on Google</span>
                          </span>
                          <span className="who-google" title="Review from Google">
                            <Social name="google" size={17} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="rev-arrow right" onClick={next} aria-label="Next reviews">
                <Icon name="caret" size={20} />
              </button>
            </div>

            {maxIdx > 0 && (
              <div className="rev-dots">
                {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                  <button
                    key={i}
                    className={i === idx ? 'on' : ''}
                    onClick={() => go(i)}
                    aria-label={`Go to review group ${i + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="center" style={{ marginTop: 30 }}>
              <a
                className="rev-google-link"
                href={site.googleReviewUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Social name="google" size={16} /> See all our reviews on Google
              </a>
              <div style={{ marginTop: 18 }}>
                <Link to="/reviews" className="btn btn-blue">Read All Reviews</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
