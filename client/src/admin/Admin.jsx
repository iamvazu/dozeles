import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const SECTIONS = ['site', 'home', 'whyUs', 'services', 'servicesPage', 'about', 'stats', 'government', 'faqs', 'beforeAfter', 'gallery'];
const STATUSES = ['pending', 'confirmed', 'done', 'cancelled'];

export default function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem('dz_token'));
  return token ? <Dashboard onLogout={() => { sessionStorage.removeItem('dz_token'); setToken(null); }} /> : <Login onLogin={setToken} />;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const { token } = await api.post('/api/auth/login', { email, password });
      sessionStorage.setItem('dz_token', token);
      onLogin(token);
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="admin-wrap">
      <form className="form card login-card" onSubmit={submit}>
        <h2>Dozeles Admin</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-green" type="submit">Sign In</button>
        {err && <div className="form-note err">{err}</div>}
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>← Back to site</Link>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('bookings');
  return (
    <div className="admin-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Dozeles Admin</h2>
        <div>
          <Link to="/" style={{ marginRight: 16, color: 'var(--muted)' }}>View site</Link>
          <button className="btn btn-outline" onClick={onLogout}>Log out</button>
        </div>
      </div>
      <div className="admin-tabs">
        {['bookings', 'messages', 'reviews', 'subscribers', 'content'].map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'bookings' && <Bookings />}
      {tab === 'messages' && <Messages />}
      {tab === 'reviews' && <ReviewsAdmin />}
      {tab === 'subscribers' && <Subscribers />}
      {tab === 'content' && <ContentEditor />}
    </div>
  );
}

function Bookings() {
  const [rows, setRows] = useState([]);
  const load = () => api.get('/api/admin/bookings').then(setRows).catch(console.error);
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    await api.patch(`/api/admin/bookings/${id}`, { status });
    load();
  }

  return (
    <table className="table">
      <thead>
        <tr><th>When</th><th>Customer</th><th>Service</th><th>Date</th><th>Details</th><th>Status</th></tr>
      </thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan="6">No bookings yet.</td></tr>}
        {rows.map((b) => (
          <tr key={b.id}>
            <td>{new Date(b.createdAt).toLocaleString()}</td>
            <td>{b.name}<br /><small>{b.phone}{b.email ? ` · ${b.email}` : ''}</small></td>
            <td>{b.service}</td>
            <td>{b.date} {b.time}</td>
            <td><small>{b.address}{b.notes ? ` — ${b.notes}` : ''}</small></td>
            <td>
              <span className={`pill ${b.status}`}>{b.status}</span><br />
              <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value)} style={{ marginTop: 6 }}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Messages() {
  const [rows, setRows] = useState([]);
  const load = () => api.get('/api/admin/messages').then(setRows).catch(console.error);
  useEffect(() => { load(); }, []);

  async function toggleRead(m) {
    await api.patch(`/api/admin/messages/${m.id}`, { read: !m.read });
    load();
  }

  return (
    <table className="table">
      <thead><tr><th>When</th><th>From</th><th>Message</th><th>Read</th></tr></thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan="4">No messages yet.</td></tr>}
        {rows.map((m) => (
          <tr key={m.id} style={{ opacity: m.read ? 0.6 : 1 }}>
            <td>{new Date(m.createdAt).toLocaleString()}</td>
            <td>{m.name}<br /><small>{m.email}{m.phone ? ` · ${m.phone}` : ''}</small></td>
            <td>{m.message}</td>
            <td><input type="checkbox" checked={m.read} onChange={() => toggleRead(m)} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReviewsAdmin() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({ name: '', rating: 5, text: '', image: '' });
  const load = () => api.get('/api/reviews').then(setRows).catch(console.error);
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    await api.post('/api/admin/reviews', { ...draft, rating: Number(draft.rating) });
    setDraft({ name: '', rating: 5, text: '', image: '' });
    load();
  }
  async function remove(id) {
    if (confirm('Delete this review?')) { await api.del(`/api/admin/reviews/${id}`); load(); }
  }

  return (
    <>
      <form className="form card" onSubmit={add} style={{ marginBottom: 24 }}>
        <h3>Add review</h3>
        <div className="form-row">
          <input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          <input type="number" min="1" max="5" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: e.target.value })} />
        </div>
        <input placeholder="Photo URL (optional)" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
        <textarea placeholder="Review text" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} required />
        <button className="btn btn-green">Add</button>
      </form>
      <table className="table">
        <thead><tr><th>Name</th><th>Rating</th><th>Text</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{'★'.repeat(r.rating || 5)}</td>
              <td>{r.text}</td>
              <td><button className="btn btn-outline" onClick={() => remove(r.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Subscribers() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get('/api/admin/subscribers').then(setRows).catch(console.error); }, []);
  return (
    <table className="table">
      <thead><tr><th>Email</th><th>Since</th></tr></thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan="2">No subscribers yet.</td></tr>}
        {rows.map((s) => (
          <tr key={s.email}><td>{s.email}</td><td>{new Date(s.createdAt).toLocaleDateString()}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

function ContentEditor() {
  const [section, setSection] = useState('site');
  const [text, setText] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get('/api/content').then((c) => setText(JSON.stringify(c[section], null, 2))).catch(console.error);
    setMsg(null);
  }, [section]);

  async function save() {
    try {
      const parsed = JSON.parse(text);
      await api.put(`/api/admin/content/${section}`, parsed);
      setMsg({ ok: true, msg: 'Saved. The site will show the update on next load.' });
    } catch (e) {
      setMsg({ ok: false, msg: e.message });
    }
  }

  return (
    <div>
      <p style={{ marginBottom: 12, color: 'var(--muted)', fontSize: '0.9rem' }}>
        Edit any section of the website content below (JSON). Change text, add services, update images — then Save.
      </p>
      <div className="admin-tabs">
        {SECTIONS.map((s) => (
          <button key={s} className={section === s ? 'on' : ''} onClick={() => setSection(s)}>{s}</button>
        ))}
      </div>
      <textarea className="admin-json" value={text} onChange={(e) => setText(e.target.value)} spellCheck="false" />
      <div style={{ marginTop: 12 }}>
        <button className="btn btn-green" onClick={save}>Save {section}</button>
      </div>
      {msg && <div className={`form-note ${msg.ok ? 'ok' : 'err'}`} style={{ marginTop: 10 }}>{msg.msg}</div>}
    </div>
  );
}
