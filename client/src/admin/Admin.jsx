import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { LayoutDashboard, CalendarCheck, MessageSquare, Users, Edit3, Star, LogOut, X, Mail, Shield, ChevronLeft, ChevronRight, DollarSign, Menu, Paperclip, FileText, Upload } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';

const SECTIONS = ['site', 'home', 'whyUs', 'services', 'servicesPage', 'about', 'stats', 'government', 'faqs', 'beforeAfter', 'gallery'];
const STATUSES = ['pending', 'quoted', 'scheduled', 'in-progress', 'completed', 'cancelled'];

function decodeToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export default function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem('dz_token'));
  const user = decodeToken(token);

  if (!token || !user) {
    return <Login onLogin={setToken} />;
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={() => { 
        sessionStorage.removeItem('dz_token'); 
        setToken(null); 
      }} 
    />
  );
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
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/images/dozeles-logo.png" alt="Dozeles Logo" style={{ maxHeight: 60 }} />
        </div>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-blue" style={{ width: '100%' }} type="submit">Sign In</button>
        {err && <div className="form-note err">{err}</div>}
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', display: 'block', marginTop: 10 }}>← Back to site</Link>
      </form>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);

  let navs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
    { id: 'bookings', label: 'Bookings & Jobs', icon: <CalendarCheck /> }
  ];

  if (user.role === 'admin') {
    navs = navs.concat([
      { id: 'messages', label: 'Messages', icon: <MessageSquare /> },
      { id: 'reviews', label: 'Reviews', icon: <Star /> },
      { id: 'users', label: 'Team & Staff', icon: <Shield /> },
      { id: 'subscribers', label: 'Subscribers', icon: <Users /> },
      { id: 'pricing', label: 'Pricing Engine', icon: <DollarSign /> },
      { id: 'content', label: 'Website Content', icon: <Edit3 /> },
    ]);
  }

  // Fallback if staff tries to access unauthorized tab
  if (!navs.find(n => n.id === tab)) setTab('overview');

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-logo">
          <img src="/images/dozeles-logo.png" alt="Dozeles" />
        </div>
        
        <div className="admin-sidebar-user">
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Logged in as</div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{user.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--blue)', fontWeight: 600, textTransform: 'uppercase' }}>{user.role}</div>
        </div>

        <nav className="admin-nav">
          {navs.map(n => (
            <button
              key={n.id}
              className={`admin-nav-item ${tab === n.id ? 'active' : ''}`}
              onClick={() => setTab(n.id)}
            >
              {n.icon} <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'grid', gap: '8px' }}>
          <Link to="/" target="_blank" rel="noopener noreferrer" className="admin-nav-item" style={{ justifyContent: 'center' }}>
            <span>View Live Site</span>
          </Link>
          <button className="admin-nav-item" style={{ color: '#b3261e' }} onClick={onLogout}>
            <LogOut /> <span>Log Out</span>
          </button>
        </div>
      </aside>
      
      <main className="admin-main">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setCollapsed(!collapsed)} className="btn btn-outline" style={{ padding: '8px', border: 'none' }}>
              <Menu size={20} />
            </button>
            <h1>{navs.find(n => n.id === tab)?.label || 'Dashboard'}</h1>
          </div>
        </div>

        {tab === 'overview' && <Overview user={user} setTab={setTab} />}
        {tab === 'bookings' && <Bookings user={user} />}
        {tab === 'messages' && <Messages />}
        {tab === 'reviews' && <ReviewsAdmin />}
        {tab === 'users' && <UsersAdmin user={user} />}
        {tab === 'subscribers' && <Subscribers />}
        {tab === 'pricing' && <PricingAdmin />}
        {tab === 'content' && <ContentEditor />}
      </main>
    </div>
  );
}

