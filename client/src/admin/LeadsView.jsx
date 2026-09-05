import { useState, useEffect, useMemo } from 'react';
import { api } from '../api.js';
import { 
  Target, Plus, Building2, User, Phone, Mail, MapPin, 
  DollarSign, ArrowRight, CheckCircle2, XCircle, Clock, 
  Calendar, FileText, ChevronRight, Filter, Search, 
  Sparkles, Trash2, Edit3, X, Check
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

export default function LeadsView({ user, onOpenQuotes, onOpenCustomers }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [convertModalLead, setConvertModalLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);

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
      setLeads(data);
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
      setLeads([created, ...leads]);
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
      alert('Error creating lead: ' + err.message);
    }
  };

  const handleUpdateStage = async (id, newStage) => {
    try {
      const updated = await api.put(`/api/admin/leads/${id}`, { stage: newStage });
      setLeads(leads.map(l => l.id === id ? updated : l));
    } catch (err) {
      alert('Error updating lead stage: ' + err.message);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this lead opportunity?')) return;
    try {
      await api.del(`/api/admin/leads/${id}`);
      setLeads(leads.filter(l => l.id !== id));
    } catch (err) {
      alert('Error deleting lead: ' + err.message);
    }
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!convertModalLead) return;
    try {
      await api.post(`/api/admin/leads/${convertModalLead.id}/convert`, convertData);
      alert(`🎉 Congratulations! ${convertModalLead.companyName} has been converted to an active Customer!`);
      setConvertModalLead(null);
      loadLeads();
      if (onOpenCustomers) onOpenCustomers();
    } catch (err) {
      alert('Error converting lead: ' + err.message);
    }
  };

  const totalPipelineValue = useMemo(() => {
    return leads
      .filter(l => l.stage !== 'lost')
      .reduce((sum, l) => sum + (Number(l.estimatedMonthlyValue) || 0) * 12, 0);
  }, [leads]);

  const activeOpportunities = useMemo(() => {
    return leads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length;
  }, [leads]);

  const walkthroughsCount = useMemo(() => {
    return leads.filter(l => l.stage === 'walkthrough').length;
  }, [leads]);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.facilityType?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="leads-view-container">
      {/* Top Pipeline KPI Bar */}
      <div className="modern-kpi-grid" style={{ marginBottom: 20 }}>
        <div className="modern-kpi-card blue">
          <div className="kpi-icon-badge blue"><DollarSign size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">ANNUAL PIPELINE VALUE</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">${(totalPipelineValue).toLocaleString()}</span>
              <span className="kpi-label">Active Opportunities</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card amber">
          <div className="kpi-icon-badge amber"><Target size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">OPEN PROSPECTS</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{activeOpportunities}</span>
              <span className="kpi-label">In Pipeline</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card emerald">
          <div className="kpi-icon-badge emerald"><Calendar size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">WALKTHROUGHS SCHEDULED</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{walkthroughsCount}</span>
              <span className="kpi-label">On-Site Audits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Header & Action Bar */}
      <div className="table-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)' }}>
              Sales &amp; B2B Leads Pipeline
            </h3>
            <span className="pill done" style={{ fontSize: '0.78rem' }}>{filteredLeads.length} Prospects</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Search company, contact, or facility..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ width: 260, padding: '8px 12px', fontSize: '0.85rem', borderRadius: 8, border: '1px solid var(--line)' }}
            />

            {user.role === 'admin' && (
              <button className="btn btn-blue" onClick={() => setShowNewModal(true)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem' }}>
                <Plus size={16} style={{ marginRight: 6 }} /> Add New Lead
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {STAGES.map(st => (
            <button
              key={st.id}
              className={`filter-pill ${stageFilter === st.id ? 'active' : ''}`}
              onClick={() => setStageFilter(st.id)}
              style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: 20 }}
            >
              {st.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List / Cards */}
      <div className="leads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {loading && <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading leads...</div>}
        {!loading && filteredLeads.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid var(--line)', color: 'var(--muted)' }}>
            <Target size={44} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h4 style={{ margin: '0 0 6px 0', color: 'var(--ink)' }}>No Leads Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Add a new prospect or change your filter criteria.</p>
          </div>
        )}

        {filteredLeads.map(l => (
          <div key={l.id} className="card lead-card" style={{ padding: 18, borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)' }}>
                    {l.companyName}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                    {l.facilityType} • {l.squareFootage}
                  </div>
                </div>
                <span className={`pill ${l.priority === 'high' ? 'pending' : l.priority === 'low' ? 'done' : 'confirmed'}`} style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                  {l.priority?.toUpperCase()} PRIORITY
                </span>
              </div>

              <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {l.contactName && <div><strong>Contact:</strong> {l.contactName}</div>}
                {l.email && <div><strong>Email:</strong> <a href={`mailto:${l.email}`} style={{ color: 'var(--blue)' }}>{l.email}</a></div>}
                {l.phone && <div><strong>Phone:</strong> {l.phone}</div>}
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 2 }}>
                  Source: <strong>{l.source}</strong>
                </div>
              </div>

              {l.notes && (
                <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#475569', background: '#fffbeb', border: '1px solid #fef3c7', padding: '8px 10px', borderRadius: 6 }}>
                  {l.notes}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>EST. CONTRACT</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--blue)' }}>
                    ${Number(l.estimatedMonthlyValue || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 }}>/mo</span>
                  </div>
                </div>

                <select 
                  className="form-select"
                  value={l.stage} 
                  onChange={e => handleUpdateStage(l.id, e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '0.78rem', borderRadius: 6, border: '1px solid var(--line)', fontWeight: 600 }}
                >
                  <option value="new">New Inquiry</option>
                  <option value="contacted">Contacted</option>
                  <option value="walkthrough">Walkthrough</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="won">Won / Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {l.stage !== 'won' ? (
                  <button 
                    className="btn btn-blue" 
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.8rem', borderRadius: 6 }}
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
                    <CheckCircle2 size={14} style={{ marginRight: 4 }} /> Convert to Client
                  </button>
                ) : (
                  <span className="pill done" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '6px' }}>
                    <Check size={14} style={{ marginRight: 4 }} /> Active Client
                  </span>
                )}

                {user.role === 'admin' && (
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '7px 10px', color: '#b3261e', borderColor: '#fee2e2', borderRadius: 6 }}
                    onClick={() => handleDeleteLead(l.id)}
                    title="Delete Lead"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Lead Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3>Add New Sales Lead</h3>
              <button className="modal-close" onClick={() => setShowNewModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateLead} className="modal-body">
              <div className="form-row">
                <div>
                  <label className="form-note">Company / Facility Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Tech Labs" 
                    value={newLead.companyName} 
                    onChange={e => setNewLead({ ...newLead, companyName: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="form-note">Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jane Doe" 
                    value={newLead.contactName} 
                    onChange={e => setNewLead({ ...newLead, contactName: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Email</label>
                  <input 
                    type="email" 
                    placeholder="contact@company.com" 
                    value={newLead.email} 
                    onChange={e => setNewLead({ ...newLead, email: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="form-note">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="650-555-0100" 
                    value={newLead.phone} 
                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Facility Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Commercial Office, Biotech Lab" 
                    value={newLead.facilityType} 
                    onChange={e => setNewLead({ ...newLead, facilityType: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="form-note">Estimated Sq. Footage</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5,000 sq.ft." 
                    value={newLead.squareFootage} 
                    onChange={e => setNewLead({ ...newLead, squareFootage: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Estimated Monthly Value ($)</label>
                  <input 
                    type="number" 
                    placeholder="1800" 
                    value={newLead.estimatedMonthlyValue} 
                    onChange={e => setNewLead({ ...newLead, estimatedMonthlyValue: Number(e.target.value) })} 
                  />
                </div>
                <div>
                  <label className="form-note">Lead Source</label>
                  <select 
                    className="form-select"
                    value={newLead.source} 
                    onChange={e => setNewLead({ ...newLead, source: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
                  >
                    <option value="Google Search (LSA)">Google Search / Ads</option>
                    <option value="Govt RFP (Cal eProcure)">Government RFP / Portal</option>
                    <option value="Cold Email & LinkedIn">Outbound B2B Campaign</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Website Form">Website Booking Form</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Initial Pipeline Stage</label>
                  <select 
                    className="form-select"
                    value={newLead.stage} 
                    onChange={e => setNewLead({ ...newLead, stage: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
                  >
                    <option value="new">New Inquiry</option>
                    <option value="contacted">Contacted</option>
                    <option value="walkthrough">Walkthrough Scheduled</option>
                    <option value="proposal_sent">Proposal Sent</option>
                  </select>
                </div>
                <div>
                  <label className="form-note">Priority</label>
                  <select 
                    className="form-select"
                    value={newLead.priority} 
                    onChange={e => setNewLead({ ...newLead, priority: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-note">Notes / Requirements</label>
                <textarea 
                  rows="3" 
                  placeholder="Service requirements, preferred schedule, security requirements..." 
                  value={newLead.notes} 
                  onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-blue">Save Lead Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead to Customer Modal */}
      {convertModalLead && (
        <div className="modal-overlay" onClick={() => setConvertModalLead(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3>Convert Lead to Active Customer</h3>
              <button className="modal-close" onClick={() => setConvertModalLead(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleConvertLead} className="modal-body">
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>
                  {convertModalLead.companyName}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: 2 }}>
                  Contact: {convertModalLead.contactName || 'Primary Contact'} • ${convertModalLead.estimatedMonthlyValue}/mo
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-note">Facility / Site Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. 100 Pine St, Suite 1200, San Francisco, CA" 
                  value={convertData.address} 
                  onChange={e => setConvertData({ ...convertData, address: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Cleaning Frequency</label>
                  <select 
                    className="form-select"
                    value={convertData.frequency} 
                    onChange={e => setConvertData({ ...convertData, frequency: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
                  >
                    <option value="5x / week (Mon-Fri)">5x / week (Mon-Fri)</option>
                    <option value="7x / week (Daily)">7x / week (Daily)</option>
                    <option value="3x / week (Mon/Wed/Fri)">3x / week (Mon/Wed/Fri)</option>
                    <option value="2x / week (Tue/Thu)">2x / week (Tue/Thu)</option>
                    <option value="1x / week (Weekend)">1x / week (Weekend)</option>
                  </select>
                </div>
                <div>
                  <label className="form-note">Billing Terms</label>
                  <select 
                    className="form-select"
                    value={convertData.billingFrequency} 
                    onChange={e => setConvertData({ ...convertData, billingFrequency: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
                  >
                    <option value="Monthly (Net 30)">Monthly (Net 30)</option>
                    <option value="Monthly (ACH Auto-Pay)">Monthly (ACH Auto-Pay)</option>
                    <option value="Per Service">Per Service</option>
                  </select>
                </div>
              </div>

              <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input 
                  type="checkbox" 
                  id="createProjCheck" 
                  checked={convertData.createProject} 
                  onChange={e => setConvertData({ ...convertData, createProject: e.target.checked })} 
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="createProjCheck" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
                  Automatically create connected Field Project &amp; Checklist in Photo Station
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setConvertModalLead(null)}>Cancel</button>
                <button type="submit" className="btn btn-blue">
                  <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Confirm Customer Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
