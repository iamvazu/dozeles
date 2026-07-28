import { useState } from 'react';
import { useContent } from '../content.jsx';
import { PageBanner } from '../components/Shared.jsx';
import { api } from '../api.js';

export default function Booking() {
  const { services, site } = useContent();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', date: '', time: '', address: '', notes: '',
  });
  const [state, setState] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState(null);
    try {
      await api.post('/api/bookings', form);
      setState({ ok: true, msg: `Booking request received! We'll confirm shortly by phone or email. You can also call us at ${site.phone}.` });
      setForm({ name: '', email: '', phone: '', service: '', date: '', time: '', address: '', notes: '' });
    } catch (err) {
      setState({ ok: false, msg: err.message });
    }
  }

  return (
    <>
      <PageBanner title="Book a Cleaning" crumb="Book Now" />
      <section>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="center" style={{ marginBottom: 32 }}>
            <div className="eyebrow">Online Booking</div>
            <h2 className="h2">Schedule Your Cleaning</h2>
            <p className="lead" style={{ margin: '0 auto' }}>
              Pick a service and a date that works for you — we'll confirm your appointment right away.
            </p>
          </div>
          <form className="form card" onSubmit={submit} style={{ padding: 34 }}>
            <div className="form-row">
              <input placeholder="Full name *" value={form.name} onChange={set('name')} required />
              <input placeholder="Phone *" value={form.phone} onChange={set('phone')} required />
            </div>
            <input type="email" placeholder="Email" value={form.email} onChange={set('email')} />
            <select value={form.service} onChange={set('service')} required>
              <option value="">Select a service *</option>
              {services.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
            </select>
            <div className="form-row">
              <input type="date" value={form.date} onChange={set('date')} required />
              <input type="time" value={form.time} onChange={set('time')} />
            </div>
            <input placeholder="Address" value={form.address} onChange={set('address')} />
            <textarea placeholder="Anything we should know? (size of space, pets, access...)" value={form.notes} onChange={set('notes')} />
            <button className="btn btn-green" type="submit">Request Booking</button>
            {state && <div className={`form-note ${state.ok ? 'ok' : 'err'}`}>{state.msg}</div>}
          </form>
        </div>
      </section>
    </>
  );
}
