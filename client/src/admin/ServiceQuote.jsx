import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import { 
  FileText, Plus, Printer, Download, Mail, CheckCircle2, 
  Trash2, Edit3, ArrowLeft, Building2, Calendar, ShieldCheck, 
  Sparkles, DollarSign, Check, X, RefreshCw
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
      setQuotes(data);
      if (data.length > 0 && !activeQuote) {
        setActiveQuote(data[0]);
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
        clientName: 'New Client / Facility',
        contactName: 'Contact Person',
        serviceName: 'Commercial Janitorial Cleaning'
      });
      setQuotes([newQuote, ...quotes]);
      setActiveQuote(newQuote);
      setEditData(JSON.parse(JSON.stringify(newQuote)));
      setIsEditing(true);
    } catch (err) {
      alert('Error creating quote: ' + err.message);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await api.put(`/api/admin/quotes/${editData.id}`, editData);
      setQuotes(quotes.map(q => q.id === updated.id ? updated : q));
      setActiveQuote(updated);
      setIsEditing(false);
      setEditData(null);
    } catch (err) {
      alert('Error updating quote: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    try {
      await api.del(`/api/admin/quotes/${id}`);
      const remaining = quotes.filter(q => q.id !== id);
      setQuotes(remaining);
      setActiveQuote(remaining[0] || null);
    } catch (err) {
      alert('Error deleting quote: ' + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await api.put(`/api/admin/quotes/${id}`, { status: newStatus });
      setQuotes(quotes.map(q => q.id === updated.id ? updated : q));
      if (activeQuote?.id === id) setActiveQuote(updated);
    } catch (err) {
      alert('Error changing status: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      q.quoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
      q.preparedFor?.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      q.preparedFor?.contactName?.toLowerCase().includes(search.toLowerCase()) ||
      q.programTitle?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="quote-manager-container">
      {/* Sidebar List of Quotes */}
      <div className="quote-sidebar no-print">
        <div className="quote-sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Service Quotes</h3>
            {user.role === 'admin' && (
              <button className="btn btn-blue" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={handleCreateNew}>
                <Plus size={15} style={{ marginRight: 4 }} /> New Quote
              </button>
            )}
          </div>
          <input 
            type="text" 
            placeholder="Search quote # or client..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="quote-search-input"
          />
          <div className="quote-filter-pills">
            {['all', 'draft', 'sent', 'approved'].map(st => (
              <button 
                key={st} 
                className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="quote-list">
          {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Loading quotes...</div>}
          {!loading && filteredQuotes.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
              No quotes found.
            </div>
          )}
          {filteredQuotes.map(q => (
            <div 
              key={q.id} 
              className={`quote-item-card ${activeQuote?.id === q.id ? 'active' : ''}`}
              onClick={() => {
                setActiveQuote(q);
                setIsEditing(false);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="quote-num-badge">{q.quoteNumber}</span>
                <span className={`pill ${q.status}`}>{q.status}</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: 6, color: 'var(--ink)' }}>
                {q.preparedFor?.clientName || 'Untitled Client'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                {q.preparedFor?.facilityType || 'Facility Cleaning'} • {q.date}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--blue)' }}>
                  ${Number(q.totalAmount || 0).toLocaleString()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {q.items?.length || 0} scope lines
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Quote Preview / Editor */}
      <div className="quote-preview-container">
        {activeQuote ? (
          <>
            {/* Top Toolbar */}
            <div className="quote-action-bar no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {activeQuote.quoteNumber}
                </span>
                <select 
                  className="form-select"
                  value={activeQuote.status} 
                  onChange={e => handleStatusChange(activeQuote.id, e.target.value)}
                  style={{ padding: '4px 10px', fontSize: '0.85rem', borderRadius: 6, border: '1px solid var(--line)' }}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent to Client</option>
                  <option value="approved">Approved / Signed</option>
                  <option value="rejected">Declined</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isEditing ? (
                  <>
                    <button className="btn btn-blue" onClick={handleSaveEdit} style={{ padding: '7px 14px', fontSize: '0.85rem' }}>
                      <Check size={16} style={{ marginRight: 6 }} /> Save Changes
                    </button>
                    <button className="btn btn-outline" onClick={() => { setIsEditing(false); setEditData(null); }} style={{ padding: '7px 14px', fontSize: '0.85rem' }}>
                      <X size={16} style={{ marginRight: 6 }} /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {user.role === 'admin' && (
                      <button 
                        className="btn btn-outline" 
                        onClick={() => {
                          setEditData(JSON.parse(JSON.stringify(activeQuote)));
                          setIsEditing(true);
                        }}
                        style={{ padding: '7px 14px', fontSize: '0.85rem' }}
                      >
                        <Edit3 size={16} style={{ marginRight: 6 }} /> Edit Quote
                      </button>
                    )}
                    <button className="btn btn-blue" onClick={handlePrint} style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                      <Printer size={16} style={{ marginRight: 6 }} /> Print / Save as PDF
                    </button>
                    {user.role === 'admin' && (
                      <button className="btn btn-outline" style={{ color: '#b3261e', borderColor: '#b3261e', padding: '7px 12px' }} onClick={() => handleDelete(activeQuote.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* If Editing Mode */}
            {isEditing && editData && (
              <div className="quote-editor-panel no-print">
                <h4 style={{ margin: '0 0 16px 0', color: 'var(--blue)' }}>Edit Quote Metadata & Line Items</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="form-note">Client / Company Name</label>
                    <input 
                      type="text" 
                      value={editData.preparedFor?.clientName || ''} 
                      onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, clientName: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Contact Person</label>
                    <input 
                      type="text" 
                      value={editData.preparedFor?.contactName || ''} 
                      onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, contactName: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Contact Email</label>
                    <input 
                      type="email" 
                      value={editData.preparedFor?.email || ''} 
                      onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, email: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Site Address</label>
                    <input 
                      type="text" 
                      value={editData.preparedFor?.siteAddress || ''} 
                      onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, siteAddress: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Facility Type</label>
                    <input 
                      type="text" 
                      value={editData.preparedFor?.facilityType || ''} 
                      onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, facilityType: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Square Footage</label>
                    <input 
                      type="text" 
                      value={editData.preparedFor?.squareFootage || ''} 
                      onChange={e => setEditData({ ...editData, preparedFor: { ...editData.preparedFor, squareFootage: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Quote Date</label>
                    <input 
                      type="text" 
                      value={editData.date || ''} 
                      onChange={e => setEditData({ ...editData, date: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Valid Until Date</label>
                    <input 
                      type="text" 
                      value={editData.validUntil || ''} 
                      onChange={e => setEditData({ ...editData, validUntil: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Total Investment Amount ($)</label>
                    <input 
                      type="number" 
                      value={editData.totalAmount || 0} 
                      onChange={e => setEditData({ ...editData, totalAmount: Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Program / Phase Title</label>
                    <input 
                      type="text" 
                      value={editData.programTitle || ''} 
                      onChange={e => setEditData({ ...editData, programTitle: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-note" style={{ fontWeight: 700 }}>Scope Items</label>
                  {editData.items?.map((item, idx) => (
                    <div key={item.id || idx} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1.5fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <input 
                        placeholder="Service Name" 
                        value={item.serviceName} 
                        onChange={e => {
                          const items = [...editData.items];
                          items[idx].serviceName = e.target.value;
                          setEditData({ ...editData, items });
                        }} 
                      />
                      <input 
                        placeholder="Details / Scope" 
                        value={item.details} 
                        onChange={e => {
                          const items = [...editData.items];
                          items[idx].details = e.target.value;
                          setEditData({ ...editData, items });
                        }} 
                      />
                      <input 
                        placeholder="Frequency (e.g. Daily)" 
                        value={item.frequency} 
                        onChange={e => {
                          const items = [...editData.items];
                          items[idx].frequency = e.target.value;
                          setEditData({ ...editData, items });
                        }} 
                      />
                      <input 
                        type="number" 
                        placeholder="Rate ($)" 
                        value={item.amount || ''} 
                        onChange={e => {
                          const items = [...editData.items];
                          items[idx].amount = Number(e.target.value);
                          setEditData({ ...editData, items });
                        }} 
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ padding: '6px 8px', color: '#b3261e', borderColor: '#b3261e' }}
                        onClick={() => {
                          const items = editData.items.filter((_, i) => i !== idx);
                          setEditData({ ...editData, items });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                    onClick={() => {
                      const items = editData.items || [];
                      setEditData({
                        ...editData,
                        items: [...items, { id: Date.now().toString(), serviceName: 'New Scope Item', details: 'Scope details', frequency: 'Weekly', amount: 100 }]
                      });
                    }}
                  >
                    <Plus size={14} style={{ marginRight: 4 }} /> Add Scope Line
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-note">Optional Program Name</label>
                    <input 
                      type="text" 
                      value={editData.optionalProgram?.title || ''} 
                      onChange={e => setEditData({ ...editData, optionalProgram: { ...editData.optionalProgram, title: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <label className="form-note">Optional Program Rate</label>
                    <input 
                      type="text" 
                      value={editData.optionalProgram?.rate || ''} 
                      onChange={e => setEditData({ ...editData, optionalProgram: { ...editData.optionalProgram, rate: e.target.value } })} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Printable Document Paper (Matches PDF Template Exactly) */}
            <div className="printable-quote-page" ref={printRef}>
              
              {/* Top Navy Header Banner */}
              <div className="quote-pdf-header">
                <div className="quote-pdf-brand">
                  <div className="quote-logo-mark">
                    <img src="/images/dozeles-logo.jpg" alt="Dozeles" style={{ height: 42, filter: 'brightness(0) invert(1)' }} onError={(e) => { e.target.style.display='none'; }} />
                    <div className="quote-logo-fallback">
                      <div style={{ fontWeight: 900, letterSpacing: 2, fontSize: '1.25rem', color: '#00C0F3' }}>DOZELES</div>
                    </div>
                  </div>
                  <div className="quote-brand-sub">COMMERCIAL &amp; OFFICE CLEANING SERVICES</div>
                </div>

                <div className="quote-pdf-meta">
                  <h1 className="quote-pdf-title">SERVICE QUOTE</h1>
                  <div className="quote-pdf-meta-item">
                    <span className="q-label">Quote #:</span> 
                    <span className="q-val bold">{activeQuote.quoteNumber}</span>
                  </div>
                  <div className="quote-pdf-meta-item">
                    <span className="q-label">Date:</span> 
                    <span className="q-val">{activeQuote.date}</span>
                  </div>
                  <div className="quote-pdf-meta-item">
                    <span className="q-label">Valid Until:</span> 
                    <span className="q-val">{activeQuote.validUntil}</span>
                  </div>
                </div>
              </div>

              {/* 2-Column Info Section */}
              <div className="quote-pdf-parties">
                <div className="quote-party-col">
                  <div className="quote-party-header">PREPARED FOR</div>
                  <div className="quote-party-body">
                    <div className="party-name">{activeQuote.preparedFor?.clientName || 'Valued Client'}</div>
                    <div className="party-attn">
                      <strong>Attn:</strong> {activeQuote.preparedFor?.contactName || 'Facilities Manager'} 
                      {activeQuote.preparedFor?.email && <span> ({activeQuote.preparedFor?.email})</span>}
                    </div>
                    <div className="party-detail"><strong>Site Address:</strong> {activeQuote.preparedFor?.siteAddress || 'Bay Area Facility'}</div>
                    <div className="party-detail"><strong>Facility Type:</strong> {activeQuote.preparedFor?.facilityType || 'Commercial Office'}</div>
                    <div className="party-detail"><strong>Square Footage:</strong> {activeQuote.preparedFor?.squareFootage || '3,500 sq. ft.'}</div>
                  </div>
                </div>

                <div className="quote-party-col">
                  <div className="quote-party-header">SERVICE PROVIDER</div>
                  <div className="quote-party-body">
                    <div className="party-name">{activeQuote.serviceProvider?.companyName || 'Dozeles Professional Cleaning'}</div>
                    <div className="party-detail"><strong>Specialization:</strong> {activeQuote.serviceProvider?.specialization || 'Commercial & Office Cleaning'}</div>
                    <div className="party-detail"><strong>Email:</strong> {activeQuote.serviceProvider?.email || 'dozelescleaning@gmail.com'}</div>
                    <div className="party-detail"><strong>Phone:</strong> {activeQuote.serviceProvider?.phone || '650-290-0280'}</div>
                    <div className="party-detail"><strong>Licensing:</strong> Licensed, Bonded &amp; California DIR Registered</div>
                  </div>
                </div>
              </div>

              {/* Scope Table Section */}
              <div className="quote-pdf-scope-section">
                <div className="quote-section-title-bar">
                  <div className="cyan-bar"></div>
                  <h3>{activeQuote.programTitle || 'PRIMARY COMMERCIAL SERVICE PROGRAM'}</h3>
                </div>

                <table className="quote-pdf-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>SERVICE DESCRIPTION</th>
                      <th style={{ width: '50%' }}>DETAILS / SCOPE</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>FREQUENCY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeQuote.items?.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="svc-name">
                          <strong>{idx + 1}. {item.serviceName}</strong>
                        </td>
                        <td className="svc-desc">{item.details}</td>
                        <td className="svc-freq" style={{ textAlign: 'right' }}>
                          <span className="freq-tag">[{item.frequency}]</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Subtotals & Total Summary */}
                <div className="quote-pdf-totals">
                  {activeQuote.lineItems?.map((li, idx) => (
                    <div key={idx} className="quote-total-row">
                      <span className="tot-lbl">{li.label}</span>
                      <span className="tot-val">${Number(li.amount || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="quote-total-row grand-total">
                    <span className="tot-lbl">[{activeQuote.totalLabel || 'Total Investment'}]</span>
                    <span className="tot-val">[${Number(activeQuote.totalAmount || 0).toFixed(2)}]</span>
                  </div>
                </div>
              </div>

              {/* Optional Program Block */}
              {activeQuote.optionalProgram && (
                <div className="quote-pdf-optional-block">
                  <div className="optional-header">
                    <span className="opt-title">[{activeQuote.optionalProgram.title}]</span>
                    <span className="opt-tag">[{activeQuote.optionalProgram.tag || 'OPTIONAL / SCHEDULED'}]</span>
                  </div>
                  <ul className="opt-tasks">
                    {activeQuote.optionalProgram.tasks?.map((t, idx) => (
                      <li key={idx}>• {t}</li>
                    ))}
                  </ul>
                  <div className="opt-rate">
                    <strong>Rate:</strong> [{activeQuote.optionalProgram.rate || '$350.00 – $550.00 / session'}]
                  </div>
                </div>
              )}

              {/* Scope Assumptions & Terms */}
              <div className="quote-pdf-terms">
                <div className="quote-section-title-bar">
                  <div className="cyan-bar"></div>
                  <h3>SCOPE ASSUMPTIONS &amp; SERVICE TERMS</h3>
                </div>
                <div className="terms-content">
                  <p>• <strong>Site Access:</strong> {activeQuote.terms?.siteAccess || 'Keycard or lockbox access provided by client. Secure alarm protocol observed.'}</p>
                  <p>• <strong>Equipment &amp; Supplies:</strong> {activeQuote.terms?.equipmentSupplies || 'Dozeles provides commercial HEPA vacuums, microfiber materials, and EPA registered eco-friendly cleaners.'}</p>
                  <p>• <strong>Service Hours:</strong> {activeQuote.terms?.serviceHours || 'After-hours cleaning starting at 6:00 PM or custom agreed day-porter hours.'}</p>
                  <p>• <strong>Billing:</strong> {activeQuote.terms?.billing || 'Net 30 billing terms. Monthly electronic invoicing with ACH or check payment options.'}</p>
                  <p>• <strong>Pricing Adjustment:</strong> {activeQuote.terms?.pricingAdjustment || 'Rates subject to periodic review if client modifies service frequency or facility square footage.'}</p>
                </div>
              </div>

              {/* Certifications Banner Bar */}
              <div className="quote-pdf-cert-banner">
                <div className="cert-item">
                  <div className="cert-icon">
                    <ShieldCheck size={22} color="#00C0F3" />
                  </div>
                  <div className="cert-text">
                    <strong>Certified Small Business</strong>
                    <span>Cert. No. 2041212</span>
                  </div>
                </div>

                <div className="cert-item">
                  <div className="cert-icon">
                    <Building2 size={22} color="#00C0F3" />
                  </div>
                  <div className="cert-text">
                    <strong>DIR Janitorial Registration</strong>
                    <span>Reg. No. JS-LR-1001274287</span>
                  </div>
                </div>

                <div className="cert-item">
                  <div className="cert-icon">
                    <Sparkles size={22} color="#00C0F3" />
                  </div>
                  <div className="cert-text">
                    <strong>Women-Certified Business</strong>
                    <span>State Recognized WBE</span>
                  </div>
                </div>

                <div className="cert-item">
                  <div className="cert-icon">
                    <CheckCircle2 size={22} color="#00C0F3" />
                  </div>
                  <div className="cert-text">
                    <strong>Licensed, Bonded &amp; Insured</strong>
                    <span>$2M Commercial Liability</span>
                  </div>
                </div>
              </div>

              {/* Dual Signatures */}
              <div className="quote-pdf-signatures">
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <div className="sig-label">AUTHORIZED SIGNATURE — [{activeQuote.preparedFor?.clientName?.toUpperCase() || 'CLIENT / COMPANY NAME'}]</div>
                  <div className="sig-sub">Printed Name / Title / Date</div>
                </div>

                <div className="sig-block">
                  <div className="sig-line"></div>
                  <div className="sig-label">AUTHORIZED SIGNATURE — DOZELES PROFESSIONAL CLEANING</div>
                  <div className="sig-sub">Authorized Representative / Date</div>
                </div>
              </div>

              {/* Footer Tagline */}
              <div className="quote-pdf-footer">
                Dozeles Professional Cleaning • Commercial &amp; Office Cleaning Services • 650-290-0280 • www.dozeles.com
              </div>

            </div>
          </>
        ) : (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>Select or create a service quote</h3>
            <p>Generate formal commercial cleaning quotes ready for PDF export and client signing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
