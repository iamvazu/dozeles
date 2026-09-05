import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api.js';
import { 
  Building2, Users, User, Plus, Phone, Mail, MapPin, 
  DollarSign, FileText, Camera, CheckCircle2, 
  ExternalLink, Calendar, Trash2, Edit3, X, Check, 
  Search, Shield, Clock, Layers, Sparkles, ArrowRight,
  TrendingUp, Activity, CheckSquare
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
      setCustomers(data || []);
      if (data && data.length > 0) {
        if (!selectedCustomer) {
          setSelectedCustomer(data[0]);
        } else {
          const refreshed = data.find(c => c.id === selectedCustomer.id);
          if (refreshed) setSelectedCustomer(refreshed);
          else setSelectedCustomer(data[0]);
        }
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
      alert('Error creating customer: ' + (err.message || err));
    }
  };

  const handleCreateProjectForCustomer = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await api.post(`/api/admin/customers/${selectedCustomer.id}/projects`, newProjectData);
      setShowNewProjectModal(false);
      await loadCustomers();
    } catch (err) {
      alert('Error creating project: ' + (err.message || err));
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
      alert('Error deleting customer: ' + (err.message || err));
    }
  };

  const totalMonthlyContractValue = useMemo(() => {
    return (customers || [])
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (Number(c.contractValue || c.monthlyValue) || 0), 0);
  }, [customers]);

  const totalConnectedProjects = useMemo(() => {
    return (customers || []).reduce((sum, c) => sum + (c.projects?.length || 0), 0);
  }, [customers]);

  const filteredCustomers = (customers || []).filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = 
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.contactName && c.contactName.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header & Overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={24} color="var(--blue)" />
            Customers &amp; Commercial Accounts
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Manage commercial client portfolios, active recurring service tiers, and connected field photo stations.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowNewCustomerModal(true)} 
            className="btn btn-blue"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
          >
            <Plus size={17} />
            <span>Add Client Account</span>
          </button>
        )}
      </div>

      {/* Modern KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid #bbf7d0', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Monthly Recurring Revenue
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
                ${totalMonthlyContractValue.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>/mo</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={22} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '10px', fontWeight: 500 }}>
            Active contracted janitorial agreements
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Client Accounts
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', marginTop: '4px' }}>
                {customers.length}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} color="var(--blue)" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Commercial facilities in portfolio
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Connected Field Sites
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                {totalConnectedProjects}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} color="#0284c7" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Field cleaning operations with photo logs
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Customer Directory & Customer Command Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Customer Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search clients or address..."
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ width: '100%', paddingLeft: '32px', height: '36px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.84rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-light)', padding: '3px', borderRadius: '6px' }}>
              {['all', 'active', 'paused'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    fontSize: '0.75rem',
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '680px', overflowY: 'auto' }}>
            {loading ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Loading accounts...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No customers found.
              </div>
            ) : (
              filteredCustomers.map(c => {
                const isSelected = selectedCustomer?.id === c.id;
                const projCount = c.projects?.length || 0;
                const val = Number(c.contractValue || c.monthlyValue || 0);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.94rem' }}>{c.companyName}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: c.status === 'active' ? '#dcfce7' : '#f1f5f9',
                        color: c.status === 'active' ? '#15803d' : '#475569'
                      }}>
                        {c.status?.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                      <User size={12} /> {c.contactName || 'Primary Contact'}
                    </div>

                    {c.address && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                        <MapPin size={12} /> {c.address}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.04)', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--blue)' }}>
                        ${val.toLocaleString()} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.72rem' }}>/mo</span>
                      </span>
                      <span style={{ background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '0.72rem', color: 'var(--navy)' }}>
                        {projCount} {projCount === 1 ? 'Site' : 'Sites'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Details & Connected Field Operations */}
        <div>
          {selectedCustomer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Account Header Card */}
              <div className="card" style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 6px 0' }}>
                      {selectedCustomer.companyName}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      {selectedCustomer.contactName && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <User size={14} /> {selectedCustomer.contactName}
                        </span>
                      )}
                      {selectedCustomer.email && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Mail size={14} /> <a href={`mailto:${selectedCustomer.email}`} style={{ color: 'var(--blue)', textDecoration: 'none' }}>{selectedCustomer.email}</a>
                        </span>
                      )}
                      {selectedCustomer.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Phone size={14} /> {selectedCustomer.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setNewProjectData({
                            title: `${selectedCustomer.companyName} Dedicated Janitorial`,
                            facilityType: selectedCustomer.facilityType || 'Commercial Office',
                            frequency: '5x / week (Mon-Fri)',
                            startDate: new Date().toISOString().split('T')[0],
                            notes: selectedCustomer.notes || ''
                          });
                          setShowNewProjectModal(true);
                        }}
                        className="btn btn-blue"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.84rem', fontWeight: 600 }}
                      >
                        <Plus size={15} />
                        <span>Add Connected Project</span>
                      </button>
                    )}

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                        className="btn btn-outline"
                        title="Delete Client"
                        style={{ padding: '8px 12px', borderColor: '#fca5a5', color: '#b91c1c' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Account Details Specs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CONTRACT VALUE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue)', marginTop: '3px' }}>
                      ${Number(selectedCustomer.contractValue || selectedCustomer.monthlyValue || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>{selectedCustomer.billingFrequency || 'Monthly (Net 30)'}</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FACILITY TYPE</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginTop: '3px' }}>
                      {selectedCustomer.facilityType || 'Commercial Facility'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>{selectedCustomer.squareFootage || 'Square footage on file'}</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PRIMARY SITE ADDRESS</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--navy)', marginTop: '3px' }}>
                      {selectedCustomer.address || 'Bay Area Facility'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Field Projects & Photo Stations Section */}
              <div className="card" style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={19} color="var(--blue)" />
                      Connected Field Projects &amp; Photo Stations
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Active ongoing cleaning sites, janitor photo stations, and daily checklists linked directly to this client.
                    </p>
                  </div>

                  <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px' }}>
                    {selectedCustomer.projects?.length || 0} Sites Active
                  </span>
                </div>

                {(!selectedCustomer.projects || selectedCustomer.projects.length === 0) ? (
                  <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1.5px dashed var(--line)' }}>
                    <Layers size={36} color="var(--line)" style={{ margin: '0 auto 10px', display: 'block' }} />
                    <h4 style={{ margin: '0 0 6px 0', color: 'var(--navy)', fontSize: '0.96rem' }}>No Connected Field Projects Yet</h4>
                    <p style={{ margin: '0 0 14px 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      Launch a dedicated field project to enable before/after photo logs, janitor tasks, and GPS check-ins for this client.
                    </p>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setNewProjectData({
                            title: `${selectedCustomer.companyName} Commercial Cleaning`,
                            facilityType: selectedCustomer.facilityType || 'Commercial Office',
                            frequency: '5x / week (Mon-Fri)',
                            startDate: new Date().toISOString().split('T')[0],
                            notes: selectedCustomer.notes || ''
                          });
                          setShowNewProjectModal(true);
                        }}
                        className="btn btn-blue"
                        style={{ padding: '8px 18px', fontSize: '0.84rem', fontWeight: 600 }}
                      >
                        + Create Connected Field Project
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {selectedCustomer.projects.map(p => {
                      const photoCount = p.photos?.length || 0;
                      return (
                        <div
                          key={p.id}
                          style={{
                            border: '1px solid var(--line)',
                            borderRadius: '10px',
                            padding: '16px',
                            background: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--navy)' }}>
                                {p.title}
                              </h4>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#dcfce7', color: '#15803d' }}>
                                {p.status || 'Active'}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {p.frequency || 'Daily Scheduled'}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: '#0369a1', background: '#f0f9ff', padding: '6px 10px', borderRadius: '6px' }}>
                              <Camera size={14} />
                              <span>{photoCount} {photoCount === 1 ? 'Site Photo' : 'Site Photos'} Uploaded</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                            {onOpenProject && (
                              <button
                                onClick={() => onOpenProject(p.id)}
                                className="btn btn-outline"
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', padding: '5px 10px', color: 'var(--blue)', borderColor: 'var(--blue)' }}
                              >
                                <span>Open Photo Station</span>
                                <ArrowRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Building2 size={44} color="var(--line)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <strong>Select a client account on the left to view details and field operations.</strong>
            </div>
          )}
        </div>
      </div>

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--blue)" />
                Add New Client Account
              </h3>
              <button onClick={() => setShowNewCustomerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Company / Client Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. BioTech Innovation Labs" 
                  value={newCustomer.companyName} 
                  onChange={e => setNewCustomer({ ...newCustomer, companyName: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sarah Jenkins" 
                    value={newCustomer.contactName} 
                    onChange={e => setNewCustomer({ ...newCustomer, contactName: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Work Email</label>
                  <input 
                    type="email" 
                    placeholder="sarah@biotech.com" 
                    value={newCustomer.email} 
                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="650-555-0199" 
                    value={newCustomer.phone} 
                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Monthly Contract Value ($)</label>
                  <input 
                    type="number" 
                    placeholder="2500" 
                    value={newCustomer.contractValue} 
                    onChange={e => setNewCustomer({ ...newCustomer, contractValue: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Facility Street Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. 500 Forbes Blvd, South San Francisco, CA" 
                  value={newCustomer.address} 
                  onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowNewCustomerModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue" style={{ padding: '8px 20px', fontWeight: 600 }}>
                  Create Client Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="var(--blue)" />
                New Connected Project for {selectedCustomer.companyName}
              </h3>
              <button onClick={() => setShowNewProjectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProjectForCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Project Title *</label>
                <input 
                  type="text" 
                  value={newProjectData.title} 
                  onChange={e => setNewProjectData({ ...newProjectData, title: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Cleaning Frequency</label>
                <select 
                  value={newProjectData.frequency} 
                  onChange={e => setNewProjectData({ ...newProjectData, frequency: e.target.value })}
                  className="form-select"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                >
                  <option value="5x / week (Mon-Fri)">5x / week (Mon-Fri Evening)</option>
                  <option value="7x / week (Daily Nightly)">7x / week (Daily Nightly)</option>
                  <option value="3x / week (MWF)">3x / week (Mon / Wed / Fri)</option>
                  <option value="Weekly Deep Clean">Weekly Deep Clean</option>
                  <option value="Bi-Weekly Service">Bi-Weekly Service</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Special Instructions / Site Notes</label>
                <textarea 
                  rows="3" 
                  placeholder="Keycard access required, alarm code, specific chemical preferences..." 
                  value={newProjectData.notes} 
                  onChange={e => setNewProjectData({ ...newProjectData, notes: e.target.value })} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowNewProjectModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue" style={{ padding: '8px 20px', fontWeight: 600 }}>
                  Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
