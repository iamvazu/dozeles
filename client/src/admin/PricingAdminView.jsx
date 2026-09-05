import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { 
  DollarSign, Calculator, Home, Building2, Check, 
  RefreshCw, Sparkles, Shield, AlertCircle, Save,
  Layers, Percent, ArrowRight
} from 'lucide-react';

export default function PricingAdminView({ user }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // Sample calculator state to preview pricing formula in real time
  const [testBeds, setTestBeds] = useState(3);
  const [testBaths, setTestBaths] = useState(2);
  const [testSqFt, setTestSqFt] = useState(3500);
  const [testFacility, setTestFacility] = useState('office');

  const loadPricing = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/pricing');
      setConfig(data || {
        RES: { BASE: 109, PER_BED: 28, PER_BATH: 32, MIN: 149 },
        COM_FACILITIES: [
          { id: 'office', label: 'Commercial Office', rate: 0.22 },
          { id: 'retail', label: 'Retail / Showroom', rate: 0.20 },
          { id: 'medical', label: 'Medical / Dental Clinic', rate: 0.29 },
          { id: 'warehouse', label: 'Warehouse / Industrial', rate: 0.14 },
          { id: 'government', label: 'School / Government Facility', rate: 0.24 },
          { id: 'restaurant', label: 'Restaurant / Food Service', rate: 0.31 }
        ],
        COM_MIN_MONTHLY: 380
      });
    } catch (err) {
      console.error('Failed to load pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const handleResChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      RES: { ...prev.RES, [key]: Number(value) || 0 }
    }));
  };

  const handleFacilityRateChange = (idx, value) => {
    setConfig(prev => {
      const facilities = [...(prev.COM_FACILITIES || [])];
      facilities[idx] = { ...facilities[idx], rate: parseFloat(value) || 0 };
      return { ...prev, COM_FACILITIES: facilities };
    });
  };

  const handleComMinChange = (value) => {
    setConfig(prev => ({ ...prev, COM_MIN_MONTHLY: Number(value) || 0 }));
  };

  const savePricing = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      await api.post('/api/pricing', config);
      setSavedMsg('Pricing rules successfully saved & published to booking calculators!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      alert('Error saving pricing: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Real-time calculated previews
  const previewResPrice = Math.max(
    (config?.RES?.MIN || 149),
    (config?.RES?.BASE || 109) + (testBeds * (config?.RES?.PER_BED || 28)) + (testBaths * (config?.RES?.PER_BATH || 32))
  );

  const selectedFacObj = (config?.COM_FACILITIES || []).find(f => f.id === testFacility);
  const facRate = selectedFacObj ? selectedFacObj.rate : 0.22;
  const previewComPrice = Math.max(
    (config?.COM_MIN_MONTHLY || 380),
    Math.round(testSqFt * facRate)
  );

  if (loading) {
    return (
      <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
        Loading pricing engine configuration...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header & Save Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calculator size={24} color="var(--blue)" />
            Automated Pricing Engine &amp; Rates
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Configure live residential and commercial calculation formulas used across website booking widgets and quote generators.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {savedMsg && (
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> {savedMsg}
            </span>
          )}
          <button 
            onClick={savePricing} 
            disabled={saving}
            className="btn btn-blue"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '8px', fontWeight: 600 }}
          >
            <Save size={16} />
            <span>{saving ? 'Publishing...' : 'Save & Publish Rates'}</span>
          </button>
        </div>
      </div>

      {/* Sleek Compact Pricing KPI Grid */}
      <div className="modern-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="modern-kpi-card blue">
          <div className="kpi-icon-badge blue"><Home size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">RESIDENTIAL BASE</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">${config?.RES?.BASE || 109}</span>
              <span className="kpi-label">Min ${config?.RES?.MIN || 149}</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card emerald">
          <div className="kpi-icon-badge emerald"><DollarSign size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">COMMERCIAL MONTHLY MIN</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">${config?.COM_MIN_MONTHLY || 380}</span>
              <span className="kpi-label">Base Retainer</span>
            </div>
          </div>
        </div>

        <div className="modern-kpi-card purple">
          <div className="kpi-icon-badge purple"><Building2 size={20} /></div>
          <div className="kpi-info-col">
            <span className="kpi-tag">FACILITY CATEGORIES</span>
            <div className="kpi-val-row">
              <span className="kpi-main-val">{config?.COM_FACILITIES?.length || 6}</span>
              <span className="kpi-label">Configured Types</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Form Fields vs Live Preview Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Residential Pricing Rules */}
          <div className="card" style={{ padding: '22px 24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Home size={19} color="var(--blue)" />
              Residential House Cleaning Formulas
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                  Base Fixed Price ($)
                </label>
                <input 
                  type="number" 
                  value={config?.RES?.BASE || 0} 
                  onChange={e => handleResChange('BASE', e.target.value)} 
                  style={{ width: '100%', height: '38px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                  Minimum Booking Total ($)
                </label>
                <input 
                  type="number" 
                  value={config?.RES?.MIN || 0} 
                  onChange={e => handleResChange('MIN', e.target.value)} 
                  style={{ width: '100%', height: '38px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                  Per Bedroom Rate ($)
                </label>
                <input 
                  type="number" 
                  value={config?.RES?.PER_BED || 0} 
                  onChange={e => handleResChange('PER_BED', e.target.value)} 
                  style={{ width: '100%', height: '38px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                  Per Bathroom Rate ($)
                </label>
                <input 
                  type="number" 
                  value={config?.RES?.PER_BATH || 0} 
                  onChange={e => handleResChange('PER_BATH', e.target.value)} 
                  style={{ width: '100%', height: '38px' }}
                />
              </div>
            </div>
          </div>

          {/* Commercial Pricing Rules */}
          <div className="card" style={{ padding: '22px 24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={19} color="var(--blue)" />
                Commercial Facility Rates ($ / Sq. Ft.)
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Minimum Monthly:</span>
                <input 
                  type="number" 
                  value={config?.COM_MIN_MONTHLY || 380} 
                  onChange={e => handleComMinChange(e.target.value)} 
                  style={{ width: '90px', height: '32px', textAlign: 'center', fontWeight: 700 }}
                />
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Facility Category</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Rate / Sq. Ft. ($)</th>
                </tr>
              </thead>
              <tbody>
                {(config?.COM_FACILITIES || []).map((fac, idx) => (
                  <tr key={fac.id || idx} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 14px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--navy)' }}>
                      {fac.label}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>$</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={fac.rate} 
                          onChange={e => handleFacilityRateChange(idx, e.target.value)} 
                          style={{ width: '80px', height: '34px', textAlign: 'right', fontWeight: 700 }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/sq.ft</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column: Real-Time Live Simulator Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
          
          {/* Residential Preview Widget */}
          <div className="card" style={{ padding: '22px 24px', borderRadius: '12px', border: '1px solid var(--line)', background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={17} color="var(--blue)" />
              Live Residential Formula Preview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--navy)', fontWeight: 600 }}>Bedrooms: {testBeds}</span>
                <input 
                  type="range" min="1" max="8" value={testBeds} 
                  onChange={e => setTestBeds(Number(e.target.value))} 
                  style={{ width: '130px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--navy)', fontWeight: 600 }}>Bathrooms: {testBaths}</span>
                <input 
                  type="range" min="1" max="6" value={testBaths} 
                  onChange={e => setTestBaths(Number(e.target.value))} 
                  style={{ width: '130px' }}
                />
              </div>

              <div style={{ marginTop: '12px', padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Calculated Total</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--blue)' }}>
                    ${previewResPrice}
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Live Quote
                </span>
              </div>
            </div>
          </div>

          {/* Commercial Preview Widget */}
          <div className="card" style={{ padding: '22px 24px', borderRadius: '12px', border: '1px solid var(--line)', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={17} color="#16a34a" />
              Live Commercial Formula Preview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Facility Category</label>
                <select 
                  value={testFacility} 
                  onChange={e => setTestFacility(e.target.value)}
                  className="form-select"
                  style={{ width: '100%', height: '34px', fontSize: '0.84rem' }}
                >
                  {(config?.COM_FACILITIES || []).map(f => (
                    <option key={f.id} value={f.id}>{f.label} (${f.rate}/sq.ft)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--navy)', fontWeight: 600 }}>Area: {testSqFt.toLocaleString()} sq.ft</span>
                <input 
                  type="range" min="500" max="25000" step="500" value={testSqFt} 
                  onChange={e => setTestSqFt(Number(e.target.value))} 
                  style={{ width: '130px' }}
                />
              </div>

              <div style={{ marginTop: '12px', padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Monthly Retainer</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>
                    ${previewComPrice.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>/mo</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Estimated Contract
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
