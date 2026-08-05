import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { LayoutDashboard, CalendarCheck, MessageSquare, Users, Edit3, Star, LogOut, X, Mail } from 'lucide-react';

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
    <div className="admin-layout" style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
      <form className="form card login-card" onSubmit={submit}>
        <h2>Dozeles Admin</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-blue" style={{ width: '100%' }} type="submit">Sign In</button>
        {err && <div className="form-note err">{err}</div>}
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', display: 'block', marginTop: 10 }}>← Back to site</Link>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('overview');

  const navs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
    { id: 'bookings', label: 'Bookings', icon: <CalendarCheck /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare /> },
    { id: 'subscribers', label: 'Subscribers', icon: <Users /> },
    { id: 'reviews', label: 'Reviews', icon: <Star /> },
    { id: 'content', label: 'Content', icon: <Edit3 /> },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">Dozeles<span>.</span></div>
        <nav className="admin-nav">
          {navs.map(n => (
            <button
              key={n.id}
              className={`admin-nav-item ${tab === n.id ? 'active' : ''}`}
              onClick={() => setTab(n.id)}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'grid', gap: '8px' }}>
          <Link to="/" className="admin-nav-item" style={{ justifyContent: 'center' }}>View Live Site</Link>
          <button className="admin-nav-item" style={{ color: '#b3261e' }} onClick={onLogout}>
            <LogOut /> Log Out
          </button>
        </div>
      </aside>
      
      <main className="admin-main">
        <div className="admin-header">
          <h1>{navs.find(n => n.id === tab)?.label || 'Dashboard'}</h1>
        </div>

        {tab === 'overview' && <Overview setTab={setTab} />}
        {tab === 'bookings' && <Bookings />}
        {tab === 'messages' && <Messages />}
        {tab === 'reviews' && <ReviewsAdmin />}
        {tab === 'subscribers' && <Subscribers />}
        {tab === 'content' && <ContentEditor />}
      </main>
    </div>
  );
}

