import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../api.js';
import { 
  FileText, Plus, Printer, Download, Mail, CheckCircle2, 
  Trash2, Edit3, ArrowLeft, Building2, Calendar, ShieldCheck, 
  Sparkles, DollarSign, Check, X, RefreshCw, Search,
  Clock, Award, Layers, ChevronRight, User
} from 'lucide-react';

export default function ServiceQuote({ user, onBackToBookings }) {
  const [quotes, setQuotes] = useState([]);
  const [activeQuote, setActiveQuote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const printRef = useRef();

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/quotes');
      const list = Array.isArray(data) ? data : [];
      setQuotes(list);
      if (list.length > 0) {
        if (!activeQuote) {
          setActiveQuote(list[0]);
        } else {
          const refreshed = list.find(q => q.id === activeQuote.id);
          setActiveQuote(refreshed || list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const handleCreateNew = async () => {
    try {
      const newQuote = await api.post('/api/admin/quotes', {
        clientName: 'New Commercial Client',
        contactName: 'Operations Director',
        serviceName: 'Commercial Janitorial Cleaning'
      });
      setQuotes([newQuote, ...(quotes || [])]);
      setActiveQuote(newQuote);
      setEditData(JSON.parse(JSON.stringify(newQuote)));
      setIsEditing(true);
    } catch (err) {
      alert('Error creating quote: ' + (err.message || err));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await api.put(`/api/admin/quotes/${editData.id}`, editData);
      setQuotes((quotes || []).map(q => q.id === updated.id ? updated : q));
      setActiveQuote(updated);
      setIsEditing(false);
      setEditData(null);
    } catch (err) {
      alert('Error updating quote: ' + (err.message || err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote proposal?')) return;
    try {
      await api.del(`/api/admin/quotes/${id}`);
      const remaining = (quotes || []).filter(q => q.id !== id);
      setQuotes(remaining);
      setActiveQuote(remaining[0] || null);
    } catch (err) {
      alert('Error deleting quote: ' + (err.message || err));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await api.put(`/api/admin/quotes/${id}`, { status: newStatus });
      setQuotes((quotes || []).map(q => q.id === updated.id ? updated : q));
      if (activeQuote?.id === id) setActiveQuote(updated);
    } catch (err) {
      alert('Error changing status: ' + (err.message || err));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper calculation for grand total
  const calculateTotal = (quoteObj) => {
    if (!quoteObj || !quoteObj.items) return 0;
    return quoteObj.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  };

  const totalQuotesValue = useMemo(() => {
    return (quotes || []).reduce((sum, q) => sum + calculateTotal(q), 0);
  }, [quotes]);

  const approvedQuotesValue = useMemo(() => {
    return (quotes || [])
      .filter(q => q.status === 'approved')
      .reduce((sum, q) => sum + calculateTotal(q), 0);
  }, [quotes]);

  const filteredQuotes = (quotes || []).filter(q => {
    const s = search.toLowerCase();
    const matchesSearch = 
      (q.quoteNumber && q.quoteNumber.toLowerCase().includes(s)) ||
      (q.preparedFor?.clientName && q.preparedFor.clientName.toLowerCase().includes(s)) ||
      (q.preparedFor?.contactName && q.preparedFor.contactName.toLowerCase().includes(s)) ||
      (q.programTitle && q.programTitle.toLowerCase().includes(s));
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} color="var(--blue)" />
            Commercial Service Quotes &amp; Proposals
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Generate, customize, and export professional PDF cleaning proposals with itemized scopes and SLA guarantees.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button 
            onClick={handleCreateNew} 
            className="btn btn-blue"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
          >
            <Plus size={16} />
            <span>Create New Quote</span>
          </button>
        )}
      </div>

      {/* Sleek Compact Quotes KPI Grid */}
      <div className="modern-kpi-grid no-print" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="modern-kpi-card emerald">
          <div className="kpi-icon-badge emerald"><CheckCircle2 size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">APPROVED CONTRACT VALUE</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">${approvedQuotesValue.toLocaleString()}</span>
              <span className="kpi-label">Signed Value</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card blue">
          <div className="kpi-icon-badge blue"><FileText size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">TOTAL PROPOSALS</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{quotes.length}</span>
              <span className="kpi-label">In History</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card cyan">
          <div className="kpi-icon-badge cyan"><DollarSign size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">TOTAL PROPOSAL PIPELINE</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">${totalQuotesValue.toLocaleString()}</span>
              <span className="kpi-label">Gross Value</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Quote Directory */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search quote # or client..."
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ width: '100%', paddingLeft: '32px', height: '36px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.84rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-light)', padding: '3px', borderRadius: '6px' }}>
              {['all', 'draft', 'sent', 'approved'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: statusFilter === st ? '#ffffff' : 'transparent',
                    color: statusFilter === st ? 'var(--navy)' : 'var(--text-muted)',
                    boxShadow: statusFilter === st ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '720px', overflowY: 'auto' }}>
            {loading ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Loading quotes...
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No quotes found.
              </div>
            ) : (
              filteredQuotes.map(q => {
                const isSelected = activeQuote?.id === q.id;
                const total = calculateTotal(q);

                return (
                  <div
                    key={q.id}
                    onClick={() => { setActiveQuote(q); setIsEditing(false); }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: isSelected ? 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)' : '#ffffff',
                      border: isSelected ? '1.5px solid var(--blue)' : '1px solid var(--line)',
                      boxShadow: isSelected ? '0 4px 12px rgba(14, 95, 216, 0.08)' : '0 1px 2px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '0.82rem' }}>{q.quoteNumber}</span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '12px',
                        background: q.status === 'approved' ? '#dcfce7' : q.status === 'sent' ? '#e0f2fe' : '#f1f5f9',
                        color: q.status === 'approved' ? '#15803d' : q.status === 'sent' ? '#0369a1' : '#475569'
                      }}>
                        {q.status?.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.92rem', marginTop: '4px' }}>
                      {q.preparedFor?.clientName || 'Commercial Client'}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {q.preparedFor?.facilityType || 'Commercial Facility'} • {q.date}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.04)', fontSize: '0.76rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '0.94rem' }}>
                        ${total.toLocaleString()}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {q.items?.length || 0} Scope Items
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Quote Document & Command Panel */}
        <div>
          {activeQuote ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Sleek Top Action Header Bar (No wrapped text or clunky buttons) */}
              <div className="card no-print" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>
                        {activeQuote.quoteNumber}
                      </h3>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: activeQuote.status === 'approved' ? '#dcfce7' : activeQuote.status === 'sent' ? '#e0f2fe' : '#f1f5f9',
                        color: activeQuote.status === 'approved' ? '#15803d' : activeQuote.status === 'sent' ? '#0369a1' : '#475569'
                      }}>
                        {activeQuote.status?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Prepared for <strong>{activeQuote.preparedFor?.clientName}</strong> • Valid until {activeQuote.validUntil}
                    </div>
                  </div>

                  {/* Refined Action Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      className="form-select"
                      value={activeQuote.status}
                      onChange={e => handleStatusChange(activeQuote.id, e.target.value)}
                      style={{ padding: '7px 12px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--line)', fontWeight: 600, color: 'var(--navy)', height: '36px' }}
                    >
                      <option value="draft">Draft / Preparing</option>
                      <option value="sent">Sent to Client</option>
                      <option value="approved">Approved &amp; Signed</option>
                      <option value="declined">Declined</option>
                    </select>

                    {user?.role === 'admin' && !isEditing && (
                      <button
                        onClick={() => {
                          setEditData(JSON.parse(JSON.stringify(activeQuote)));
                          setIsEditing(true);
                        }}
                        className="btn btn-outline"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '0.82rem', height: '36px' }}
                      >
                        <Edit3 size={14} />
                        <span>Edit Scope</span>
                      </button>
                    )}

                    {isEditing && (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn btn-outline"
                          style={{ padding: '7px 12px', fontSize: '0.82rem', height: '36px' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="btn btn-blue"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, height: '36px' }}
                        >
                          <Check size={14} />
                          <span>Save Changes</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={handlePrint}
                      className="btn btn-blue"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, height: '36px' }}
                    >
                      <Printer size={14} />
                      <span>Print / PDF</span>
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(activeQuote.id)}
                        className="btn btn-outline"
                        title="Delete Quote"
                        style={{ padding: '8px 10px', borderColor: '#fca5a5', color: '#b91c1c', borderRadius: '8px', height: '36px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Printable Live Document / Edit Form */}
              <div 
                ref={printRef}
                className="card"
                style={{ 
                  padding: '36px 40px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--line)', 
                  background: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                }}
              >
                {/* PDF Quote Header Banner */}
                <div style={{ background: '#0A192F', borderRadius: '10px', padding: '24px 28px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.06em', color: '#38bdf8' }}>
                      DOZELES
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
                      Commercial &amp; Janitorial Cleaning Services
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                      SERVICE QUOTE
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                      Quote #: <strong>{activeQuote.quoteNumber}</strong>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                      Date: {activeQuote.date} • Valid: {activeQuote.validUntil}
                    </div>
                  </div>
                </div>

                {/* 2-Column Info: Prepared For & Service Provider */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                  <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      PREPARED FOR
                    </div>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Client / Company Name"
                          value={editData.preparedFor?.clientName || ''} 
                          onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, clientName: e.target.value } })}
                          style={{ width: '100%', height: '32px', fontSize: '0.84rem' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Contact Person"
                          value={editData.preparedFor?.contactName || ''} 
                          onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, contactName: e.target.value } })}
                          style={{ width: '100%', height: '32px', fontSize: '0.84rem' }}
                        />
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          value={editData.preparedFor?.email || ''} 
                          onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, email: e.target.value } })}
                          style={{ width: '100%', height: '32px', fontSize: '0.84rem' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Site Address"
                          value={editData.preparedFor?.siteAddress || ''} 
                          onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, siteAddress: e.target.value } })}
                          style={{ width: '100%', height: '32px', fontSize: '0.84rem' }}
                        />
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.88rem', color: 'var(--navy)', lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{activeQuote.preparedFor?.clientName}</div>
                        <div>Attn: {activeQuote.preparedFor?.contactName} ({activeQuote.preparedFor?.email})</div>
                        <div>Site: {activeQuote.preparedFor?.siteAddress}</div>
                        <div>Facility: {activeQuote.preparedFor?.facilityType} ({activeQuote.preparedFor?.squareFootage})</div>
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      SERVICE PROVIDER
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--navy)', lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>Dozeles Professional Cleaning</div>
                      <div>Licensing: Licensed, Bonded &amp; California DIR Registered</div>
                      <div>Direct Phone: 650-290-0280</div>
                      <div>Official Email: dozelescleaning@gmail.com</div>
                      <div>HQ: San Jose &amp; San Francisco Bay Area, CA</div>
                    </div>
                  </div>
                </div>

                {/* Scope Program Title */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    SPECIFIED SCOPE OF WORK
                  </div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editData.programTitle || ''} 
                      onChange={e => setEditData({ ...editData, programTitle: e.target.value })}
                      style={{ width: '100%', height: '36px', fontSize: '0.95rem', fontWeight: 700 }}
                    />
                  ) : (
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)' }}>
                      {activeQuote.programTitle || 'COMMERCIAL JANITORIAL FACILITY CLEANING'}
                    </div>
                  )}
                </div>

                {/* Scope Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                  <thead>
                    <tr style={{ background: '#0A192F', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontSize: '0.76rem', fontWeight: 700, borderRadius: '6px 0 0 6px' }}>SERVICE MODULE</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.76rem', fontWeight: 700 }}>SCOPE SPECIFICATION</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.76rem', fontWeight: 700, textAlign: 'right', borderRadius: '0 6px 6px 0' }}>INVESTMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isEditing ? editData.items : activeQuote.items || []).map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top', width: '28%' }}>
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={item.name} 
                              onChange={e => {
                                const newItems = [...editData.items];
                                newItems[idx].name = e.target.value;
                                setEditData({ ...editData, items: newItems });
                              }}
                              style={{ width: '100%', height: '32px', fontSize: '0.84rem', fontWeight: 600 }}
                            />
                          ) : (
                            <strong style={{ fontSize: '0.9rem', color: 'var(--navy)' }}>{item.name}</strong>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top', color: '#475569', fontSize: '0.84rem' }}>
                          {isEditing ? (
                            <textarea 
                              rows="2"
                              value={item.description} 
                              onChange={e => {
                                const newItems = [...editData.items];
                                newItems[idx].description = e.target.value;
                                setEditData({ ...editData, items: newItems });
                              }}
                              style={{ width: '100%', fontSize: '0.84rem' }}
                            />
                          ) : (
                            item.description
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top', textAlign: 'right', width: '20%' }}>
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={item.price} 
                              onChange={e => {
                                const newItems = [...editData.items];
                                newItems[idx].price = Number(e.target.value) || 0;
                                setEditData({ ...editData, items: newItems });
                              }}
                              style={{ width: '100px', height: '32px', fontSize: '0.84rem', textAlign: 'right', fontWeight: 700 }}
                            />
                          ) : (
                            <strong style={{ fontSize: '0.96rem', color: 'var(--blue)' }}>
                              ${Number(item.price || 0).toLocaleString()}
                            </strong>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Grand Total & Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
                  <div style={{ width: '280px', background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <span>Subtotal</span>
                      <span>${calculateTotal(isEditing ? editData : activeQuote).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <span>Taxes &amp; Insurance</span>
                      <span>Included</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--blue)' }}>${calculateTotal(isEditing ? editData : activeQuote).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Guarantees and Certification Badges */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                  <ShieldCheck size={28} color="#16a34a" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.5 }}>
                    <strong>100% Quality &amp; Cleanliness Guarantee:</strong> All services are performed by background-checked, insured, and bonded janitorial professionals adhering to OSHA and CDC commercial facility standards.
                  </div>
                </div>

                {/* Signature and Approval Line */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '36px', paddingTop: '20px', borderTop: '1px dashed var(--line)' }}>
                  <div>
                    <div style={{ height: '40px', borderBottom: '1px solid var(--navy)', marginBottom: '6px' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy)' }}>Authorized Client Signature</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Date &amp; Title</div>
                  </div>

                  <div>
                    <div style={{ height: '40px', borderBottom: '1px solid var(--navy)', marginBottom: '6px' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy)' }}>Dozeles Operations Representative</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Date &amp; Acceptance</div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={44} color="var(--line)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <strong>Select a service quote on the left to preview and customize.</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
