import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { 
  LayoutDashboard, CalendarCheck, Calendar, MessageSquare, Users, 
  Edit3, Star, LogOut, X, Mail, Shield, ChevronLeft, 
  ChevronRight, DollarSign, Menu, Paperclip, FileText, 
  Upload, Building2, Download, Smartphone, Target, Briefcase, Layers,
  Search, Filter, CheckCircle2, Clock, Trash2, Plus, ExternalLink, Send, Activity, Sparkles
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import ServiceQuote from './ServiceQuote.jsx';
import ProjectsView from './ProjectsView.jsx';
import LeadsView from './LeadsView.jsx';
import CustomersView from './CustomersView.jsx';
import UsersAdminView from './UsersAdminView.jsx';
import PricingAdminView from './PricingAdminView.jsx';
import ContentEditorView from './ContentEditorView.jsx';
import WalkthroughAuditView from './WalkthroughAuditView.jsx';
import FacilityAuditsView from './FacilityAuditsView.jsx';

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
          <img src="/images/dozeles-logo.jpg" alt="Dozeles Logo" style={{ maxHeight: 60 }} />
        </div>
        <input type="text" placeholder="Email or Username" value={email} onChange={(e) => setEmail(e.target.value)} autoCapitalize="none" autoCorrect="off" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-blue" style={{ width: '100%' }} type="submit">Sign In</button>
        {err && <div className="form-note err">{err}</div>}
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', display: 'block', marginTop: 10 }}>← Back to site</Link>
      </form>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const initialTab = user?.role === 'janitor' ? 'projects' : 'overview';
  const [tab, setTab] = useState(initialTab);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [selectedLeadForAudit, setSelectedLeadForAudit] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) {
      alert('To install the Dozeles Admin App:\n• On iOS Safari: Tap Share -> "Add to Home Screen"\n• On Android/Chrome: Tap Menu (3 dots) -> "Install app"');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const handleNavClick = (navId) => {
    setTab(navId);
    setMobileOpen(false);
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  let navs = [];

  if (user?.role === 'janitor') {
    navs = [
      { id: 'audits', label: 'Walkthrough Audit', icon: <Sparkles size={19} color="#60a5fa" /> },
      { id: 'projects', label: 'Projects & Photos', icon: <Building2 size={19} /> },
      { id: 'bookings', label: 'Assigned Schedule', icon: <CalendarCheck size={19} /> },
      { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard size={19} /> },
    ];
  } else {
    navs = [
      { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={19} /> },
      { id: 'audits', label: 'Walkthrough Audit', icon: <Sparkles size={19} color="#60a5fa" /> },
      { id: 'leads', label: 'Leads & Pipeline', icon: <Target size={19} /> },
      { id: 'customers', label: 'Customers & CRM', icon: <Users size={19} /> },
      { id: 'projects', label: 'Projects & Photos', icon: <Building2 size={19} /> },
      { id: 'quotes', label: 'Service Quotes', icon: <FileText size={19} /> },
      { id: 'bookings', label: 'Bookings & Jobs', icon: <CalendarCheck size={19} /> },
      { id: 'messages', label: 'Inquiries & Messages', icon: <MessageSquare size={19} /> },
      { id: 'reviews', label: 'Client Reviews', icon: <Star size={19} /> },
      { id: 'users', label: 'Team & Field Staff', icon: <Shield size={19} /> },
      { id: 'subscribers', label: 'Newsletter Subscribers', icon: <Users size={19} /> },
      { id: 'pricing', label: 'Pricing Calculator', icon: <DollarSign size={19} /> },
      { id: 'content', label: 'Website CMS', icon: <Edit3 size={19} /> },
    ];
  }

  if (!navs.find(n => n.id === tab)) setTab(navs[0].id);

  // User initials for avatar
  const initials = (user?.name || 'Admin')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const activeNav = navs.find(n => n.id === tab);

  return (
    <div className="modern-admin-layout">
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${mobileOpen ? 'show' : ''}`} 
        onClick={() => setMobileOpen(false)} 
      />

      {/* Luxury Dark Sidebar */}
      <aside className={`modern-admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="modern-sidebar-brand">
          {!collapsed ? (
            <div className="sidebar-brand-full">
              <div className="sidebar-logo-card">
                <img 
                  src="/images/dozeles-logo.png" 
                  alt="Dozeles" 
                  className="brand-logo-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/dozeles-logo.jpg';
                  }}
                />
              </div>
              <div className="sidebar-brand-sub">
                Residential, Commercial &amp; Governmental Cleaning Services
              </div>
            </div>
          ) : (
            <div className="sidebar-brand-collapsed" title="Dozeles Cleaning Services">
              <div className="brand-collapsed-logo">
                <img 
                  src="/images/dozeles-logo.png" 
                  alt="Dozeles" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/dozeles-logo.jpg';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modern-nav-section-title">
          {!collapsed && <span>MAIN NAVIGATION</span>}
        </div>

        <nav className="modern-admin-nav">
          {navs.map(n => (
            <button
              key={n.id}
              className={`modern-nav-item ${tab === n.id ? 'active' : ''}`}
              onClick={() => handleNavClick(n.id)}
              title={collapsed ? n.label : undefined}
            >
              <div className="nav-icon-wrap">{n.icon}</div>
              {!collapsed && <span className="nav-label">{n.label}</span>}
              {!collapsed && tab === n.id && <div className="nav-active-pill"></div>}
            </button>
          ))}
        </nav>

        {/* User Profile Card at Bottom */}
        <div className="modern-sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar-circle">
              {initials}
              <span className="user-status-dot"></span>
            </div>
            {!collapsed && (
              <div className="user-info-text">
                <div className="user-name-title">{user?.name || 'Administrator'}</div>
                <div className={`user-role-tag ${user?.role || 'admin'}`}>
                  {user?.role === 'janitor' ? 'FIELD JANITOR' : 'ADMINISTRATOR'}
                </div>
              </div>
            )}
            <button className="sidebar-logout-btn" onClick={onLogout} title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="modern-admin-main">
        {/* Top Header Bar */}
        <header className="modern-top-bar no-print">
          <div className="top-bar-left">
            <button onClick={handleToggleSidebar} className="modern-toggle-btn" title="Toggle Menu">
              <Menu size={18} />
            </button>
            <div className="breadcrumbs-wrap">
              <span className="bc-root">Dozeles Admin</span>
              <span className="bc-sep">/</span>
              <span className="bc-current">{activeNav?.label || 'Dashboard'}</span>
            </div>
          </div>

          <div className="top-bar-right">
            <div className="live-date-pill">
              <Calendar size={14} color="var(--blue)" />
              <span className="live-date-text">{format(new Date(), 'EEEE, MMM d, yyyy')}</span>
              <span className="live-date-compact">{format(new Date(), 'MMM d, yyyy')}</span>
            </div>

            {installPrompt && (
              <button className="top-pwa-btn" onClick={handleInstallApp} title="Install as Desktop/Mobile App">
                <Smartphone size={14} />
                <span>Install</span>
              </button>
            )}

            <Link to="/" target="_blank" rel="noopener noreferrer" className="top-site-link">
              <span>Live Site ↗</span>
            </Link>
          </div>
        </header>

        <div className="modern-content-wrapper">
          {tab === 'overview' && <Overview user={user} setTab={setTab} />}
          {tab === 'audits' && (
            <WalkthroughAuditView 
              user={user} 
              onOpenLeads={() => setTab('leads')} 
              initialLeadForAudit={selectedLeadForAudit} 
            />
          )}
          {tab === 'leads' && (
            <LeadsView 
              user={user} 
              onOpenQuotes={() => setTab('quotes')} 
              onOpenCustomers={() => setTab('customers')} 
              onStartAudit={(lead) => {
                setSelectedLeadForAudit(lead);
                setTab('audits');
              }}
            />
          )}
          {tab === 'customers' && <CustomersView user={user} onOpenProject={(id) => setTab('projects')} onOpenQuote={(id) => setTab('quotes')} />}
          {tab === 'bookings' && <Bookings user={user} setTab={setTab} />}
          {tab === 'quotes' && <ServiceQuote user={user} onBackToBookings={() => setTab('bookings')} />}
          {tab === 'projects' && <ProjectsView user={user} />}
          {tab === 'messages' && (
            <Messages 
              onStartAudit={(lead) => {
                setSelectedLeadForAudit(lead);
                setTab('audits');
              }} 
            />
          )}
          {tab === 'reviews' && <ReviewsAdmin />}
          {tab === 'users' && <UsersAdminView user={user} />}
          {tab === 'subscribers' && <Subscribers />}
          {tab === 'pricing' && <PricingAdminView user={user} />}
          {tab === 'content' && <ContentEditorView user={user} />}
        </div>
      </main>
    </div>
  );
}

function Overview({ user, setTab }) {
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    api.get('/api/admin/bookings').then(setBookings).catch(console.error);
    api.get('/api/admin/projects').then(setProjects).catch(console.error);
    api.get('/api/admin/quotes').then(setQuotes).catch(console.error);
  }, []);

  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending').length, [bookings]);
  const activeProjectsCount = useMemo(() => projects.filter(p => p.status !== 'completed').length, [projects]);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <>
      {/* Prominent AI Facility Audit Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0E5FD8 100%)', borderRadius: '12px', padding: '22px 24px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', boxShadow: '0 8px 24px rgba(14, 95, 216, 0.2)' }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
            <Activity size={13} /> ON-SITE INSPECTION &amp; REPORT SUITE
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            🔬 15-Point Facility Cleanliness &amp; Safety Audit
          </h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5 }}>
            Conduct on-site inspections, log ATP surface readings, capture photos, check Cal/OSHA compliance, and generate an AI-powered report card for the client in under 60 seconds.
          </p>
        </div>
        <button 
          className="btn" 
          style={{ background: '#ffffff', color: '#0e5fd8', fontWeight: 800, padding: '12px 22px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer' }}
          onClick={() => setTab('audits')}
        >
          <Activity size={18} color="#0e5fd8" />
          Conduct New Audit →
        </button>
      </div>

      {/* Sleek Compact Executive KPI Grid */}
      <div className="modern-kpi-grid">
        <div className="modern-kpi-card amber" onClick={() => setTab('bookings')}>
          <div className="kpi-icon-badge amber"><CalendarCheck size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">NEEDS ATTENTION</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{pendingBookings}</span>
              <span className="kpi-label">Pending Bookings</span>
            </div>
          </div>
        </div>
        
        <div className="modern-kpi-card blue" onClick={() => setTab('bookings')}>
          <div className="kpi-icon-badge blue"><CalendarCheck size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">TOTAL LOGGED</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{bookings.length}</span>
              <span className="kpi-label">Client Bookings</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card emerald" onClick={() => setTab('projects')}>
          <div className="kpi-icon-badge emerald"><Building2 size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">FIELD OPERATIONS</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{activeProjectsCount}</span>
              <span className="kpi-label">Active Ongoing Sites</span>
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="modern-kpi-card cyan" onClick={() => setTab('quotes')}>
            <div className="kpi-icon-badge cyan"><FileText size={20} /></div>
            <div className="kpi-info-col">
              <span className="kpi-tag">SERVICE PROPOSALS</span>
              <div className="kpi-val-row">
                <span className="kpi-main-val">{quotes.length}</span>
                <span className="kpi-label">Service Quotes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Card */}
      <div className="modern-calendar-card">
        <div className="modern-calendar-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)' }}>
              Service Schedule &amp; Bookings
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 3 }}>
              {format(currentMonth, 'MMMM yyyy')} Calendar Overview
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-outline" style={{ padding: '6px 10px', borderRadius: 8 }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={18} /></button>
            <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: 8, fontWeight: 700 }} onClick={() => setCurrentMonth(new Date())}>Today</button>
            <button className="btn btn-outline" style={{ padding: '6px 10px', borderRadius: 8 }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="modern-calendar-grid">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="modern-cal-day-header">{d}</div>
          ))}
          {calendarDays.map(day => {
            const dayBookings = bookings.filter(b => b.date === format(day, 'yyyy-MM-dd'));
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toString()} className={`modern-cal-day ${!isSameMonth(day, monthStart) ? 'other-month' : ''} ${isToday ? 'is-today' : ''}`}>
                <div className="modern-cal-day-top">
                  <span className={`day-number ${isToday ? 'today-pill' : ''}`}>{format(day, 'd')}</span>
                  {dayBookings.length > 0 && <span className="day-count-badge">{dayBookings.length}</span>}
                </div>
                <div className="modern-cal-events-list">
                  {dayBookings.map(b => (
                    <div 
                      key={b.id} 
                      className={`modern-cal-event ${b.status}`} 
                      title={`${b.service} - ${b.name}`}
                      onClick={() => setTab('bookings')}
                    >
                      <span className="cal-event-time">{b.time || 'TBD'}</span>
                      <span className="cal-event-client">{b.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
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
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', borderRadius: '12px' }}>
        <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)' }}>{title}</h3>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Bookings({ user, setTab }) {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeItem, setActiveItem] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [price, setPrice] = useState(0);
  const [priceSaved, setPriceSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [quoteGenerating, setQuoteGenerating] = useState(false);

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

  async function handleGenerateOrOpenQuote() {
    setQuoteGenerating(true);
    try {
      await api.post(`/api/admin/quotes/from-booking/${activeItem.id}`, {});
      setActiveItem(null);
      setTab('quotes');
    } catch (err) {
      setActiveItem(null);
      setTab('quotes');
    } finally {
      setQuoteGenerating(false);
    }
  }

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const matchesSearch = !searchTerm || 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, filterStatus]);

  const counts = useMemo(() => ({
    all: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    scheduled: rows.filter(r => r.status === 'scheduled').length,
    inProgress: rows.filter(r => r.status === 'in-progress').length,
    completed: rows.filter(r => r.status === 'completed').length,
  }), [rows]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarCheck size={24} color="var(--blue)" />
            Bookings &amp; Service Jobs
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Direct customer booking requests, appointments, site dispatches, and quote conversions.
          </p>
        </div>
      </div>

      {/* Sleek Compact Bookings KPI Grid */}
      <div className="modern-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="modern-kpi-card blue">
          <div className="kpi-icon-badge blue"><Calendar size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">TOTAL BOOKINGS</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{counts.all}</span>
              <span className="kpi-label">All Jobs</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card amber">
          <div className="kpi-icon-badge amber"><Clock size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">PENDING REVIEW</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{counts.pending}</span>
              <span className="kpi-label">Awaiting</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card cyan">
          <div className="kpi-icon-badge cyan"><CalendarCheck size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">SCHEDULED</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{counts.scheduled}</span>
              <span className="kpi-label">Confirmed</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card emerald">
          <div className="kpi-icon-badge emerald"><CheckCircle2 size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">COMPLETED</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{counts.completed}</span>
              <span className="kpi-label">Fulfilled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search bookings by client, phone, email, service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'scheduled', 'in-progress', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: filterStatus === st ? 'var(--blue)' : 'var(--line)',
                background: filterStatus === st ? 'var(--blue)' : '#ffffff',
                color: filterStatus === st ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-card" style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOMER</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>SERVICE TYPE</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>DATE &amp; TIME</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PRICE</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No bookings found matching current filters.
                </td>
              </tr>
            )}
            {filteredRows.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{b.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{b.phone} • {b.email}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{b.service}</span>
                  {b.address && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{b.address}</div>}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{b.date}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.time || 'Flexible Time'}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontWeight: 700, color: b.price ? '#15803d' : 'var(--text-muted)' }}>
                    {b.price ? `$${Number(b.price).toLocaleString()}` : 'Unquoted'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`pill ${b.status}`} style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '6px', fontWeight: 600 }} 
                    onClick={() => viewItem(b)}
                  >
                    Manage Job
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeItem && (
        <Modal title={`Manage Job: ${activeItem.service}`} onClose={() => setActiveItem(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)' }}>{activeItem.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {activeItem.email && <a href={`mailto:${activeItem.email}`} style={{ color: 'var(--blue)', textDecoration: 'none', marginRight: '12px' }}>✉ {activeItem.email}</a>}
                  {activeItem.phone && <span>📞 {activeItem.phone}</span>}
                </div>
              </div>
              <span className={`pill ${activeItem.status}`} style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.75rem' }}>
                {activeItem.status}
              </span>
            </div>

            {activeItem.address && (
              <div>
                <label className="form-note" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Service Address</label>
                <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.88rem' }}>
                  {activeItem.address}
                </div>
              </div>
            )}

            {activeItem.notes && (
              <div>
                <label className="form-note" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Customer Request Notes</label>
                <div style={{ padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '6px', fontSize: '0.88rem' }}>
                  {activeItem.notes}
                </div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '4px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-note" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Update Status</label>
                <select 
                  value={activeItem.status} 
                  onChange={(e) => updateBooking('status', e.target.value)} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>

              {user?.role === 'admin' && (
                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Quoted Price ($)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="number" 
                      value={price} 
                      onChange={e => setPrice(e.target.value)} 
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.88rem' }} 
                    />
                    <button 
                      className={`btn ${priceSaved ? 'btn-outline' : 'btn-blue'}`}
                      style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}
                      onClick={() => updateBooking('price', price)}
                    >
                      {priceSaved ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button className="btn btn-blue" onClick={handleGenerateOrOpenQuote} disabled={quoteGenerating} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 600 }}>
                  <FileText size={15} /> 
                  {quoteGenerating ? 'Generating...' : 'Convert to Service Quote'}
                </button>
                <button className="btn btn-outline" onClick={generateInvoice} disabled={!activeItem.email} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 600 }}>
                  <Send size={15} /> 
                  {invoiceSent ? 'Invoice Sent!' : 'Send Invoice Email'}
                </button>
              </div>
            )}

            {/* Internal Notes */}
            <div>
              <label className="form-note" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Internal Operations Log</label>
              <div style={{ maxHeight: '160px', overflowY: 'auto', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', marginBottom: '10px' }}>
                {(!activeItem.internalNotes || activeItem.internalNotes.length === 0) ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>No internal notes recorded.</div>
                ) : (
                  activeItem.internalNotes.map(n => (
                    <div key={n.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>{n.author}</strong>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--navy)', marginTop: '2px' }}>{n.text}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Add note for team..." 
                  value={newNote} 
                  onChange={e => setNewNote(e.target.value)} 
                  onKeyDown={e => { if (e.key === 'Enter') updateBooking('note', newNote) }}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.86rem' }}
                />
                <button className="btn btn-outline" disabled={!newNote.trim()} onClick={() => updateBooking('note', newNote)} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem' }}>Add</button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Messages({ onStartAudit }) {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all');
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

  const filtered = useMemo(() => {
    return rows.filter(m => {
      const matchSearch = !searchTerm || 
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRead = filterRead === 'all' || 
        (filterRead === 'unread' && !m.read) || 
        (filterRead === 'read' && m.read);

      return matchSearch && matchRead;
    });
  }, [rows, searchTerm, filterRead]);

  const unreadCount = rows.filter(m => !m.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={24} color="var(--blue)" />
            Inquiries &amp; Customer Messages
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Messages received through the public contact form and quote inquiry requests.
          </p>
        </div>
      </div>

      {/* Sleek Compact Inquiries KPI Grid */}
      <div className="modern-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="modern-kpi-card blue">
          <div className="kpi-icon-badge blue"><MessageSquare size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">TOTAL INQUIRIES</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{rows.length}</span>
              <span className="kpi-label">Received</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card red">
          <div className="kpi-icon-badge red"><Mail size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">UNREAD INQUIRIES</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{unreadCount}</span>
              <span className="kpi-label">Need Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search inquiries by sender, email, text..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilterRead(f)}
              style={{
                padding: '5px 14px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: filterRead === f ? 'var(--blue)' : 'var(--line)',
                background: filterRead === f ? 'var(--blue)' : '#ffffff',
                color: filterRead === f ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Table */}
      <div className="table-card" style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>RECEIVED</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>SENDER</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>MESSAGE PREVIEW</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No messages found.
                </td>
              </tr>
            )}
            {filtered.map((m) => (
              <tr key={m.id} style={{ background: m.read ? '#ffffff' : '#f0f9ff', borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{m.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.email} {m.phone ? `• ${m.phone}` : ''}</div>
                </td>
                <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.message}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`pill ${m.read ? 'done' : 'pending'}`} style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>
                    {m.read ? 'READ' : 'NEW'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '6px', fontWeight: 600 }} 
                    onClick={() => { setActiveItem(m); if (!m.read) toggleRead(m); }}
                  >
                    Read
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeItem && (
        <Modal title={`Message from ${activeItem.name}`} onClose={() => setActiveItem(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
              <div>
                <span className="form-note" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Email Address</span>
                <a href={`mailto:${activeItem.email}`} style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
                  {activeItem.email}
                </a>
              </div>
              <div>
                <span className="form-note" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Phone Number</span>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--navy)' }}>{activeItem.phone || 'Not provided'}</span>
              </div>
            </div>

            <div>
              <span className="form-note" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Message Content</span>
              <div style={{ padding: '14px', background: '#ffffff', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: 'var(--navy)' }}>
                {activeItem.message}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href={`mailto:${activeItem.email}?subject=Dozeles Cleaning Services Follow-Up`} className="btn btn-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 600 }}>
                  <Mail size={15} /> Reply via Email
                </a>
                
                {onStartAudit && (
                  <button 
                    className="btn"
                    style={{ background: 'linear-gradient(135deg, #0e5fd8, #0a4bb0)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    onClick={() => {
                      const sqftMatch = activeItem.message?.match(/Square Footage:\s*([^\n]+)/i);
                      const facilityMatch = activeItem.message?.match(/\(([^\)]+)\)/i);
                      const companyMatch = activeItem.message?.match(/Request for ([^(]+)/i);

                      const leadData = {
                        companyName: companyMatch ? companyMatch[1].trim() : (activeItem.name || 'Commercial Facility'),
                        contactName: activeItem.name || '',
                        email: activeItem.email || '',
                        phone: activeItem.phone || '',
                        facilityType: facilityMatch ? facilityMatch[1].trim() : 'Commercial Office',
                        sqFootage: sqftMatch ? sqftMatch[1].trim() : '4,000 sq.ft.',
                        notes: activeItem.message
                      };
                      setActiveItem(null);
                      onStartAudit(leadData);
                    }}
                  >
                    <Activity size={15} /> 🔬 Start AI Facility Walkthrough Audit
                  </button>
                )}
              </div>

              <button className="btn btn-outline" onClick={() => toggleRead(activeItem)} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem' }}>
                Mark as {activeItem.read ? 'Unread' : 'Read'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ReviewsAdmin() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({ name: '', rating: 5, text: '', image: '' });
  const [submitting, setSubmitting] = useState(false);
  const load = () => api.get('/api/reviews').then(setRows).catch(console.error);
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/admin/reviews', { ...draft, rating: Number(draft.rating) });
      setDraft({ name: '', rating: 5, text: '', image: '' });
      load();
    } catch (err) {
      alert('Error saving review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    if (confirm('Delete this verified review?')) { 
      await api.del(`/api/admin/reviews/${id}`); 
      load(); 
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={24} color="#f59e0b" />
            Client Reviews &amp; Testimonials
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Manage featured customer testimonials and public star reviews displayed on the website.
          </p>
        </div>
      </div>

      {/* Add Review Card */}
      <div className="card" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--line)', borderRadius: '10px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>Add Verified Testimonial</h3>
        <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <label className="form-note" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Customer Name</label>
              <input 
                placeholder="e.g. Sarah Jenkins" 
                value={draft.name} 
                onChange={(e) => setDraft({ ...draft, name: e.target.value })} 
                required 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label className="form-note" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Star Rating (1 - 5)</label>
              <select 
                value={draft.rating} 
                onChange={(e) => setDraft({ ...draft, rating: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
              >
                <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                <option value="4">★★★★☆ (4 Stars - Great)</option>
                <option value="3">★★★☆☆ (3 Stars - Average)</option>
              </select>
            </div>

            <div>
              <label className="form-note" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Reviewer Photo URL (Optional)</label>
              <input 
                placeholder="https://..." 
                value={draft.image} 
                onChange={(e) => setDraft({ ...draft, image: e.target.value })} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div>
            <label className="form-note" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Review / Testimonial Text</label>
            <textarea 
              placeholder="What did the client say about Dozeles cleaning services?" 
              value={draft.text} 
              onChange={(e) => setDraft({ ...draft, text: e.target.value })} 
              required 
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.88rem' }} 
            />
          </div>

          <div>
            <button className="btn btn-blue" disabled={submitting} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '6px', fontWeight: 600 }}>
              <Plus size={16} /> {submitting ? 'Saving...' : 'Publish Testimonial'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Reviews Table */}
      <div className="table-card" style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>CLIENT</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>RATING</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>FEEDBACK</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No reviews published yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{r.name}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '2px' }}>
                    {'★'.repeat(r.rating || 5)}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', maxWidth: '400px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--navy)', lineHeight: '1.4' }}>{r.text}</div>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '4px 10px', fontSize: '0.78rem', borderColor: '#ef4444', color: '#ef4444', borderRadius: '6px' }} 
                    onClick={() => remove(r.id)}
                  >
                    <Trash2 size={13} style={{ marginRight: '4px' }} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Subscribers() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { 
    api.get('/api/admin/subscribers').then(setRows).catch(console.error); 
  }, []);

  const exportCSV = () => {
    if (rows.length === 0) return alert('No subscribers to export.');
    const csvContent = 'data:text/csv;charset=utf-8,' + ['Email,Subscribed Date'].concat(rows.map(s => `${s.email},${new Date(s.createdAt).toISOString()}`)).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dozeles-subscribers-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = rows.filter(s => !searchTerm || s.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={24} color="var(--blue)" />
            Newsletter Subscribers &amp; Email List
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Subscribers who opted in via the website footer newsletter subscription form.
          </p>
        </div>

        <button 
          onClick={exportCSV}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', fontWeight: 600 }}
        >
          <Download size={16} /> Export CSV List
        </button>
      </div>

      {/* KPI & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search email subscribers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>
          {rows.length} Total Registered Subscribers
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="table-card" style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>EMAIL ADDRESS</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>JOIN DATE</th>
              <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No subscribers found.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--navy)' }}>
                  <a href={`mailto:${s.email}`} style={{ color: 'var(--navy)', textDecoration: 'none' }}>
                    {s.email}
                  </a>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className="pill done" style={{ fontSize: '0.72rem', fontWeight: 700 }}>ACTIVE</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
