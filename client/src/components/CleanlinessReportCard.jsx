import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Printer, Download, Mail, ArrowLeft, Phone, Calendar, 
  Building2, User, Sparkles, Activity, FileText, Check, Award
} from 'lucide-react';
import { api } from '../api.js';

export default function CleanlinessReportCard({ auditData, isModal = false, onClose }) {
  const { id } = useParams();
  const [audit, setAudit] = useState(auditData || null);
  const [loading, setLoading] = useState(!auditData && !!id);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auditData && id) {
      setLoading(true);
      api.get(`/api/admin/audits/${id}`)
        .then(data => {
          setAudit(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          // Try fallback public route
          fetch(`/api/admin/audits/${id}`)
            .then(r => r.json())
            .then(data => {
              if (data && !data.error) setAudit(data);
              else setError('Audit report could not be loaded or is private.');
              setLoading(false);
            })
            .catch(() => {
              setError('Failed to load facility audit report.');
              setLoading(false);
            });
        });
    }
  }, [id, auditData]);

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <h3>Loading Facility Cleanliness &amp; Safety Report Card...</h3>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Report Not Found</h2>
        <p>{error || 'This audit report may have been archived or moved.'}</p>
        <Link to="/" style={{ color: '#0e5fd8', textDecoration: 'none', fontWeight: 700 }}>
          ← Return to Dozeles Home
        </Link>
      </div>
    );
  }

  const getGradeColor = (score) => {
    if (score >= 90) return '#16a34a'; // Green
    if (score >= 80) return '#0284c7'; // Blue
    if (score >= 70) return '#d97706'; // Amber
    return '#dc2626'; // Red
  };

  const getAtpBadge = (atp) => {
    const val = Number(atp || 0);
    if (val === 0) return { label: 'Not Tested', bg: '#f1f5f9', color: '#64748b' };
    if (val <= 30) return { label: 'PASS (< 30 RLU) - Hospital Clean', bg: '#dcfce7', color: '#15803d' };
    if (val <= 100) return { label: 'CAUTION (30-100 RLU) - Bio-Film Residue', bg: '#fef3c7', color: '#b45309' };
    return { label: 'CRITICAL FAIL (> 100 RLU) - Contaminated Surface', bg: '#fee2e2', color: '#b91c1c' };
  };

  const atpStatus = getAtpBadge(audit.atpReading);
  const mainGradeColor = getGradeColor(audit.overallScore || 75);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-card-wrapper" style={{
      background: '#f8fafc',
      minHeight: '100vh',
      padding: isModal ? '0' : '40px 16px',
      color: '#0f172a',
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print" style={{
        maxWidth: '900px',
        margin: '0 auto 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 8px'
      }}>
        {!isModal ? (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Dozeles
          </Link>
        ) : (
          <div style={{ fontWeight: 700, color: '#0a2540', fontSize: '1.05rem' }}>
            Client-Ready Report Preview
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0e5fd8',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(14, 95, 216, 0.25)'
            }}
          >
            <Printer size={15} /> Print / Save PDF
          </button>
          {isModal && onClose && (
            <button 
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                color: '#334155',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="printable-report-document" style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header Ribbon */}
        <div style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #0E5FD8 100%)',
          color: '#ffffff',
          padding: '30px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <img 
                src="/images/dozeles-logo.png" 
                alt="Dozeles" 
                style={{ height: '42px', background: '#fff', padding: '4px 8px', borderRadius: '6px' }}
                onError={(e) => { e.target.onerror = null; e.target.src = '/images/dozeles-logo.jpg'; }}
              />
              <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                  DOZELES PROFESSIONAL CLEANING
                </h1>
                <div style={{ fontSize: '0.8rem', opacity: 0.85, letterSpacing: '0.5px' }}>
                  CERTIFIED COMMERCIAL &amp; RESIDENTIAL JANITORIAL SERVICES
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', opacity: 0.9 }}>
              CA Certified Small Business #2041212 • DIR Janitorial Reg. #JS-LR-1001274287
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
              FACILITY AUDIT REPORT CARD
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>
              REF #{audit.id?.slice(0, 8).toUpperCase()}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '2px' }}>
              {new Date(audit.auditDate || audit.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Facility Metadata Strip */}
        <div style={{
          background: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          padding: '18px 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          fontSize: '0.85rem'
        }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Inspected Facility</div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{audit.companyName}</div>
            <div style={{ color: '#475569', fontSize: '0.78rem' }}>{audit.facilityType}</div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Contact Person</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{audit.contactName || 'Facility Manager'}</div>
            <div style={{ color: '#475569', fontSize: '0.78rem' }}>{audit.email || audit.phone || 'On-Site Walkthrough'}</div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Facility Scope</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{audit.sqFootage || '5,000 sq.ft.'}</div>
            <div style={{ color: '#475569', fontSize: '0.78rem' }}>Square Footage</div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Certified Inspector</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{audit.inspectorName || 'Field Lead'}</div>
            <div style={{ color: '#16a34a', fontSize: '0.78rem', fontWeight: 600 }}>● Verification Complete</div>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '36px 40px' }}>
          
          {/* Main Grade Hero Box */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: `2px solid ${mainGradeColor}33`,
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${mainGradeColor}15`, color: mainGradeColor, padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
                <Sparkles size={13} /> 15-Point Certified Audit Result
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0a2540' }}>
                Overall Facility Hygiene &amp; Compliance Rating
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                Evaluated against Bay Area commercial health codes, ATP microbial swab benchmarks, and Cal/OSHA workplace safety standards.
              </p>
            </div>

            {/* Huge Grade Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              padding: '16px 24px',
              background: '#ffffff',
              borderRadius: '14px',
              border: `1px solid #e2e8f0`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: mainGradeColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                fontWeight: 900,
                boxShadow: `0 4px 14px ${mainGradeColor}55`
              }}>
                {audit.grade || 'B'}
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a2540' }}>
                  {audit.overallScore || 80}<span style={{ fontSize: '0.9rem', color: '#64748b' }}> / 100</span>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: mainGradeColor, textTransform: 'uppercase' }}>
                  {audit.overallScore >= 88 ? 'Good Condition' : audit.overallScore >= 70 ? 'Action Recommended' : 'Critical Deficiencies Found'}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            1. Four Core Audit Pillars
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            
            {/* Pillar 1: ATP Bio-Load */}
            <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ATP BIO-LOAD</span>
                <Activity size={16} color="#0e5fd8" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a2540' }}>
                {audit.atpReading || 0} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>RLU</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.7rem', fontWeight: 700, padding: '3px 6px', borderRadius: '4px', background: atpStatus.bg, color: atpStatus.color }}>
                {atpStatus.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                Tested: <strong>{audit.atpLocation || 'Touchpoints'}</strong>
              </div>
            </div>

            {/* Pillar 2: Restroom & Grout */}
            <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RESTROOM &amp; GROUT</span>
                <Sparkles size={16} color="#0e5fd8" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a2540' }}>
                {audit.restroomScore || 75}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}> / 100</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.7rem', fontWeight: 700, padding: '3px 6px', borderRadius: '4px', background: audit.restroomScore >= 80 ? '#dcfce7' : '#fef3c7', color: audit.restroomScore >= 80 ? '#15803d' : '#b45309' }}>
                {audit.restroomScore >= 80 ? 'Well Maintained' : 'Soil / Scale Buildup'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                Tile, grout, urinals &amp; fixtures
              </div>
            </div>

            {/* Pillar 3: Cal/OSHA Safety */}
            <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CAL/OSHA SAFETY</span>
                <ShieldCheck size={16} color="#0e5fd8" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a2540' }}>
                {audit.safetyScore || 85}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}> / 100</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.7rem', fontWeight: 700, padding: '3px 6px', borderRadius: '4px', background: audit.safetyScore >= 80 ? '#dcfce7' : '#fee2e2', color: audit.safetyScore >= 80 ? '#15803d' : '#b91c1c' }}>
                {audit.safetyScore >= 80 ? 'OSHA Compliant' : 'Safety Hazards Flagged'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                SDS, GHS labels, eyewash access
              </div>
            </div>

            {/* Pillar 4: Rate & Scope Benchmark */}
            <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RATE BENCHMARK</span>
                <Building2 size={16} color="#0e5fd8" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0a2540' }}>
                {audit.scopeScore || 85}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}> / 100</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.7rem', fontWeight: 700, padding: '3px 6px', borderRadius: '4px', background: '#eff6ff', color: '#0e5fd8' }}>
                Bay Area Commercial Rate
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                Scope &amp; cost efficiency rating
              </div>
            </div>

          </div>

          {/* AI Executive Summary */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#0e5fd8" />
              2. Executive Summary &amp; AI Analysis
            </h3>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderLeft: '4px solid #0e5fd8',
              borderRadius: '8px',
              padding: '18px 20px',
              fontSize: '0.88rem',
              lineHeight: 1.65,
              color: '#334155',
              whiteSpace: 'pre-line'
            }}>
              {audit.aiSummary}
            </div>
          </div>

          {/* Identified Deficiencies & Corrective Action Roadmap */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              3. Critical Deficiencies &amp; Remediation Plan
            </h3>

            {(!audit.deficiencies || audit.deficiencies.length === 0) ? (
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                No severe deficiencies recorded during walkthrough. Routine preventive maintenance recommended.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {audit.deficiencies.map((d, idx) => (
                  <div key={idx} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    background: d.severity === 'critical' ? '#fffafb' : '#ffffff',
                    borderLeft: `4px solid ${d.severity === 'critical' ? '#dc2626' : d.severity === 'moderate' ? '#d97706' : '#0284c7'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                        #{idx + 1} {d.category || 'Facility Hygiene'}
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: d.severity === 'critical' ? '#fee2e2' : d.severity === 'moderate' ? '#fef3c7' : '#e0f2fe',
                        color: d.severity === 'critical' ? '#b91c1c' : d.severity === 'moderate' ? '#b45309' : '#0369a1',
                        textTransform: 'uppercase'
                      }}>
                        {d.severity || 'Moderate'} Issue
                      </span>
                    </div>

                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Observed Issue:</strong> {d.note || d.issue}
                    </p>

                    <div style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <CheckCircle2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Dozeles Corrective Protocol:</strong> {d.correctiveAction || 'Deep steam extraction, hospital-grade EPA List N disinfectant, and scheduled supervisor quality tracking.'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dozeles Standard Operating Solution & Call to Action */}
          <div style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #081a2d 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '28px 32px',
            marginTop: '36px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  THE DOZELES PERFORMANCE GUARANTEE
                </div>
                <h3 style={{ margin: '6px 0 10px 0', fontSize: '1.25rem', fontWeight: 800 }}>
                  Ready to upgrade to hospital-grade, certified janitorial care?
                </h3>
                <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <li><strong>Color-Coded Microfiber:</strong> 100% elimination of cross-contamination between restrooms and desks.</li>
                  <li><strong>HEPA Filtration:</strong> 99.97% particulate capture improving indoor air quality.</li>
                  <li><strong>Monthly Quality Scorecards:</strong> Routine ATP surface verification conducted at no extra charge.</li>
                </ul>
              </div>

              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <a 
                  href="tel:6502900280" 
                  style={{
                    display: 'block',
                    background: '#0e5fd8',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    marginBottom: '8px'
                  }}
                >
                  Call 650-290-0280
                </a>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Email: dozelescleaning@gmail.com
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Document Footer */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          padding: '18px 40px',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} Dozeles Professional Cleaning. Confidential Inspection Report.
          </div>
          <div>
            Licensed, Bonded &amp; Insured • State of California Small Business
          </div>
        </div>
      </div>
    </div>
  );
}
