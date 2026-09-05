import React, { useState, useEffect } from 'react';
import { 
  X, Camera, Sparkles, Activity, ShieldCheck, 
  Building2, AlertTriangle, Plus, Trash2, CheckCircle2, 
  RefreshCw, ArrowRight, ArrowLeft, Upload, FileText, Send
} from 'lucide-react';
import { api } from '../api.js';

export default function InspectorAuditModal({ initialLead, auditToEdit, onClose, onSaved }) {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    leadId: initialLead?.id || auditToEdit?.leadId || '',
    companyName: initialLead?.companyName || auditToEdit?.companyName || '',
    contactName: initialLead?.contactName || auditToEdit?.contactName || '',
    email: initialLead?.email || auditToEdit?.email || '',
    phone: initialLead?.phone || auditToEdit?.phone || '',
    address: initialLead?.address || auditToEdit?.address || '',
    facilityType: initialLead?.facilityType || auditToEdit?.facilityType || 'Tech / Corporate Office',
    sqFootage: initialLead?.squareFootage || auditToEdit?.sqFootage || '5,000 sq.ft.',
    currentRate: initialLead?.estimatedMonthlyValue || auditToEdit?.currentRate || 1800,
    inspectorName: auditToEdit?.inspectorName || 'Lead Inspector',
    auditDate: auditToEdit?.auditDate || new Date().toISOString().split('T')[0],

    // Module 1: ATP Swab
    atpReading: auditToEdit?.atpReading || 45,
    atpLocation: auditToEdit?.atpLocation || 'Main Restroom Entry Door Handle',

    // Module 2: Restroom & Grout
    restroomScore: auditToEdit?.restroomScore || 75,
    deficiencies: auditToEdit?.deficiencies || [
      { category: 'Restroom Tile & Grout', note: 'Visible porous grout discoloration and urinal base scale buildup', severity: 'moderate' },
      { category: 'Touchpoint Sanitization', note: 'Door push plates and breakroom faucet handles show unaddressed bio-film', severity: 'moderate' }
    ],

    // Module 3: Cal/OSHA Safety
    oshaChecklist: auditToEdit?.oshaChecklist || {
      sdsBinderPresent: true,
      ghsChemicalLabels: false,
      secondaryContainment: true,
      eyewashUnobstructed: true,
      slipHazardSignage: true,
      electricalPanelClearance: true,
      emergencyEgressClear: true
    },

    // Module 4: Notes & AI
    fieldNotes: auditToEdit?.fieldNotes || initialLead?.notes || '',
    aiSummary: auditToEdit?.aiSummary || '',
    overallScore: auditToEdit?.overallScore || 0,
    grade: auditToEdit?.grade || '',
    status: auditToEdit?.status || 'draft'
  });

  const [newDeficiency, setNewDeficiency] = useState({
    category: 'Restroom Fixtures',
    note: '',
    severity: 'moderate'
  });

  // ATP Status Helper
  const getAtpColor = (val) => {
    const num = Number(val || 0);
    if (num <= 30) return { color: '#16a34a', bg: '#dcfce7', label: 'PASS (<30 RLU) - Hospital Clean' };
    if (num <= 100) return { color: '#d97706', bg: '#fef3c7', label: 'CAUTION (30-100 RLU) - Bio-Film Residue' };
    return { color: '#dc2626', bg: '#fee2e2', label: 'FAIL (>100 RLU) - Contaminated Surface' };
  };

  const handleAddDeficiency = () => {
    if (!newDeficiency.note.trim()) return;
    setFormData({
      ...formData,
      deficiencies: [...formData.deficiencies, { ...newDeficiency }]
    });
    setNewDeficiency({ category: 'Restroom Fixtures', note: '', severity: 'moderate' });
  };

  const handleRemoveDeficiency = (index) => {
    setFormData({
      ...formData,
      deficiencies: formData.deficiencies.filter((_, i) => i !== index)
    });
  };

  const handleOshaToggle = (key) => {
    setFormData({
      ...formData,
      oshaChecklist: {
        ...formData.oshaChecklist,
        [key]: !formData.oshaChecklist[key]
      }
    });
  };

  // Run AI Synthesis
  const handleRunAiAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await api.post('/api/audits/analyze', formData);
      setFormData(prev => ({
        ...prev,
        restroomScore: res.restroomScore,
        safetyScore: res.safetyScore,
        scopeScore: res.scopeScore,
        overallScore: res.overallScore,
        grade: res.grade,
        aiSummary: res.aiSummary,
        deficiencies: res.topDeficiencies && res.topDeficiencies.length > 0 
          ? res.topDeficiencies.map(d => ({ category: d.category, note: d.issue, severity: d.severity, correctiveAction: d.correctiveAction }))
          : prev.deficiencies
      }));
      setStep(5); // Jump to review / finish step
    } catch (err) {
      setError('AI Analysis failed: ' + (err.message || err));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAudit = async (finalStatus = 'completed') => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...formData, status: finalStatus };
      let saved;
      if (auditToEdit?.id) {
        saved = await api.put(`/api/admin/audits/${auditToEdit.id}`, payload);
      } else {
        saved = await api.post('/api/admin/audits', payload);
      }
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      setError('Failed to save audit: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const atpStatus = getAtpColor(formData.atpReading);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 25, 47, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '12px',
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '92vh',
        background: '#ffffff',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0A2540, #0E5FD8)',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                On-Site Facility Cleanliness &amp; Safety Audit
              </h3>
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '2px' }}>
              Step {step} of 5 • {step === 1 ? 'Facility Info' : step === 2 ? 'ATP Bio-Load Swab' : step === 3 ? 'Restroom & Grout' : step === 4 ? 'Cal/OSHA Safety' : 'AI Analysis & Report Card'}
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div style={{ display: 'flex', height: '4px', background: '#e2e8f0' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <div 
              key={s} 
              style={{ 
                flex: 1, 
                background: s <= step ? '#0e5fd8' : 'transparent',
                transition: 'background 0.3s ease'
              }} 
            />
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* STEP 1: Facility Profile */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Company / Facility Name *</label>
                  <input 
                    type="text" 
                    value={formData.companyName} 
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.contactName} 
                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Work Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Direct Phone</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Facility Classification</label>
                  <select 
                    value={formData.facilityType} 
                    onChange={e => setFormData({ ...formData, facilityType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="Tech / Corporate Office">Tech / Corporate Office</option>
                    <option value="Medical / Dental Clinic">Medical / Dental Clinic</option>
                    <option value="Retail / Cannabis Dispensary">Retail / Cannabis Dispensary</option>
                    <option value="Daycare / School Facility">Daycare / School Facility</option>
                    <option value="Warehouse / Industrial Facility">Warehouse / Industrial Facility</option>
                    <option value="HOA / Condominium Common Areas">HOA / Condominium Common Areas</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Total Square Footage</label>
                  <input 
                    type="text" 
                    value={formData.sqFootage} 
                    onChange={e => setFormData({ ...formData, sqFootage: e.target.value })}
                    placeholder="e.g. 6,500 sq.ft."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Current Monthly Cleaning Spend ($)</label>
                  <input 
                    type="number" 
                    value={formData.currentRate} 
                    onChange={e => setFormData({ ...formData, currentRate: e.target.value })}
                    placeholder="e.g. 1800"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Lead Inspector</label>
                  <input 
                    type="text" 
                    value={formData.inspectorName} 
                    onChange={e => setFormData({ ...formData, inspectorName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ATP Bio-Load Swab */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0a2540' }}>
                  Module 1: Surface Bio-Load Swab (Luminometer Test)
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Swab high-touch points (restroom handles, breakroom sink fixtures, or exam tables) to test microbial adenosine triphosphate (ATP) residue.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Swab Test Location</label>
                <input 
                  type="text" 
                  value={formData.atpLocation} 
                  onChange={e => setFormData({ ...formData, atpLocation: e.target.value })}
                  placeholder="e.g. Main Restroom Door Handle / Breakroom Counter"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0a2540' }}>ATP Meter Reading (RLU)</label>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: atpStatus.bg, color: atpStatus.color }}>
                    {atpStatus.label}
                  </span>
                </div>
                <input 
                  type="number" 
                  value={formData.atpReading} 
                  onChange={e => setFormData({ ...formData, atpReading: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #0e5fd8', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
                />
              </div>

              {/* Reference Meter */}
              <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', fontSize: '0.78rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div style={{ color: '#16a34a', fontWeight: 700 }}>&lt; 30 RLU<br/><span style={{ fontWeight: 400 }}>Pass (Disinfected)</span></div>
                <div style={{ color: '#d97706', fontWeight: 700 }}>30 - 100 RLU<br/><span style={{ fontWeight: 400 }}>Caution (Bio-Film)</span></div>
                <div style={{ color: '#dc2626', fontWeight: 700 }}>&gt; 100 RLU<br/><span style={{ fontWeight: 400 }}>Fail (Contaminated)</span></div>
              </div>
            </div>
          )}

          {/* STEP 3: Restroom & Grout Hygiene */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0a2540' }}>
                  Module 2: Restroom &amp; Grout Hygiene Inspection
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Log observed soil buildup, urinal uric scale, fixture spotting, or poor touchpoint disinfection.
                </p>
              </div>

              {/* Deficiencies List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.deficiencies.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.84rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0a2540' }}>[{d.category}]</span> {d.note}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: d.severity === 'critical' ? '#fee2e2' : '#fef3c7', color: d.severity === 'critical' ? '#b91c1c' : '#b45309', textTransform: 'uppercase' }}>
                        {d.severity}
                      </span>
                      <button onClick={() => handleRemoveDeficiency(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Deficiency Form */}
              <div style={{ border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                  <select 
                    value={newDeficiency.category} 
                    onChange={e => setNewDeficiency({ ...newDeficiency, category: e.target.value })}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Restroom Tile & Grout">Restroom Tile &amp; Grout</option>
                    <option value="Restroom Fixtures">Restroom Fixtures &amp; Mirrors</option>
                    <option value="Touchpoint Sanitization">Touchpoint Sanitization</option>
                    <option value="Breakroom Sanitation">Breakroom Sanitation</option>
                    <option value="Floor Care & Buffing">Floor Care &amp; Buffing</option>
                    <option value="Trash & Odor Control">Trash &amp; Odor Control</option>
                  </select>

                  <select 
                    value={newDeficiency.severity} 
                    onChange={e => setNewDeficiency({ ...newDeficiency, severity: e.target.value })}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="minor">Minor Issue</option>
                    <option value="moderate">Moderate Issue</option>
                    <option value="critical">Critical Issue</option>
                  </select>
                </div>

                <input 
                  type="text" 
                  placeholder="Describe observed deficiency..."
                  value={newDeficiency.note}
                  onChange={e => setNewDeficiency({ ...newDeficiency, note: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />

                <button 
                  type="button" 
                  onClick={handleAddDeficiency}
                  style={{ alignSelf: 'flex-end', background: '#0e5fd8', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add Deficiency
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Cal/OSHA & Safety Audit */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0a2540' }}>
                  Module 3: Cal/OSHA Safety &amp; Workplace Compliance
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Verify chemical storage, GHS safety labeling, and hazard clearance to avoid state OSHA fines.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'sdsBinderPresent', label: 'SDS (Safety Data Sheets) binder present & accessible in janitorial closet' },
                  { key: 'ghsChemicalLabels', label: 'All cleaning chemical spray bottles have compliant GHS OSHA labels' },
                  { key: 'secondaryContainment', label: 'Secondary spill containment trays present under chemical bulk storage' },
                  { key: 'eyewashUnobstructed', label: 'Emergency eyewash station clear & unobstructed within 10-second travel' },
                  { key: 'slipHazardSignage', label: 'Caution wet floor signs & entryway moisture control matting deployed' },
                  { key: 'electricalPanelClearance', label: 'Electrical breaker panels maintain 36-inch clear dedicated zone' },
                  { key: 'emergencyEgressClear', label: 'Emergency exit hallways and fire extinguishers completely unobstructed' }
                ].map(item => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#1e293b', cursor: 'pointer', padding: '8px 10px', background: formData.oshaChecklist[item.key] ? '#f0fdf4' : '#fff1f2', borderRadius: '6px', border: '1px solid', borderColor: formData.oshaChecklist[item.key] ? '#bbf7d0' : '#fecdd3' }}>
                    <input 
                      type="checkbox" 
                      checked={!!formData.oshaChecklist[item.key]} 
                      onChange={() => handleOshaToggle(item.key)}
                    />
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>Field Notes / Voice Memo Transcriptions</label>
                <textarea 
                  rows={3}
                  value={formData.fieldNotes}
                  onChange={e => setFormData({ ...formData, fieldNotes: e.target.value })}
                  placeholder="Enter inspector memos, vendor observations, or specific facility requirements..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {/* STEP 5: AI Analysis & Final Report Card Review */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, #0e5fd8 0%, #0a4bb0 100%)', color: '#fff', padding: '18px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>AUDIT COMPLETED</div>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: 900 }}>
                    Grade {formData.grade || 'B'} • {formData.overallScore || 78}/100
                  </h3>
                </div>

                <button 
                  onClick={handleRunAiAnalysis} 
                  disabled={analyzing}
                  style={{ background: '#ffffff', color: '#0e5fd8', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} className={analyzing ? 'spin' : ''} /> {analyzing ? 'Analyzing...' : 'Re-Run AI'}
                </button>
              </div>

              {/* Categorical Scores Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>ATP SWAB</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0e5fd8' }}>{formData.atpReading} RLU</div>
                </div>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>RESTROOM</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0e5fd8' }}>{formData.restroomScore}/100</div>
                </div>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>CAL/OSHA</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0e5fd8' }}>{formData.safetyScore || 85}/100</div>
                </div>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>SCOPE/RATE</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0e5fd8' }}>{formData.scopeScore || 85}/100</div>
                </div>
              </div>

              {/* AI Generated Executive Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>AI Executive Summary &amp; Corrective Action Plan</label>
                <textarea 
                  rows={6}
                  value={formData.aiSummary}
                  onChange={e => setFormData({ ...formData, aiSummary: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, color: '#334155' }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {step > 1 ? (
            <button 
              type="button" 
              onClick={() => setStep(step - 1)}
              style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={15} /> Previous
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '10px' }}>
            {step < 4 ? (
              <button 
                type="button" 
                onClick={() => setStep(step + 1)}
                style={{ background: '#0e5fd8', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Next <ArrowRight size={15} />
              </button>
            ) : step === 4 ? (
              <button 
                type="button" 
                onClick={handleRunAiAnalysis}
                disabled={analyzing}
                style={{ background: 'linear-gradient(135deg, #0e5fd8, #0a4bb0)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '8px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(14, 95, 216, 0.3)' }}
              >
                <Sparkles size={16} /> {analyzing ? 'Synthesizing with AI...' : 'Run AI Analysis & Generate Report'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => handleSaveAudit('draft')}
                  disabled={saving}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Save Draft
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSaveAudit('completed')}
                  disabled={saving}
                  style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={16} /> {saving ? 'Finalizing...' : 'Save & Complete Audit'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
