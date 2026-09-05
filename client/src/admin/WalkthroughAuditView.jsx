import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api.js';
import { 
  Activity, Sparkles, Building2, User, Phone, Mail, MapPin, 
  DollarSign, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, 
  Camera, Upload, Plus, Trash2, Printer, Send, FileText, 
  ExternalLink, ChevronRight, Check, ArrowRight, RefreshCw, Eye
} from 'lucide-react';
import CleanlinessReportCard from '../components/CleanlinessReportCard.jsx';

const FACILITY_TYPES = [
  'Medical / Dental Clinic',
  'Tech / Corporate Office',
  'Retail / Cannabis Dispensary',
  'Daycare / School Facility',
  'Warehouse / Industrial Facility',
  'HOA / Condominium Common Areas',
  'Restaurant / Commercial Kitchen',
  'Residential Property'
];

const DEFICIENCY_CATEGORIES = [
  'Restroom Tile & Grout',
  'Touchpoint Sanitization',
  'Chemical Storage & Cal/OSHA',
  'Floor Care & Heavy Traffic Wear',
  'Breakroom & Kitchenette Hygiene',
  'Trash & Bio-Waste Containment',
  'Glass & Entryway Presentation',
  'HVAC & Dust Accumulation'
];

export default function WalkthroughAuditView({ user, initialLeadForAudit, onOpenLeads }) {
  const [leads, setLeads] = useState([]);
  const [pastAudits, setPastAudits] = useState([]);
  const [activeView, setActiveView] = useState('new'); // 'new' | 'history'
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('');
  const [generatedAudit, setGeneratedAudit] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState('');

  // Form State
  const [auditForm, setAuditForm] = useState({
    id: '',
    leadId: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    facilityType: 'Tech / Corporate Office',
    sqFootage: '4,500 sq.ft.',
    currentRate: 1850,
    inspectorName: user?.name || 'Dozeles Field Inspector',
    auditDate: new Date().toISOString().slice(0, 10),
    atpReading: 85,
    atpLocation: 'Restroom Faucet & Breakroom Fridge Handle',
    deficiencies: [
      {
        category: 'Restroom Tile & Grout',
        note: 'Grout discoloration and biological buildup around floor drains and fixtures',
        severity: 'critical',
        photo_url: ''
      },
      {
        category: 'Touchpoint Sanitization',
        note: 'Elevated ATP microbial load on shared conference door handles',
        severity: 'moderate',
        photo_url: ''
      }
    ],
    oshaChecklist: {
      sdsBinderPresent: true,
      ghsChemicalLabels: false,
      secondaryContainment: true,
      eyewashUnobstructed: true,
      slipHazardSignage: true,
      electricalPanelClearance: false,
      emergencyEgressClear: true
    },
    fieldNotes: 'Current janitorial contractor visits 2x/week after hours. High touchpoint biofilm buildup indicates lack of hospital-grade disinfectants and proper dwell times.'
  });

  // Load leads and past audits
  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, auditsData] = await Promise.all([
        api.get('/api/admin/leads').catch(() => []),
        api.get('/api/admin/audits').catch(() => [])
      ]);
      setLeads(leadsData || []);
      setPastAudits(auditsData || []);
    } catch (err) {
      console.error('Error loading walkthrough audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pre-fill from selected lead if provided
  useEffect(() => {
    if (initialLeadForAudit) {
      applyLeadToForm(initialLeadForAudit);
    }
  }, [initialLeadForAudit]);

  const applyLeadToForm = (lead) => {
    if (!lead) return;
    setSelectedLeadId(lead.id || '');
    setAuditForm(prev => ({
      ...prev,
      leadId: lead.id || '',
      companyName: lead.companyName || prev.companyName,
      contactName: lead.contactName || prev.contactName,
      email: lead.email || prev.email,
      phone: lead.phone || prev.phone,
      address: lead.address || prev.address,
      facilityType: lead.facilityType || prev.facilityType,
      sqFootage: lead.squareFootage || lead.sqFootage || prev.sqFootage,
      currentRate: Number(lead.estimatedMonthlyValue) || prev.currentRate,
      fieldNotes: lead.notes ? `Lead Inquiry Notes: ${lead.notes}` : prev.fieldNotes
    }));
    setActiveView('new');
    setGeneratedAudit(null);
  };

  const handleSelectLeadChange = (e) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);
    if (!leadId) return;
    const found = leads.find(l => l.id === leadId);
    if (found) applyLeadToForm(found);
  };

  // Add deficiency item
  const addDeficiency = () => {
    setAuditForm(prev => ({
      ...prev,
      deficiencies: [
        ...prev.deficiencies,
        {
          category: 'Touchpoint Sanitization',
          note: '',
          severity: 'moderate',
          photo_url: ''
        }
      ]
    }));
  };

  const updateDeficiency = (index, field, value) => {
    const updated = [...auditForm.deficiencies];
    updated[index][field] = value;
    setAuditForm(prev => ({ ...prev, deficiencies: updated }));
  };

  const removeDeficiency = (index) => {
    const updated = auditForm.deficiencies.filter((_, i) => i !== index);
    setAuditForm(prev => ({ ...prev, deficiencies: updated }));
  };

  // ATP Status Helper
  const atpStatus = useMemo(() => {
    const val = Number(auditForm.atpReading || 0);
    if (val < 30) return { label: 'PASS (< 30 RLU)', sub: 'Clinical & Hospital Grade Clean', color: '#15803d', bg: '#dcfce7', border: '#86efac' };
    if (val <= 100) return { label: 'CAUTION (30 - 100 RLU)', sub: 'Elevated Bio-Film / Incomplete Disinfection', color: '#b45309', bg: '#fef3c7', border: '#fde68a' };
    return { label: 'FAIL (> 100 RLU)', sub: 'Critical Bio-Load Contamination', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' };
  }, [auditForm.atpReading]);

  // Rate benchmark calculation
  const benchmarkRate = useMemo(() => {
    const sqft = parseInt(String(auditForm.sqFootage || '').replace(/[^0-9]/g, ''), 10) || 4500;
    const rate = Number(auditForm.currentRate || 0);
    const costPerSqft = (rate / sqft).toFixed(2);
    const bayAreaAvg = auditForm.facilityType.includes('Medical') ? 0.28 : (auditForm.facilityType.includes('Warehouse') ? 0.12 : 0.22);
    return { sqft, costPerSqft, bayAreaAvg };
  }, [auditForm.sqFootage, auditForm.currentRate, auditForm.facilityType]);

  // Generate AI Audit
  const handleGenerateAiReport = async () => {
    if (!auditForm.companyName.trim()) {
      alert('Please enter a Company / Facility Name first.');
      return;
    }

    try {
      setAnalyzing(true);
      setEmailSuccessMsg('');
      const saved = await api.post('/api/admin/audits', auditForm);
      setGeneratedAudit(saved);
      // Refresh past audits list
      const refreshedAudits = await api.get('/api/admin/audits');
      setPastAudits(refreshedAudits || []);
    } catch (err) {
      alert('Error generating AI audit report: ' + (err.message || err));
    } finally {
      setAnalyzing(false);
    }
  };

  // Dispatch Email to Client
  const handleSendEmailToClient = async () => {
    if (!generatedAudit?.id) return;
    const recipient = generatedAudit.email || auditForm.email;
    if (!recipient) {
      alert('Please provide a prospect email address to dispatch the report card.');
      return;
    }

    try {
      setSendingEmail(true);
      setEmailSuccessMsg('');
      await api.post(`/api/admin/audits/${generatedAudit.id}/send-email`, { email: recipient });
      setEmailSuccessMsg(`✓ Report card emailed directly to ${recipient} (CC: Maialeticia@hotmail.com & team)`);
    } catch (err) {
      alert('Failed to send email: ' + (err.message || err));
    } finally {
      setSendingEmail(false);
    }
  };

  const handleStartNewFresh = () => {
    setGeneratedAudit(null);
    setSelectedLeadId('');
    setAuditForm({
      id: '',
      leadId: '',
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      facilityType: 'Tech / Corporate Office',
      sqFootage: '4,000 sq.ft.',
      currentRate: 1600,
      inspectorName: user?.name || 'Dozeles Field Inspector',
      auditDate: new Date().toISOString().slice(0, 10),
      atpReading: 65,
      atpLocation: 'Restroom Faucet Handle',
      deficiencies: [
        {
          category: 'Restroom Tile & Grout',
          note: 'Moderate discoloration around urinal bases',
          severity: 'moderate',
          photo_url: ''
        }
      ],
      oshaChecklist: {
        sdsBinderPresent: true,
        ghsChemicalLabels: false,
        secondaryContainment: true,
        eyewashUnobstructed: true,
        slipHazardSignage: true,
        electricalPanelClearance: false,
        emergencyEgressClear: true
      },
      fieldNotes: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0E5FD8 100%)', borderRadius: '14px', padding: '24px 28px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 8px 24px rgba(14, 95, 216, 0.2)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
            <Sparkles size={14} /> AI-POWERED FIELD INSPECTOR
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Walkthrough Cleanliness &amp; Safety Audit
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', maxWidth: '650px', lineHeight: 1.5 }}>
            Perform on-site facility walkthroughs on mobile or laptop. Log ATP bio-load swabs, visual grout defects, and Cal/OSHA compliance to generate a branded 15-point report card in 60 seconds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { setActiveView('new'); handleStartNewFresh(); }}
            style={{
              background: activeView === 'new' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: activeView === 'new' ? '#0e5fd8' : '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> + New Walkthrough Audit
          </button>
          <button 
            onClick={() => setActiveView('history')}
            style={{
              background: activeView === 'history' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: activeView === 'history' ? '#0e5fd8' : '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} /> Past Audits ({pastAudits.length})
          </button>
        </div>
      </div>

      {/* Main Single Window Content */}
      {activeView === 'new' && (
        <div style={{ display: 'grid', gridTemplateColumns: generatedAudit ? '1fr 1fr' : '1fr', gap: '24px' }}>
          {/* Left Column: Interactive 4-Module Audit Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Pre-fill from CRM Leads */}
            <div className="card" style={{ padding: '18px 20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 Pre-Fill from Incoming Walkthrough Lead
                </span>
                <span style={{ fontSize: '0.78rem', color: '#0284c7' }}>
                  Auto-fills company name, square footage &amp; contact info
                </span>
              </div>
              <select 
                value={selectedLeadId} 
                onChange={handleSelectLeadChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #7dd3fc', background: '#ffffff', fontSize: '0.9rem', fontWeight: 600, color: '#0a2540' }}
              >
                <option value="">-- Choose an incoming lead from CRM or enter custom below --</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.companyName || l.contactName} ({l.facilityType || 'Facility'}) • {l.squareFootage || '4,000 sq.ft.'} • {l.contactName}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 1: Facility Profile */}
            <div className="card" style={{ padding: '22px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="var(--blue)" />
                1. Facility Profile &amp; Inspector Info
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>Company / Facility Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BioGenix Innovation Labs" 
                    value={auditForm.companyName} 
                    onChange={e => setAuditForm({ ...auditForm, companyName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                    required 
                  />
                </div>

                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>Contact Name / Manager</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dr. Vanessa Sterling" 
                    value={auditForm.contactName} 
                    onChange={e => setAuditForm({ ...auditForm, contactName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }} 
                  />
                </div>

                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>Work Email (for Report Dispatch)</label>
                  <input 
                    type="email" 
                    placeholder="manager@company.com" 
                    value={auditForm.email} 
                    onChange={e => setAuditForm({ ...auditForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }} 
                  />
                </div>

                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>Direct Phone</label>
                  <input 
                    type="tel" 
                    placeholder="650-555-0199" 
                    value={auditForm.phone} 
                    onChange={e => setAuditForm({ ...auditForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }} 
                  />
                </div>

                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>Facility Classification</label>
                  <select 
                    value={auditForm.facilityType} 
                    onChange={e => setAuditForm({ ...auditForm, facilityType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  >
                    {FACILITY_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>Total Square Footage</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5,000 sq.ft." 
                    value={auditForm.sqFootage} 
                    onChange={e => setAuditForm({ ...auditForm, sqFootage: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }} 
                  />
                </div>

                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>Current Janitorial Spend ($/mo)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1850" 
                    value={auditForm.currentRate} 
                    onChange={e => setAuditForm({ ...auditForm, currentRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }} 
                  />
                </div>

                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>Certified Inspector Name</label>
                  <input 
                    type="text" 
                    value={auditForm.inspectorName} 
                    onChange={e => setAuditForm({ ...auditForm, inspectorName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Module 1 — ATP Swab Bioluminescence */}
            <div className="card" style={{ padding: '22px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--blue)" />
                  2. Module 1: ATP Surface Bio-Load Luminometer
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: atpStatus.bg, color: atpStatus.color, border: `1px solid ${atpStatus.border}` }}>
                  {atpStatus.label}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', alignItems: 'center' }}>
                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '4px', fontWeight: 700 }}>ATP Reading (RLU)</label>
                  <input 
                    type="number" 
                    value={auditForm.atpReading} 
                    onChange={e => setAuditForm({ ...auditForm, atpReading: Number(e.target.value) })}
                    style={{ width: '100%', fontSize: '1.4rem', fontWeight: 800, padding: '10px 14px', borderRadius: '8px', border: `2px solid ${atpStatus.border}`, color: atpStatus.color, textAlign: 'center' }} 
                  />
                </div>

                <div>
                  <label className="form-note" style={{ display: 'block', marginBottom: '4px', fontWeight: 700 }}>Test Location / High-Touch Surface</label>
                  <input 
                    type="text" 
                    value={auditForm.atpLocation} 
                    onChange={e => setAuditForm({ ...auditForm, atpLocation: e.target.value })}
                    placeholder="e.g. Main Restroom Faucet &amp; Keypad" 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.9rem' }} 
                  />
                  <div style={{ fontSize: '0.78rem', color: atpStatus.color, marginTop: '6px', fontWeight: 600 }}>
                    Status: {atpStatus.sub}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Module 2 — Restroom & Grout Hygiene Defect Logger */}
            <div className="card" style={{ padding: '22px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#d97706" />
                  3. Module 2: Visual Deficiencies &amp; Grout Condition
                </h3>
                <button 
                  onClick={addDeficiency}
                  className="btn btn-outline"
                  style={{ padding: '5px 12px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '6px', color: 'var(--blue)' }}
                >
                  <Plus size={14} /> Add Defect
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditForm.deficiencies.map((def, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <select 
                        value={def.category} 
                        onChange={e => updateDeficiency(idx, 'category', e.target.value)}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        {DEFICIENCY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['minor', 'moderate', 'critical'].map(sev => (
                          <button
                            key={sev}
                            type="button"
                            onClick={() => updateDeficiency(idx, 'severity', sev)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              background: def.severity === sev 
                                ? (sev === 'critical' ? '#dc2626' : sev === 'moderate' ? '#d97706' : '#16a34a')
                                : '#e2e8f0',
                              color: def.severity === sev ? '#ffffff' : '#64748b'
                            }}
                          >
                            {sev}
                          </button>
                        ))}
                      </div>

                      <button 
                        type="button" 
                        onClick={() => removeDeficiency(idx)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <input 
                      type="text" 
                      placeholder="Describe visible issue (e.g. Grout discoloration around urinals, missing soap dispenser)..." 
                      value={def.note} 
                      onChange={e => updateDeficiency(idx, 'note', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.85rem' }} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Module 3 — Cal/OSHA & Safety Audit Checklist */}
            <div className="card" style={{ padding: '22px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#16a34a" />
                4. Module 3: Cal/OSHA Safety &amp; Hazard Checklist
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {[
                  { key: 'sdsBinderPresent', label: 'Safety Data Sheets (SDS) Binder Current & Visible' },
                  { key: 'ghsChemicalLabels', label: 'GHS Compliant Secondary Chemical Bottle Labels' },
                  { key: 'secondaryContainment', label: 'Secondary Containment Trays in Janitorial Closet' },
                  { key: 'eyewashUnobstructed', label: 'Emergency Eyewash Station Unobstructed' },
                  { key: 'slipHazardSignage', label: 'Wet Floor Caution Cones & Slip Hazard Signage' },
                  { key: 'electricalPanelClearance', label: 'Electrical Panel 36-Inch Clearance Maintained' },
                  { key: 'emergencyEgressClear', label: 'Fire Exit & Emergency Egress Corridors Clear' }
                ].map(item => {
                  const val = auditForm.oshaChecklist[item.key];
                  return (
                    <div 
                      key={item.key}
                      onClick={() => setAuditForm({
                        ...auditForm,
                        oshaChecklist: { ...auditForm.oshaChecklist, [item.key]: !val }
                      })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${val ? '#86efac' : '#fca5a5'}`,
                        background: val ? '#f0fdf4' : '#fef2f2',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: val ? '#166534' : '#991b1b' }}>
                        {item.label}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: val ? '#16a34a' : '#dc2626', color: '#ffffff' }}>
                        {val ? 'PASS' : 'FLAG'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Module 4 & Field Notes */}
            <div className="card" style={{ padding: '22px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--blue)" />
                5. Inspector Notes &amp; Pricing Benchmark
              </h3>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', color: '#334155' }}>
                <strong>Bay Area Scope Benchmark:</strong> Client is currently paying <strong>${benchmarkRate.costPerSqft}/sq.ft</strong> (Bay Area Avg: <strong>${benchmarkRate.bayAreaAvg}/sq.ft</strong> for {auditForm.facilityType}).
              </div>

              <textarea 
                rows="3" 
                placeholder="Type field observations, cleaning contractor pain points, or speech memo..."
                value={auditForm.fieldNotes}
                onChange={e => setAuditForm({ ...auditForm, fieldNotes: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.88rem', lineHeight: '1.5' }}
              />
            </div>

            {/* Bottom Generate Button */}
            <button 
              type="button"
              disabled={analyzing}
              onClick={handleGenerateAiReport}
              style={{
                background: 'linear-gradient(135deg, #0e5fd8 0%, #0a4bb0 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '10px',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 6px 20px rgba(14, 95, 216, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="spin" size={20} />
                  <span>AI Multimodal Analysis &amp; Scoring in Progress...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>✨ GENERATE AI CLEANLINESS &amp; SAFETY REPORT CARD</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Generated Report Card Preview */}
          {generatedAudit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Action Toolbar */}
              <div className="card" style={{ padding: '16px 20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                    ✓ REPORT CARD READY
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>
                    Grade {generatedAudit.grade} ({generatedAudit.overallScore}/100)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a 
                    href={`/report/${generatedAudit.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> Open Full View
                  </a>

                  <button 
                    onClick={() => window.open(`/report/${generatedAudit.id}`, '_blank')}
                    className="btn btn-blue"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 14px', borderRadius: '6px' }}
                  >
                    <Printer size={14} /> Print / Save PDF
                  </button>

                  <button 
                    disabled={sendingEmail}
                    onClick={handleSendEmailToClient}
                    style={{ background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={14} /> {sendingEmail ? 'Dispatching...' : 'Email Client'}
                  </button>
                </div>
              </div>

              {emailSuccessMsg && (
                <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem' }}>
                  {emailSuccessMsg}
                </div>
              )}

              {/* Embedded Live Report Card */}
              <div style={{ maxHeight: '900px', overflowY: 'auto', borderRadius: '12px', border: '1px solid var(--line)', background: '#ffffff' }}>
                <CleanlinessReportCard auditData={generatedAudit} isModal={true} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Past Audits History View */}
      {activeView === 'history' && (
        <div className="card" style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)' }}>
              Completed Facility Walkthrough Audits ({pastAudits.length})
            </h3>
            <button 
              onClick={() => { setActiveView('new'); handleStartNewFresh(); }}
              className="btn btn-blue"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> + New Walkthrough Audit
            </button>
          </div>

          <div className="table-card" style={{ border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700 }}>FACILITY / COMPANY</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700 }}>FACILITY TYPE</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700 }}>ATP BIO-LOAD</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700 }}>GRADE &amp; SCORE</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700 }}>INSPECTOR</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pastAudits.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No facility audits recorded yet. Click "+ New Walkthrough Audit" above to perform the first on-site audit!
                    </td>
                  </tr>
                ) : (
                  pastAudits.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--navy)' }}>{a.companyName}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.contactName} • {a.email || 'No email'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 600 }}>
                        {a.facilityType}
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.sqFootage}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 800, color: a.atpReading <= 30 ? '#15803d' : (a.atpReading <= 100 ? '#d97706' : '#dc2626') }}>
                          {a.atpReading} RLU
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 900, fontSize: '0.95rem', color: a.overallScore >= 80 ? '#15803d' : (a.overallScore >= 70 ? '#d97706' : '#dc2626') }}>
                          Grade {a.grade} ({a.overallScore}/100)
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {a.inspectorName || 'Inspector'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <a 
                            href={`/report/${a.id}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={13} /> View Report
                          </a>
                          <button 
                            onClick={() => {
                              setGeneratedAudit(a);
                              setActiveView('new');
                            }}
                            className="btn btn-blue"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                          >
                            Edit / Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
