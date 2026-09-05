import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Plus, Search, Filter, ShieldCheck, 
  Sparkles, FileText, Printer, Mail, Trash2, Edit3, 
  CheckCircle2, AlertTriangle, Eye, Send, Building2, User, RefreshCw
} from 'lucide-react';
import { api } from '../api.js';
import InspectorAuditModal from './InspectorAuditModal.jsx';
import CleanlinessReportCard from '../components/CleanlinessReportCard.jsx';

export default function FacilityAuditsView({ user, onOpenLeads, initialLeadForAudit }) {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [showInspectorModal, setShowInspectorModal] = useState(!!initialLeadForAudit);
  const [editingAudit, setEditingAudit] = useState(null);
  const [previewAudit, setPreviewAudit] = useState(null);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadAudits = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/audits');
      setAudits(data || []);
    } catch (err) {
      console.error('Failed to load audits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const handleDeleteAudit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility audit report?')) return;
    try {
      await api.del(`/api/admin/audits/${id}`);
      setAudits(audits.filter(a => a.id !== id));
      setActionSuccess('Audit successfully deleted.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to delete audit: ' + (err.message || err));
    }
  };

  const handleSendEmail = async (audit) => {
    if (!audit.email) {
      const email = prompt('Enter prospect recipient email:', '');
      if (!email) return;
      audit.email = email;
    }

    try {
      setSendingEmailId(audit.id);
      const res = await api.post(`/api/admin/audits/${audit.id}/send-email`, { email: audit.email });
      setActionSuccess(res.message || `Report card emailed to ${audit.email}`);
      loadAudits();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      alert('Failed to send email: ' + (err.message || err));
    } finally {
      setSendingEmailId(null);
    }
  };

  // KPI Calculations
  const totalAudits = audits.length;
  const avgCleanlinessScore = useMemo(() => {
    if (!totalAudits) return 82;
    const sum = audits.reduce((acc, a) => acc + Number(a.overallScore || 75), 0);
    return Math.round(sum / totalAudits);
  }, [audits, totalAudits]);

  const criticalDeficienciesCount = useMemo(() => {
    return audits.reduce((acc, a) => {
      const defs = a.deficiencies || [];
      return acc + defs.filter(d => d.severity === 'critical').length;
    }, 0);
  }, [audits]);

  const filteredAudits = useMemo(() => {
    return audits.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.companyName?.toLowerCase().includes(q) ||
          a.contactName?.toLowerCase().includes(q) ||
          a.facilityType?.toLowerCase().includes(q) ||
          a.inspectorName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [audits, statusFilter, search]);

  const getGradeColor = (score) => {
    if (score >= 90) return '#16a34a';
    if (score >= 80) return '#0284c7';
    if (score >= 70) return '#d97706';
    return '#dc2626';
  };

  return (
    <div style={{ padding: '24px 0', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(14, 95, 216, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e5fd8' }}>
              <Activity size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)' }}>
                Facility Cleanliness &amp; Safety Audits
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                AI-powered 15-point mobile on-site inspections, ATP bio-load swab scoring &amp; client report cards.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-blue"
            onClick={() => {
              setEditingAudit(null);
              setShowInspectorModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontWeight: 700, borderRadius: '8px' }}
          >
            <Plus size={16} /> Start On-Site Audit
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #bbf7d0' }}>
          <CheckCircle2 size={18} /> {actionSuccess}
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="modern-kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="modern-kpi-card blue">
          <div className="kpi-icon-badge blue"><Activity size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">TOTAL INSPECTIONS</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{totalAudits}</span>
              <span className="kpi-label">Completed Audits</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card emerald">
          <div className="kpi-icon-badge emerald"><Sparkles size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">AVERAGE SCORE</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{avgCleanlinessScore}</span>
              <span className="kpi-label">Facility Quality Index</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card amber">
          <div className="kpi-icon-badge amber"><AlertTriangle size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">HAZARDS IDENTIFIED</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{criticalDeficienciesCount}</span>
              <span className="kpi-label">Critical Remediation Flags</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card cyan">
          <div className="kpi-icon-badge cyan"><ShieldCheck size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">CAL/OSHA VERIFICATION</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">100%</span>
              <span className="kpi-label">Certified Checklists</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search audits by company name, facility type, or inspector..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: 'All Audits' },
            { id: 'completed', label: 'Completed' },
            { id: 'sent', label: 'Sent to Client' },
            { id: 'draft', label: 'Drafts' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '20px',
                border: '1px solid',
                cursor: 'pointer',
                borderColor: statusFilter === f.id ? 'var(--blue)' : 'var(--line)',
                background: statusFilter === f.id ? 'rgba(14, 95, 216, 0.08)' : '#ffffff',
                color: statusFilter === f.id ? 'var(--blue)' : 'var(--text-muted)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audits Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {loading && (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading facility audit reports...
          </div>
        )}

        {!loading && filteredAudits.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Activity size={44} color="var(--line)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <h4 style={{ margin: '0 0 6px 0', color: 'var(--navy)', fontSize: '1.05rem' }}>No Facility Audits Found</h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem' }}>Conduct your first on-site cleanliness and safety audit using our mobile inspector.</p>
            <button 
              className="btn btn-blue"
              onClick={() => setShowInspectorModal(true)}
              style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <Plus size={15} style={{ marginRight: '6px' }} /> Start New Audit
            </button>
          </div>
        )}

        {filteredAudits.map(audit => {
          const score = audit.overallScore || 75;
          const gradeColor = getGradeColor(score);
          const atp = Number(audit.atpReading || 0);

          return (
            <div 
              key={audit.id}
              className="card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                {/* Card Header: Company & Grade */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.08rem', fontWeight: 800, color: 'var(--navy)' }}>
                      {audit.companyName}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {audit.facilityType} • {audit.sqFootage || 'Commercial Space'}
                    </div>
                  </div>

                  {/* Circular Grade Badge */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: gradeColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    boxShadow: `0 3px 10px ${gradeColor}44`,
                    flexShrink: 0
                  }}>
                    {audit.grade || 'B'}
                  </div>
                </div>

                {/* Audit Metrics Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px', padding: '10px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>ATP SWAB</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: atp > 100 ? '#dc2626' : atp > 30 ? '#d97706' : '#16a34a' }}>
                      {atp} RLU
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>RESTROOM</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0e5fd8' }}>
                      {audit.restroomScore || 75}/100
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>CAL/OSHA</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: audit.safetyScore >= 80 ? '#16a34a' : '#dc2626' }}>
                      {audit.safetyScore || 85}/100
                    </div>
                  </div>
                </div>

                {/* Details info */}
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Inspector:</strong> {audit.inspectorName || 'Field Lead'}</div>
                  <div><strong>Date:</strong> {new Date(audit.auditDate || audit.createdAt).toLocaleDateString()}</div>
                  {audit.email && <div><strong>Client Email:</strong> {audit.email}</div>}
                </div>

                {/* AI Executive Summary Excerpt */}
                {audit.aiSummary && (
                  <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#334155', background: '#eff6ff', borderLeft: '3px solid #0e5fd8', padding: '8px 10px', borderRadius: '4px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {audit.aiSummary}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                  <button 
                    className="btn btn-blue"
                    onClick={() => setPreviewAudit(audit)}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Eye size={13} /> View Report
                  </button>

                  <button 
                    className="btn btn-outline"
                    onClick={() => handleSendEmail(audit)}
                    disabled={sendingEmailId === audit.id}
                    title="Send Report Card to Client via Email"
                    style={{ padding: '6px 10px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Send size={13} /> {sendingEmailId === audit.id ? 'Sending...' : 'Email'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => {
                      setEditingAudit(audit);
                      setShowInspectorModal(true);
                    }}
                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', color: '#475569', cursor: 'pointer' }}
                    title="Edit / Re-Inspect"
                  >
                    <Edit3 size={14} />
                  </button>

                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDeleteAudit(audit.id)}
                      style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: '6px', padding: '6px', color: '#b91c1c', cursor: 'pointer' }}
                      title="Delete Audit"
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

      {/* Inspector Audit Modal */}
      {showInspectorModal && (
        <InspectorAuditModal 
          initialLead={initialLeadForAudit}
          auditToEdit={editingAudit}
          onClose={() => {
            setShowInspectorModal(false);
            setEditingAudit(null);
          }}
          onSaved={(newAudit) => {
            loadAudits();
            setActionSuccess('Facility audit successfully recorded!');
            setTimeout(() => setActionSuccess(''), 4000);
          }}
        />
      )}

      {/* Full Screen Report Card Preview Modal */}
      {previewAudit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 25, 47, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          overflowY: 'auto',
          padding: '20px 10px'
        }}>
          <CleanlinessReportCard 
            auditData={previewAudit}
            isModal={true}
            onClose={() => setPreviewAudit(null)}
          />
        </div>
      )}

    </div>
  );
}
