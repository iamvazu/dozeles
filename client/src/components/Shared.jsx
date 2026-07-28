import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { api } from '../api.js';

export function PageBanner({ title, crumb }) {
  return (
    <div className="banner">
      <div className="container">
        <h1>{title}</h1>
        <div className="crumbs">
          <Link to="/">Home</Link> / {crumb || title}
        </div>
      </div>
    </div>
  );
}

export function CtaBand() {
  return (
    <div className="cta-band">
      <div className="container">
        <h2>Ready To Book Your Cleaning?</h2>
        <Link to="/book" className="btn btn-white">Book Now</Link>{' '}
        <Link to="/contact-us" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff', marginLeft: 10 }}>
          Contact Us
        </Link>
      </div>
    </div>
  );
}

export function CountUp({ value }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;

    const run = () => {
      const t0 = performance.now();
      const dur = 1400;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    // Graceful fallback: no IntersectionObserver (older browsers / SSR / tests)
    // or reduced-motion -> show the final number immediately.
    if (typeof window === 'undefined' || !('IntersectionObserver' in window) || !el) {
      setN(value);
      return;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setN(value);
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      run();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
}

export function Stats() {
  const { stats } = useContent();
  return (
    <section className="stats">
      <div className="container">
        <h2 className="h2 center">{stats.heading}</h2>
        <div className="grid grid-4">
          {stats.items.map((s) => (
            <div className="stat" key={s.label}>
              <div className="num"><CountUp value={s.value} />+</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ heading = 'What People Say About Us' }) {
  const { reviews } = useContent();
  return (
    <section className="section-alt">
      <div className="container">
        <div className="center" style={{ marginBottom: 40 }}>
          <div className="eyebrow">Testimonials</div>
          <h2 className="h2">{heading}</h2>
        </div>
        <div className="grid grid-3">
          {reviews.map((r) => (
            <div className="t-card" key={r.id}>
              <div className="starrow">{'★'.repeat(r.rating || 5)}</div>
              <p>{r.text}</p>
              <div className="t-who">
                {r.image && <img src={r.image} alt={r.name} loading="lazy" />}
                <strong>{r.name}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuoteForm({ compact = false }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [state, setState] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState(null);
    try {
      await api.post('/api/contact', form);
      setState({ ok: true, msg: "Thank you! We received your message and we'll get back to you shortly." });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setState({ ok: false, msg: err.message });
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      {compact ? (
        <>
          <input placeholder="Name" value={form.name} onChange={set('name')} required />
          <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        </>
      ) : (
        <div className="form-row">
          <input placeholder="Name" value={form.name} onChange={set('name')} required />
          <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        </div>
      )}
      <input placeholder="Phone" value={form.phone} onChange={set('phone')} />
      <textarea placeholder="Message" value={form.message} onChange={set('message')} required />
      <div>
        <button className="btn btn-green" type="submit">Submit Now</button>
      </div>
      {state && <div className={`form-note ${state.ok ? 'ok' : 'err'}`}>{state.msg}</div>}
    </form>
  );
}
