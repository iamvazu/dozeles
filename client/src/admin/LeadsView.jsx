import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api.js';
import { 
  Target, Plus, Building2, User, Phone, Mail, MapPin, 
  DollarSign, ArrowRight, CheckCircle2, XCircle, Clock, 
  Calendar, FileText, ChevronRight, Filter, Search, 
  Sparkles, Trash2, Edit3, X, Check, Activity, TrendingUp
} from 'lucide-react';

const STAGES = [
  { id: 'all', label: 'All Leads' },
  { id: 'new', label: 'New Inquiries', color: '#f59e0b' },
  { id: 'contacted', label: 'Contacted', color: '#0284c7' },
  { id: 'walkthrough', label: 'Walkthrough Scheduled', color: '#8b5cf6' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: '#0e5fd8' },
  { id: 'won', label: 'Won / Converted', color: '#16a34a' },
  { id: 'lost', label: 'Lost / Closed', color: '#64748b' }
];

export default function LeadsView({ user, onOpenQuotes, onOpenCustomers, onStartAudit }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [convertModalLead, setConvertModalLead] = useState(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    facilityType: 'Commercial Office',
    squareFootage: '4,000 sq.ft.',
    estimatedMonthlyValue: 1800,
    source: 'Google Search (LSA)',
    stage: 'new',
    priority: 'high',
    notes: ''
  });

  // Convert Modal Form State
  const [convertData, setConvertData] = useState({
    address: '',
    frequency: '5x / week (Mon-Fri)',
    billingFrequency: 'Monthly (Net 30)',
    createProject: true
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/leads');
      setLeads(data || []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const created = await api.post('/api/admin/leads', newLead);
      setLeads([created, ...(leads || [])]);
      setShowNewModal(false);
      setNewLead({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        facilityType: 'Commercial Office',
        squareFootage: '4,000 sq.ft.',
        estimatedMonthlyValue: 1800,
        source: 'Google Search (LSA)',
        stage: 'new',
        priority: 'high',
        notes: ''
      });
    } catch (err) {
      alert('Error creating lead: ' + (err.message || err));
    }
  };

  const handleUpdateStage = async (id, newStage) => {
    try {
      const updated = await api.put(`/api/admin/leads/${id}`, { stage: newStage });
      setLeads((leads || []).map(l => l.id === id ? updated : l));
    } catch (err) {
      alert('Error updating lead stage: ' + (err.message || err));
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this lead opportunity?')) return;
    try {
      await api.del(`/api/admin/leads/${id}`);
      setLeads((leads || []).filter(l => l.id !== id));
    } catch (err) {
      alert('Error deleting lead: ' + (err.message || err));
    }
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!convertModalLead) return;
    try {
      await api.post(`/api/admin/leads/${convertModalLead.id}/convert`, convertData);
      alert(`🎉 Congratulations! ${convertModalLead.companyName} has been converted to an active Customer!`);
      setConvertModalLead(null);
      await loadLeads();
      if (onOpenCustomers) onOpenCustomers();
    } catch (err) {
      alert('Error converting lead: ' + (err.message || err));
    }
  };

  const totalPipelineValue = useMemo(() => {
    return (leads || [])
      .filter(l => l.stage !== 'lost')
      .reduce((sum, l) => sum + (Number(l.estimatedMonthlyValue || l.value) || 0) * 12, 0);
  }, [leads]);

  const activeOpportunities = useMemo(() => {
    return (leads || []).filter(l => l.stage !== 'won' && l.stage !== 'lost').length;
  }, [leads]);

  const walkthroughsCount = useMemo(() => {
    return (leads || []).filter(l => l.stage === 'walkthrough').length;
  }, [leads]);

  const filteredLeads = (leads || []).filter(l => {
    const q = search.toLowerCase();
    const matchesSearch = 
      (l.companyName && l.companyName.toLowerCase().includes(q)) ||
      (l.contactName && l.contactName.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.facilityType && l.facilityType.toLowerCase().includes(q));
    const matchesStage = stageFilter === 'all' || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={24} color="var(--blue)" />
            Leads &amp; Sales Pipeline
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Track commercial cleaning prospects from initial inquiry to walkthrough and closed contract.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {onStartAudit && (
            <button 
              onClick={() => onStartAudit(null)} 
              className="btn"
              style={{ background: 'linear-gradient(135deg, #0e5fd8, #0a4bb0)', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,95,216,0.25)' }}
            >
              <Activity size={17} />
              <span>🔬 Conduct On-Site Audit</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowNewModal(true)} 
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, color: 'var(--navy)', borderColor: 'var(--line)' }}
            >
              <Plus size={17} />
              <span>Add New Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Sleek Compact Pipeline KPI Grid */}
      <div className="modern-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="modern-kpi-card emerald">
          <div className="kpi-icon-badge emerald"><DollarSign size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">ANNUAL PIPELINE VALUE</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">${totalPipelineValue.toLocaleString()}</span>
              <span className="kpi-label">Active Potential</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card blue">
          <div className="kpi-icon-badge blue"><Target size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">OPEN OPPORTUNITIES</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{activeOpportunities}</span>
              <span className="kpi-label">In Progress</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card purple">
          <div className="kpi-icon-badge purple"><Calendar size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">WALKTHROUGHS SCHEDULED</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{walkthroughsCount}</span>
              <span className="kpi-label">On-Site Audits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search lead company, contact, or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {STAGES.map(st => (
            <button
              key={st.id}
              onClick={() => setStageFilter(st.id)}
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '20px',
                border: '1px solid',
                cursor: 'pointer',
                borderColor: stageFilter === st.id ? 'var(--blue)' : 'var(--line)',
                background: stageFilter === st.id ? 'rgba(14, 95, 216, 0.08)' : '#ffffff',
                color: stageFilter === st.id ? 'var(--blue)' : 'var(--text-muted)'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {loading && (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading pipeline leads...
          </div>
        )}

        {!loading && filteredLeads.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Target size={44} color="var(--line)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <h4 style={{ margin: '0 0 6px 0', color: 'var(--navy)', fontSize: '1rem' }}>No Leads Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Add a new prospect or select a different filter stage.</p>
          </div>
        )}

        {filteredLeads.map(l => {
          const val = Number(l.estimatedMonthlyValue || l.value || 0);
          return (
            <div 
              key={l.id} 
              className="card" 
              style={{ 
                padding: '18px 20px', 
                borderRadius: '12px', 
                border: '1px solid var(--line)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>
                        {l.companyName}
                      </h4>
                      {(l.auditDetails || l.source?.includes('Walkthrough')) && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(14, 95, 216, 0.12)', color: '#0e5fd8' }}>
                          🔬 Audit Request
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {l.facilityType} • {l.squareFootage || 'Commercial Facility'}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: l.stage === 'won' ? '#dcfce7' : l.stage === 'walkthrough' ? '#ede9fe' : '#f1f5f9',
                    color: l.stage === 'won' ? '#15803d' : l.stage === 'walkthrough' ? '#6d28d9' : '#475569',
                    textTransform: 'uppercase'
                  }}>
                    {l.stage?.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {l.contactName && <div><strong>Contact:</strong> {l.contactName}</div>}
                  {l.email && <div><strong>Email:</strong> <a href={`mailto:${l.email}`} style={{ color: 'var(--blue)', textDecoration: 'none' }}>{l.email}</a></div>}
                  {l.phone && <div><strong>Phone:</strong> {l.phone}</div>}
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '2px' }}>
                    Source: <strong>{l.source || 'Inbound'}</strong>
                  </div>
                </div>

                {l.auditDetails && (
                  <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#1e293b', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={13} /> Facility Walkthrough Details:
                    </div>
                    <div><strong>Current Contractor:</strong> {l.auditDetails.hasCurrentContractor || 'Not Specified'}</div>
                    {l.auditDetails.preferredDate && <div><strong>Preferred Schedule:</strong> {l.auditDetails.preferredDate}</div>}
                    {l.auditDetails.concerns && <div><strong>Pain Points / Concerns:</strong> {l.auditDetails.concerns}</div>}
                  </div>
                )}

                {l.notes && !l.auditDetails && (
                  <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#475569', background: '#fffbeb', border: '1px solid #fef3c7', padding: '8px 10px', borderRadius: '6px' }}>
                    {l.notes}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>EST. MONTHLY VALUE</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--blue)' }}>
                      ${val.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
                    </div>
                  </div>

                  <select 
                    className="form-select"
                    value={l.stage} 
                    onChange={e => handleUpdateStage(l.id, e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--line)', fontWeight: 600, color: 'var(--navy)' }}
                  >
                    <option value="new">New Inquiry</option>
                    <option value="contacted">Contacted</option>
                    <option value="walkthrough">Walkthrough</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="won">Won / Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {onStartAudit && (
                    <button 
                      className="btn btn-outline"
                      onClick={() => onStartAudit(l)}
                      style={{ padding: '7px 10px', fontSize: '0.8rem', borderRadius: '6px', fontWeight: 600, color: '#0e5fd8', borderColor: '#bfdbfe', background: 'rgba(14, 95, 216, 0.05)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Launch Mobile On-Site Inspector for this Lead"
                    >
                      <Activity size={14} /> Audit
                    </button>
                  )}

                  {l.stage !== 'won' ? (
                    <button 
                      className="btn btn-blue" 
                      style={{ flex: 1, padding: '7px 10px', fontSize: '0.8rem', borderRadius: '6px', fontWeight: 600 }}
                      onClick={() => {
                        setConvertModalLead(l);
                        setConvertData({
                          address: '',
                          frequency: '5x / week (Mon-Fri)',
                          billingFrequency: 'Monthly (Net 30)',
                          createProject: true
                        });
                      }}
                    >
                      <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
                      Convert to Client
                    </button>
                  ) : (
                    <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '6px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Check size={14} /> Active Client
                    </span>
                  )}

                  {user?.role === 'admin' && (
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '7px 10px', color: '#b91c1c', borderColor: '#fee2e2', borderRadius: '6px' }}
                      onClick={() => handleDeleteLead(l.id)}
                      title="Delete Lead"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Lead Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--blue)" />
                Add New Sales Lead
              </h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Company / Facility Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apex Biotech" 
                    value={newLead.companyName} 
                    onChange={e => setNewLead({ ...newLead, companyName: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex Morgan" 
                    value={newLead.contactName} 
                    onChange={e => setNewLead({ ...newLead, contactName: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Work Email</label>
                  <input 
                    type="email" 
                    placeholder="alex@apexbiotech.com" 
                    value={newLead.email} 
                    onChange={e => setNewLead({ ...newLead, email: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="415-555-0182" 
                    value={newLead.phone} 
                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Facility Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Commercial Office" 
                    value={newLead.facilityType} 
                    onChange={e => setNewLead({ ...newLead, facilityType: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Estimated Monthly Value ($)</label>
                  <input 
                    type="number" 
                    placeholder="2200" 
                    value={newLead.estimatedMonthlyValue} 
                    onChange={e => setNewLead({ ...newLead, estimatedMonthlyValue: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Notes / Scope Details</label>
                <textarea 
                  rows="2" 
                  placeholder="Inquiry requirements, preferred cleaning days, walkthrough schedule..." 
                  value={newLead.notes} 
                  onChange={e => setNewLead({ ...newLead, notes: e.target.value })} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue" style={{ padding: '8px 20px', fontWeight: 600 }}>
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead to Customer Modal */}
      {convertModalLead && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#16a34a" />
                Convert {convertModalLead.companyName} to Client
              </h3>
              <button onClick={() => setConvertModalLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConvertLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Facility Street Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. 100 Montgomery St, San Francisco, CA" 
                  value={convertData.address} 
                  onChange={e => setConvertData({ ...convertData, address: e.target.value })} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Service Frequency</label>
                <select 
                  value={convertData.frequency} 
                  onChange={e => setConvertData({ ...convertData, frequency: e.target.value })}
                  className="form-select"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                >
                  <option value="5x / week (Mon-Fri)">5x / week (Mon-Fri Evening)</option>
                  <option value="7x / week (Daily Nightly)">7x / week (Daily Nightly)</option>
                  <option value="3x / week (MWF)">3x / week (Mon / Wed / Fri)</option>
                  <option value="Weekly Deep Clean">Weekly Deep Clean</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  id="createProjCheck" 
                  checked={convertData.createProject} 
                  onChange={e => setConvertData({ ...convertData, createProject: e.target.checked })} 
                />
                <label htmlFor="createProjCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>
                  Automatically launch connected Field Project &amp; Janitor Photo Station
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setConvertModalLead(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue" style={{ padding: '8px 20px', fontWeight: 600 }}>
                  Confirm &amp; Convert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
