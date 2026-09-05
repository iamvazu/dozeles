import { useState, useEffect, useMemo } from 'react';
import { api } from '../api.js';
import { 
  Building2, Users, Plus, Phone, Mail, MapPin, 
  DollarSign, FileText, Camera, CheckCircle2, 
  ExternalLink, Calendar, Trash2, Edit3, X, Check, 
  Search, Shield, Clock, Layers
} from 'lucide-react';

export default function CustomersView({ user, onOpenProject, onOpenQuote }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    facilityType: 'Commercial Office',
    squareFootage: '4,500 sq.ft.',
    contractValue: 1800,
    billingFrequency: 'Monthly (Net 30)',
    status: 'active',
    tags: 'Commercial, High-Value',
    notes: ''
  });

  // New Project for Customer Form State
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    facilityType: 'Commercial Office',
    frequency: '5x / week (Mon-Fri)',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/customers');
      setCustomers(data);
      if (data.length > 0 && !selectedCustomer) {
        setSelectedCustomer(data[0]);
      } else if (selectedCustomer) {
        const refreshed = data.find(c => c.id === selectedCustomer.id);
        if (refreshed) setSelectedCustomer(refreshed);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const created = await api.post('/api/admin/customers', newCustomer);
      setCustomers([created, ...customers]);
      setSelectedCustomer(created);
      setShowNewCustomerModal(false);
      setNewCustomer({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        facilityType: 'Commercial Office',
        squareFootage: '4,500 sq.ft.',
        contractValue: 1800,
        billingFrequency: 'Monthly (Net 30)',
        status: 'active',
        tags: 'Commercial, High-Value',
        notes: ''
      });
    } catch (err) {
      alert('Error creating customer: ' + err.message);
    }
  };

  const handleCreateProjectForCustomer = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await api.post(`/api/admin/customers/${selectedCustomer.id}/projects`, newProjectData);
      alert(`✅ Project created for ${selectedCustomer.companyName}!`);
      setShowNewProjectModal(false);
      loadCustomers();
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer account?')) return;
    try {
      await api.del(`/api/admin/customers/${id}`);
      const remaining = customers.filter(c => c.id !== id);
      setCustomers(remaining);
      setSelectedCustomer(remaining[0] || null);
    } catch (err) {
      alert('Error deleting customer: ' + err.message);
    }
  };

  const totalMonthlyContractValue = useMemo(() => {
    return customers
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (Number(c.contractValue) || 0), 0);
  }, [customers]);

  const totalConnectedProjects = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.projects?.length || 0), 0);
  }, [customers]);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="customers-view-container">
      {/* Top Customer Portfolio Stats */}
      <div className="modern-kpi-grid" style={{ marginBottom: 20 }}>
        <div className="modern-kpi-card emerald">
          <div className="kpi-icon-badge emerald"><DollarSign size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">MONTHLY RECURRING REVENUE (MRR)</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">${totalMonthlyContractValue.toLocaleString()}</span>
              <span className="kpi-label">Active Contracts</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card blue">
          <div className="kpi-icon-badge blue"><Building2 size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">CLIENT ACCOUNTS</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{customers.length}</span>
              <span className="kpi-label">Active Facilities</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card cyan">
          <div className="kpi-icon-badge cyan"><Layers size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">CONNECTED SITES &amp; PROJECTS</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{totalConnectedProjects}</span>
              <span className="kpi-label">Field Operations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="projects-layout">
        {/* Left Customer Accounts List */}
        <div className="projects-sidebar">
          <div className="projects-sidebar-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Customer Accounts</h3>
              {user.role === 'admin' && (
                <button className="btn btn-blue" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setShowNewCustomerModal(true)}>
                  <Plus size={15} style={{ marginRight: 4 }} /> New Client
                </button>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Search clients, address, contact..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="quote-search-input"
            />
            <div className="quote-filter-pills">
              {['all', 'active', 'pending', 'paused'].map(st => (
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

          <div className="projects-list">
            {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Loading customers...</div>}
            {!loading && filteredCustomers.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                No customer accounts found.
              </div>
            )}
            {filteredCustomers.map(c => (
              <div 
                key={c.id} 
                className={`project-list-card ${selectedCustomer?.id === c.id ? 'active' : ''}`}
                onClick={() => setSelectedCustomer(c)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{c.companyName}</span>
                  <span className={`pill ${c.status === 'active' ? 'done' : 'pending'}`}>{c.status}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={13} /> {c.contactName || 'Primary Contact'}
                </div>
                {c.address && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} /> {c.address}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--blue)' }}>
                    ${Number(c.contractValue || 0).toLocaleString()} /mo
                  </span>
                  <span className="pill" style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', fontSize: '0.7rem' }}>
                    {c.projectCount || 0} Connected Projects
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Customer Detail & Connected Projects Hub */}
        <div className="project-detail-panel">
          {selectedCustomer ? (
            <div>
              {/* Customer Header Bar */}
              <div className="project-header-bar">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
                    {selectedCustomer.companyName}
                  </h2>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 4, fontSize: '0.88rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                    {selectedCustomer.contactName && <span><User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} /> {selectedCustomer.contactName}</span>}
                    {selectedCustomer.email && <span><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} /> <a href={`mailto:${selectedCustomer.email}`} style={{ color: 'var(--blue)' }}>{selectedCustomer.email}</a></span>}
                    {selectedCustomer.phone && <span><Phone size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} /> {selectedCustomer.phone}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {user.role === 'admin' && (
                    <button 
                      className="btn btn-blue" 
                      onClick={() => {
                        setNewProjectData({
                          title: `${selectedCustomer.companyName} Ongoing Janitorial`,
                          facilityType: selectedCustomer.facilityType || 'Commercial Office',
                          frequency: '5x / week (Mon-Fri)',
                          startDate: new Date().toISOString().split('T')[0],
                          notes: selectedCustomer.notes || ''
                        });
                        setShowNewProjectModal(true);
                      }}
                      style={{ padding: '8px 14px', borderRadius: 8, fontSize: '0.85rem' }}
                    >
                      <Plus size={16} style={{ marginRight: 6 }} /> Add Connected Project
                    </button>
                  )}

                  {user.role === 'admin' && (
                    <button className="btn btn-outline" style={{ color: '#b3261e', borderColor: '#fee2e2', padding: '8px 12px', borderRadius: 8 }} onClick={() => handleDeleteCustomer(selectedCustomer.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Account Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 20 }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>CONTRACT VALUE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue)', marginTop: 4 }}>
                    ${Number(selectedCustomer.contractValue || 0).toLocaleString()} <small style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>/mo</small>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{selectedCustomer.billingFrequency}</div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>FACILITY SPECIFICATIONS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginTop: 4 }}>
                    {selectedCustomer.facilityType || 'Commercial Facility'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{selectedCustomer.squareFootage || 'Square footage on file'}</div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>LOCATION &amp; SITE</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                    {selectedCustomer.address || 'Bay Area Facility'}
                  </div>
                </div>
              </div>

              {/* Connected Projects & Field Operations Section */}
              <div className="card" style={{ marginTop: 24, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Layers size={20} color="var(--blue)" /> Connected Field Projects &amp; Photo Stations
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                      Active ongoing cleaning sites, before/after photo records, and janitorial tasks linked to this customer.
                    </div>
                  </div>
                  <span className="pill done" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                    {selectedCustomer.projects?.length || 0} Active Sites
                  </span>
                </div>

                {(!selectedCustomer.projects || selectedCustomer.projects.length === 0) ? (
                  <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '2px dashed #cbd5e1', color: 'var(--muted)' }}>
                    <Layers size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
                    <h4 style={{ margin: '0 0 6px 0', color: 'var(--ink)' }}>No Connected Projects Yet</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem' }}>Create a connected field project for this customer to begin tracking site photos, janitor checklists, and GPS check-ins.</p>
                    <button 
                      className="btn btn-blue" 
                      onClick={() => {
                        setNewProjectData({
                          title: `${selectedCustomer.companyName} Cleaning Service`,
                          facilityType: selectedCustomer.facilityType || 'Commercial Office',
                          frequency: '5x / week (Mon-Fri)',
                          startDate: new Date().toISOString().split('T')[0],
                          notes: selectedCustomer.notes || ''
                        });
                        setShowNewProjectModal(true);
                      }}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      <Plus size={16} style={{ marginRight: 6 }} /> Create First Project
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {selectedCustomer.projects.map(p => (
                      <div key={p.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '0.98rem' }}>{p.title}</span>
                            <span className={`pill ${p.status}`}>{p.status}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                            <Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> {p.frequency}
                          </div>
                          {p.address && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                              <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} /> {p.address}
                            </div>
                          )}
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--blue)' }}>
                            📸 {p.photos?.length || 0} Photos Uploaded
                          </span>
                          {onOpenProject && (
                            <button 
                              className="btn btn-outline" 
                              onClick={() => onOpenProject(p.id)}
                              style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                            >
                              Open Station →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Quotes History */}
              {selectedCustomer.quotes && selectedCustomer.quotes.length > 0 && (
                <div className="card" style={{ marginTop: 24, borderRadius: 12 }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} color="var(--blue)" /> Connected Service Quotes &amp; Proposals
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedCustomer.quotes.map(q => (
                      <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div>
                          <strong>{q.quoteNumber}</strong> — {q.programTitle || 'Commercial Janitorial Quote'}
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>Dated {q.date} • Valid until {q.validUntil}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <strong style={{ color: 'var(--blue)', fontSize: '1rem' }}>${Number(q.totalAmount || 0).toLocaleString()}</strong>
                          <span className={`pill ${q.status}`}>{q.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Access Notes */}
              {selectedCustomer.notes && (
                <div style={{ marginTop: 20, background: '#fffbeb', border: '1px solid #fef3c7', padding: 16, borderRadius: 10, color: '#92400e', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  <strong>Site Access Protocol &amp; Instructions:</strong>
                  <div style={{ marginTop: 4 }}>{selectedCustomer.notes}</div>
                </div>
              )}

            </div>
          ) : (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
              <Building2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <h3>Select a customer account</h3>
              <p>Choose a client from the left directory to view their facility details and connected projects.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowNewCustomerModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3>Create New Customer Account</h3>
              <button className="modal-close" onClick={() => setShowNewCustomerModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCustomer} className="modal-body">
              <div className="form-row">
                <div>
                  <label className="form-note">Company / Client Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Skyline Financial Group" 
                    value={newCustomer.companyName} 
                    onChange={e => setNewCustomer({ ...newCustomer, companyName: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="form-note">Primary Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g. David Clark" 
                    value={newCustomer.contactName} 
                    onChange={e => setNewCustomer({ ...newCustomer, contactName: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Contact Email</label>
                  <input 
                    type="email" 
                    placeholder="contact@company.com" 
                    value={newCustomer.email} 
                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="form-note">Contact Phone</label>
                  <input 
                    type="tel" 
                    placeholder="650-555-0192" 
                    value={newCustomer.phone} 
                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-note">Facility / Site Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. 100 Pine St, Suite 1400, San Francisco, CA" 
                  value={newCustomer.address} 
                  onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} 
                />
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Facility Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Commercial Office, Medical Clinic" 
                    value={newCustomer.facilityType} 
                    onChange={e => setNewCustomer({ ...newCustomer, facilityType: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="form-note">Square Footage</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 4,500 sq.ft." 
                    value={newCustomer.squareFootage} 
                    onChange={e => setNewCustomer({ ...newCustomer, squareFootage: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Monthly Contract Value ($)</label>
                  <input 
                    type="number" 
                    placeholder="1850" 
                    value={newCustomer.contractValue} 
                    onChange={e => setNewCustomer({ ...newCustomer, contractValue: Number(e.target.value) })} 
                  />
                </div>
                <div>
                  <label className="form-note">Billing Terms</label>
                  <select 
                    className="form-select"
                    value={newCustomer.billingFrequency} 
                    onChange={e => setNewCustomer({ ...newCustomer, billingFrequency: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
                  >
                    <option value="Monthly (Net 30)">Monthly (Net 30)</option>
                    <option value="Monthly (ACH Auto-Pay)">Monthly (ACH Auto-Pay)</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Per Service">Per Service</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-note">Site Access Protocol &amp; Security Notes</label>
                <textarea 
                  rows="3" 
                  placeholder="Keycard, alarm codes, special disinfection requirements..." 
                  value={newCustomer.notes} 
                  onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewCustomerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-blue">Save Customer Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal for Selected Customer */}
      {showNewProjectModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowNewProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3>Add Field Project for {selectedCustomer.companyName}</h3>
              <button className="modal-close" onClick={() => setShowNewProjectModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateProjectForCustomer} className="modal-body">
              <div style={{ marginBottom: 14 }}>
                <label className="form-note">Project Title</label>
                <input 
                  type="text" 
                  value={newProjectData.title} 
                  onChange={e => setNewProjectData({ ...newProjectData, title: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Cleaning Frequency</label>
                  <select 
                    className="form-select"
                    value={newProjectData.frequency} 
                    onChange={e => setNewProjectData({ ...newProjectData, frequency: e.target.value })}
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
                  <label className="form-note">Start Date</label>
                  <input 
                    type="date" 
                    value={newProjectData.startDate} 
                    onChange={e => setNewProjectData({ ...newProjectData, startDate: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-note">Specific Site Instructions for Janitor</label>
                <textarea 
                  rows="3" 
                  value={newProjectData.notes} 
                  onChange={e => setNewProjectData({ ...newProjectData, notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-blue">Launch Project &amp; Photo Station</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