function Overview({ user, setTab }) {
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    api.get('/api/admin/bookings').then(setBookings).catch(console.error);
  }, []);

  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending').length, [bookings]);
  const estimatedRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => {
      // Only count revenue for jobs this month that aren't cancelled
      if (b.status !== 'cancelled' && b.status !== 'pending' && b.price) {
        const bDate = new Date(b.date);
        if (isSameMonth(bDate, currentMonth)) {
          return sum + Number(b.price);
        }
      }
      return sum;
    }, 0);
  }, [bookings, currentMonth]);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => setTab('bookings')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ background: '#fff4dd', color: '#a06a00' }}><CalendarCheck size={20} /></div>
          <div className="kpi-info">
            <div className="kpi-value">{pendingBookings}</div>
            <div className="kpi-label">Pending Bookings</div>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#e8f1fd', color: '#0A4BB0' }}><CalendarCheck size={20} /></div>
          <div className="kpi-info">
            <div className="kpi-value">{bookings.length}</div>
            <div className="kpi-label">Total Jobs</div>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#e8f7f0', color: '#138a4d' }}><DollarSign size={20} /></div>
            <div className="kpi-info">
              <div className="kpi-value">${estimatedRevenue.toLocaleString()}</div>
              <div className="kpi-label">Est. Revenue ({format(currentMonth, 'MMM')})</div>
            </div>
          </div>
        )}
      </div>

      <div className="calendar-card">
        <div className="calendar-header">
          <h3 style={{ margin: 0, fontFamily: 'var(--font-body)' }}>{format(currentMonth, 'MMMM yyyy')}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" style={{ padding: 6 }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={20} /></button>
            <button className="btn btn-outline" style={{ padding: 6 }} onClick={() => setCurrentMonth(new Date())}>Today</button>
            <button className="btn btn-outline" style={{ padding: 6 }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}
          {calendarDays.map(day => {
            const dayBookings = bookings.filter(b => b.date === format(day, 'yyyy-MM-dd'));
            return (
              <div key={day.toString()} className={`calendar-day ${!isSameMonth(day, monthStart) ? 'other-month' : ''}`}>
                <div className="calendar-day-num">{format(day, 'd')}</div>
                {dayBookings.map(b => (
                  <div key={b.id} className={`calendar-event ${b.status}`} title={`${b.service} - ${b.name}`}>
                    {b.time || 'TBD'} - {b.name.split(' ')[0]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
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

function Bookings({ user }) {
  const [rows, setRows] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [price, setPrice] = useState(0);
  const [priceSaved, setPriceSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);

  const load = () => api.get('/api/admin/bookings').then(setRows).catch(console.error);
  useEffect(() => { load(); }, []);

  function viewItem(b) {
    setActiveItem(b);
    setPrice(b.price || 0);
    setNewNote('');
  }

  async function updateBooking(field, value) {
    const payload = {};
    if (field === 'status') payload.status = value;
    if (field === 'price') payload.price = value;
    if (field === 'note') payload.addNote = value;

    const res = await api.patch(`/api/admin/bookings/${activeItem.id}`, payload);
    setActiveItem(res);
    if (field === 'price') {
      setPrice(res.price || 0);
      setPriceSaved(true);
      setTimeout(() => setPriceSaved(false), 2000);
    }
    if (field === 'note') setNewNote('');
    load();
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`/api/admin/bookings/${activeItem.id}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('dz_token')}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActiveItem(data);
      load();
    } catch (err) {
      alert(err.message);
    }
    setUploading(false);
  }

  async function generateInvoice() {
    try {
      const res = await api.post(`/api/admin/bookings/${activeItem.id}/invoice`, {});
      setInvoiceSent(true);
      setTimeout(() => setInvoiceSent(false), 3000);
      setActiveItem(res.booking);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="table-card">
        <table className="table">
          <thead>
            <tr><th>Customer</th><th>Service</th><th>Service Date</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="5">No bookings found.</td></tr>}
            {rows.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.name}</strong><br/><small style={{ color: 'var(--muted)' }}>{b.phone}</small></td>
                <td>{b.service}</td>
                <td>{b.date} {b.time}</td>
                <td><span className={`pill ${b.status}`}>{b.status}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => viewItem(b)}>Manage Job</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeItem && (
        <Modal title={`Manage Job: ${activeItem.service}`} onClose={() => setActiveItem(null)}>
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
            
            <div className="detail-row">
              <span className="detail-label">Address</span>
              <div className="detail-value-box" style={{ padding: 12 }}>{activeItem.address || 'Not provided'}</div>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Customer Request Notes</span>
              <div className="detail-value-box" style={{ padding: 12, background: '#fff4dd', color: '#a06a00' }}>{activeItem.notes || 'No customer notes provided.'}</div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed var(--line)', margin: '10px 0' }} />

            <h4 style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '1.1rem' }}>Internal Workflow</h4>
            
            <div className="form-row" style={{ alignItems: 'flex-end' }}>
              <div className="detail-row">
                <span className="detail-label">Job Status</span>
                <select className="form-select" value={activeItem.status} onChange={(e) => updateBooking('status', e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
              {user.role === 'admin' && (
                <div className="detail-row">
                  <span className="detail-label">Quoted Price ($)</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', width: 100 }} />
                    <button 
                      className={`btn ${priceSaved ? 'btn-outline' : 'btn-blue'}`}
                      style={priceSaved ? { borderColor: '#138a4d', color: '#138a4d' } : {}}
                      onClick={() => updateBooking('price', price)}
                    >
                      {priceSaved ? 'Saved!' : 'Save Price'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {user.role === 'admin' && (
              <div className="detail-row" style={{ marginTop: 10 }}>
                <span className="detail-label">Customer Invoicing</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="btn btn-outline" onClick={generateInvoice} disabled={!activeItem.email}>
                    <FileText size={16} style={{ marginRight: 6 }} /> 
                    {invoiceSent ? 'Invoice Sent!' : 'Generate & Email Invoice'}
                  </button>
                  {activeItem.invoiceSentAt && (
                    <small style={{ color: 'var(--muted)' }}>Last sent: {new Date(activeItem.invoiceSentAt).toLocaleString()}</small>
                  )}
                </div>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">Job Attachments</span>
              <div className="internal-notes" style={{ marginBottom: 12 }}>
                {!activeItem.attachments || activeItem.attachments.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>No files attached.</div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {activeItem.attachments.map(att => (
                      <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                        <Paperclip size={14} style={{ marginRight: 4 }} /> {att.originalName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <label className="btn btn-outline" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                <Upload size={16} style={{ marginRight: 6 }} />
                {uploading ? 'Uploading...' : 'Upload File'}
                <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>

            <div className="detail-row">
              <span className="detail-label">Team Notes / Updates</span>
              
              <div className="internal-notes">
                {!activeItem.internalNotes || activeItem.internalNotes.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>No internal notes yet.</div>
                ) : (
                  activeItem.internalNotes.map(n => (
                    <div key={n.id} className="note-item">
                      <div className="note-meta">
                        <strong>{n.author}</strong>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <div>{n.text}</div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input 
                  type="text" 
                  placeholder="Add a new update or note..." 
                  value={newNote} 
                  onChange={e => setNewNote(e.target.value)} 
                  onKeyDown={e => { if (e.key === 'Enter') updateBooking('note', newNote) }}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}
                />
                <button className="btn btn-outline" disabled={!newNote.trim()} onClick={() => updateBooking('note', newNote)}>Add Note</button>
              </div>
            </div>

          </div>
        </Modal>
      )}
    </>
  );
}

function UsersAdmin({ user }) {
  const [users, setUsers] = useState([]);
  const [draft, setDraft] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [err, setErr] = useState('');

  const load = () => api.get('/api/admin/users').then(setUsers).catch(console.error);
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/api/admin/users', draft);
      setDraft({ name: '', email: '', password: '', role: 'staff' });
      load();
    } catch (err) {
      setErr(err.message);
    }
  }

  async function remove(id) {
    if (confirm('Remove this staff member?')) {
      try {
        await api.del(`/api/admin/users/${id}`);
        load();
      } catch (err) {
        alert(err.message);
      }
    }
  }

  return (
    <>
      <form className="form card" onSubmit={add} style={{ marginBottom: 30, maxWidth: 800 }}>
        <h3 style={{ marginBottom: 16 }}>Add Team Member</h3>
        <div className="form-row">
          <input placeholder="Full Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="form-select" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
            <option value="staff">Staff (Bookings Only)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
        </div>
        <div className="form-row">
          <input type="email" placeholder="Email Address" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} required />
          <input type="password" placeholder="Temporary Password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} required />
        </div>
        <div>
          <button className="btn btn-blue">Create User Account</button>
          {err && <span style={{ color: '#b3261e', marginLeft: 16, fontSize: '0.85rem' }}>{err}</span>}
        </div>
      </form>
      
      <div className="table-card">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan="5">No users found.</td></tr>}
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><span className={`pill ${u.role === 'admin' ? 'done' : 'pending'}`}>{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  {u.id !== user.id && (
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#b3261e', color: '#b3261e' }} onClick={() => remove(u.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function PricingAdmin() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/pricing').then(c => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const handleChange = (cat, key, value) => {
    setConfig(c => ({ ...c, [cat]: { ...c[cat], [key]: Number(value) } }));
  };

  const handleComChange = (key, value) => {
    setConfig(c => ({ ...c, [key]: Number(value) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/api/pricing', config);
      alert('Pricing updated successfully!');
    } catch (e) {
      alert('Error saving pricing: ' + e.message);
    }
    setSaving(false);
  };

  if (loading) return <div>Loading pricing engine...</div>;

  return (
    <div className="card" style={{ maxWidth: 800 }}>
      <h2 style={{ marginBottom: 20 }}>Pricing Engine</h2>
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: 'var(--blue)', marginBottom: 15 }}>Residential Pricing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <div>
            <label className="form-note">Base Price ($)</label>
            <input type="number" value={config?.RES?.BASE || 0} onChange={e => handleChange('RES', 'BASE', e.target.value)} />
          </div>
          <div>
            <label className="form-note">Per Bedroom ($)</label>
            <input type="number" value={config?.RES?.PER_BED || 0} onChange={e => handleChange('RES', 'PER_BED', e.target.value)} />
          </div>
          <div>
            <label className="form-note">Per Bathroom ($)</label>
            <input type="number" value={config?.RES?.PER_BATH || 0} onChange={e => handleChange('RES', 'PER_BATH', e.target.value)} />
          </div>
          <div>
            <label className="form-note">Minimum Price ($)</label>
            <input type="number" value={config?.RES?.MIN || 0} onChange={e => handleChange('RES', 'MIN', e.target.value)} />
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: 'var(--blue)', marginBottom: 15 }}>Commercial Pricing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <div>
            <label className="form-note">Minimum Monthly ($)</label>
            <input type="number" value={config?.COM_MIN_MONTHLY || 0} onChange={e => handleComChange('COM_MIN_MONTHLY', e.target.value)} />
          </div>
        </div>
      </div>
      
      <button className="btn btn-blue" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Pricing Config'}</button>
    </div>
  );
}