function Overview({ setTab }) {
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    api.get('/api/admin/bookings').then(setBookings).catch(console.error);
    api.get('/api/admin/messages').then(setMessages).catch(console.error);
    api.get('/api/admin/subscribers').then(setSubscribers).catch(console.error);
  }, []);

  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending').length, [bookings]);
  const unreadMessages = useMemo(() => messages.filter(m => !m.read).length, [messages]);

  return (
    <div className="kpi-grid">
      <div className="kpi-card" onClick={() => setTab('bookings')} style={{ cursor: 'pointer' }}>
        <div className="kpi-icon" style={{ background: '#fff4dd', color: '#a06a00' }}><CalendarCheck /></div>
        <div className="kpi-value">{pendingBookings}</div>
        <div className="kpi-label">Pending Bookings</div>
      </div>
      <div className="kpi-card" onClick={() => setTab('messages')} style={{ cursor: 'pointer' }}>
        <div className="kpi-icon" style={{ background: '#fdecec', color: '#b3261e' }}><MessageSquare /></div>
        <div className="kpi-value">{unreadMessages}</div>
        <div className="kpi-label">Unread Messages</div>
      </div>
      <div className="kpi-card" onClick={() => setTab('bookings')} style={{ cursor: 'pointer' }}>
        <div className="kpi-icon"><CalendarCheck /></div>
        <div className="kpi-value">{bookings.length}</div>
        <div className="kpi-label">Total Bookings</div>
      </div>
      <div className="kpi-card" onClick={() => setTab('subscribers')} style={{ cursor: 'pointer' }}>
        <div className="kpi-icon" style={{ background: '#e8eef2', color: '#47606f' }}><Users /></div>
        <div className="kpi-value">{subscribers.length}</div>
        <div className="kpi-label">Total Subscribers</div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

function Bookings() {
  const [rows, setRows] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  const load = () => api.get('/api/admin/bookings').then(setRows).catch(console.error);
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    await api.patch(`/api/admin/bookings/${id}`, { status });
    if (activeItem && activeItem.id === id) {
      setActiveItem(prev => ({ ...prev, status }));
    }
    load();
  }

  return (
    <>
      <div className="table-card">
        <table className="table">
          <thead>
            <tr><th>Date Requested</th><th>Customer</th><th>Service</th><th>Service Date</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="6">No bookings found.</td></tr>}
            {rows.map((b) => (
              <tr key={b.id}>
                <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                <td><strong>{b.name}</strong></td>
                <td>{b.service}</td>
                <td>{b.date} {b.time}</td>
                <td><span className={`pill ${b.status}`}>{b.status}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setActiveItem(b)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeItem && (
        <Modal title={`Booking: ${activeItem.service}`} onClose={() => setActiveItem(null)}>
          <div className="detail-grid">
            <div className="detail-row">
              <span className="detail-label">Customer</span>
              <span className="detail-value">{activeItem.name}</span>
            </div>
            <div className="form-row">
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">
                  {activeItem.email ? <a href={`mailto:${activeItem.email}`} style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Mail size={14} /> {activeItem.email}</a> : 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{activeItem.phone || 'N/A'}</span>
              </div>
            </div>
            <div className="form-row">
              <div className="detail-row">
                <span className="detail-label">Service Date</span>
                <span className="detail-value">{activeItem.date} {activeItem.time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <div>
                  <select className="form-select" value={activeItem.status} onChange={(e) => setStatus(activeItem.id, e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-label">Address</span>
              <div className="detail-value-box">{activeItem.address || 'Not provided'}</div>
            </div>
            <div className="detail-row">
              <span className="detail-label">Notes</span>
              <div className="detail-value-box">{activeItem.notes || 'No notes provided.'}</div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Messages() {
  const [rows, setRows] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  const load = () => api.get('/api/admin/messages').then(setRows).catch(console.error);
  useEffect(() => { load(); }, []);

  async function toggleRead(m) {
    const newRead = !m.read;
    await api.patch(`/api/admin/messages/${m.id}`, { read: newRead });
    if (activeItem && activeItem.id === m.id) {
      setActiveItem(prev => ({ ...prev, read: newRead }));
    }
    load();
  }

  return (
    <>
      <div className="table-card">
        <table className="table">
          <thead>
            <tr><th>Received</th><th>Name</th><th>Email</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="5">No messages yet.</td></tr>}
            {rows.map((m) => (
              <tr key={m.id} style={{ opacity: m.read ? 0.6 : 1 }}>
                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                <td><strong>{m.name}</strong></td>
                <td>{m.email}</td>
                <td>{m.read ? <span className="pill done">Read</span> : <span className="pill pending">New</span>}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => { setActiveItem(m); if (!m.read) toggleRead(m); }}>Read</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeItem && (
        <Modal title={`Message from ${activeItem.name}`} onClose={() => setActiveItem(null)}>
          <div className="detail-grid">
            <div className="form-row">
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">
                  <a href={`mailto:${activeItem.email}`} style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Mail size={14} /> {activeItem.email}</a>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{activeItem.phone || 'N/A'}</span>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-label">Message</span>
              <div className="detail-value-box" style={{ whiteSpace: 'pre-wrap' }}>{activeItem.message}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button className="btn btn-outline" onClick={() => toggleRead(activeItem)}>
                Mark as {activeItem.read ? 'Unread' : 'Read'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
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
      <form className="form card" onSubmit={add} style={{ marginBottom: 30, maxWidth: 800 }}>
        <h3 style={{ marginBottom: 16 }}>Add New Review</h3>
        <div className="form-row">
          <input placeholder="Customer Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          <input type="number" min="1" max="5" placeholder="Rating (1-5)" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: e.target.value })} />
        </div>
        <input placeholder="Reviewer Photo URL (optional)" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
        <textarea placeholder="Review text" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} required style={{ minHeight: 100 }} />
        <div>
          <button className="btn btn-blue">Save Review</button>
        </div>
      </form>
      
      <div className="table-card">
        <table className="table">
          <thead><tr><th>Name</th><th>Rating</th><th>Text</th><th></th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="4">No reviews yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td style={{ color: '#f5b301', letterSpacing: 2 }}>{'★'.repeat(r.rating || 5)}</td>
                <td><small>{r.text}</small></td>
                <td style={{ textAlign: 'right' }}><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#b3261e', color: '#b3261e' }} onClick={() => remove(r.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Subscribers() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get('/api/admin/subscribers').then(setRows).catch(console.error); }, []);
  return (
    <div className="table-card">
      <table className="table">
        <thead><tr><th>Email Address</th><th>Date Subscribed</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan="2">No subscribers yet.</td></tr>}
          {rows.map((s) => (
            <tr key={s.email}>
              <td><strong>{s.email}</strong></td>
              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      setMsg({ ok: true, msg: 'Saved successfully! The live site has been updated.' });
    } catch (e) {
      setMsg({ ok: false, msg: 'Invalid JSON format: ' + e.message });
    }
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <p style={{ marginBottom: 20, color: 'var(--muted)', fontSize: '0.95rem' }}>
        Select a section of the website to edit its content via JSON. Make sure the JSON syntax is valid before saving.
      </p>
      <div className="admin-tabs">
        {SECTIONS.map((s) => (
          <button key={s} className={section === s ? 'on' : ''} onClick={() => setSection(s)} style={{ textTransform: 'capitalize' }}>
            {s.replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>
      <textarea className="admin-json" value={text} onChange={(e) => setText(e.target.value)} spellCheck="false" />
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-blue" onClick={save} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Edit3 size={16} /> Save Changes
        </button>
        {msg && <div className={`form-note ${msg.ok ? 'ok' : 'err'}`} style={{ margin: 0 }}>{msg.msg}</div>}
      </div>
    </div>
  );
}
