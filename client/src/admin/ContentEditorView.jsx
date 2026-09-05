import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { 
  Globe, Edit3, Save, Check, RefreshCw, Layers, 
  Phone, Mail, MapPin, Clock, Star, Share2, 
  FileText, CheckCircle2, Code, Sparkles, AlertCircle
} from 'lucide-react';

const SECTIONS = [
  { id: 'site', label: 'Site Global & Contacts', icon: Globe },
  { id: 'home', label: 'Home Page Hero', icon: Sparkles },
  { id: 'whyUs', label: 'Why Choose Dozeles', icon: CheckCircle2 },
  { id: 'services', label: 'Services Catalog', icon: Layers },
  { id: 'about', label: 'About Company', icon: FileText },
  { id: 'government', label: 'Government & Compliance', icon: Shield },
  { id: 'faqs', label: 'FAQ Knowledgebase', icon: Clock },
  { id: 'beforeAfter', label: 'Before & After Gallery', icon: Star }
];

function Shield(props) {
  return <CheckCircle2 {...props} />;
}

export default function ContentEditorView({ user }) {
  const [section, setSection] = useState('site');
  const [contentData, setContentData] = useState(null);
  const [rawJson, setRawJson] = useState('');
  const [editMode, setEditMode] = useState('visual'); // 'visual' | 'code'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      const allContent = await api.get('/api/content');
      const secData = allContent[section] || {};
      setContentData(secData);
      setRawJson(JSON.stringify(secData, null, 2));
      setMsg(null);
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [section]);

  const handleFieldChange = (key, value) => {
    setContentData(prev => {
      const updated = { ...prev, [key]: value };
      setRawJson(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleNestedFieldChange = (parentKey, childKey, value) => {
    setContentData(prev => {
      const updated = {
        ...prev,
        [parentKey]: {
          ...(prev[parentKey] || {}),
          [childKey]: value
        }
      };
      setRawJson(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      let dataToSave = contentData;
      if (editMode === 'code') {
        dataToSave = JSON.parse(rawJson);
        setContentData(dataToSave);
      }
      await api.put(`/api/admin/content/${section}`, dataToSave);
      setMsg({ ok: true, text: 'Content successfully saved and published to the live website!' });
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      setMsg({ ok: false, text: 'Failed to save: ' + (err.message || 'Invalid JSON syntax') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header & Save Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={24} color="var(--blue)" />
            Website Content Management System (CMS)
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Live content editor for the public Dozeles web portal, contact information, service descriptions, and company copy.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-light)', padding: '3px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <button
              onClick={() => setEditMode('visual')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: editMode === 'visual' ? '#ffffff' : 'transparent',
                color: editMode === 'visual' ? 'var(--navy)' : 'var(--text-muted)',
                boxShadow: editMode === 'visual' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Visual Editor
            </button>
            <button
              onClick={() => setEditMode('code')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: editMode === 'code' ? '#ffffff' : 'transparent',
                color: editMode === 'code' ? 'var(--navy)' : 'var(--text-muted)',
                boxShadow: editMode === 'code' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              JSON Code
            </button>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn btn-blue"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '8px', fontWeight: 600 }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '8px', 
          background: msg.ok ? '#dcfce7' : '#fee2e2', 
          border: `1px solid ${msg.ok ? '#bbf7d0' : '#fca5a5'}`,
          color: msg.ok ? '#15803d' : '#b91c1c', 
          fontSize: '0.86rem', 
          fontWeight: 600,
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          {msg.ok ? <Check size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const isActive = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid',
                cursor: 'pointer',
                borderColor: isActive ? 'var(--blue)' : 'var(--line)',
                background: isActive ? '#0A192F' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--navy)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} color={isActive ? '#38bdf8' : 'var(--text-muted)'} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Editor Card */}
      <div className="card" style={{ padding: '24px 28px', borderRadius: '12px', border: '1px solid var(--line)', background: '#ffffff' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
            Loading section content...
          </div>
        ) : editMode === 'code' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Raw JSON Content:</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Make sure JSON syntax is valid before publishing</span>
            </div>
            <textarea
              value={rawJson}
              onChange={e => setRawJson(e.target.value)}
              rows="18"
              spellCheck="false"
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                background: '#0f172a',
                color: '#38bdf8',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--line)'
              }}
            />
          </div>
        ) : (
          /* Visual Structured Form Editor */
          <div>
            {section === 'site' && contentData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Brand / Company Name</label>
                    <input 
                      type="text" 
                      value={contentData.name || ''} 
                      onChange={e => handleFieldChange('name', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Tagline</label>
                    <input 
                      type="text" 
                      value={contentData.tagline || ''} 
                      onChange={e => handleFieldChange('tagline', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Official Phone (Display)</label>
                    <input 
                      type="text" 
                      value={contentData.phone || ''} 
                      onChange={e => handleFieldChange('phone', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Phone (Raw Digits for Tel:)</label>
                    <input 
                      type="text" 
                      value={contentData.phoneRaw || ''} 
                      onChange={e => handleFieldChange('phoneRaw', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Official Email Address</label>
                    <input 
                      type="email" 
                      value={contentData.email || ''} 
                      onChange={e => handleFieldChange('email', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Headquarters Address</label>
                    <input 
                      type="text" 
                      value={contentData.address || ''} 
                      onChange={e => handleFieldChange('address', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Operating Working Hours</label>
                    <input 
                      type="text" 
                      value={contentData.workingHours || ''} 
                      onChange={e => handleFieldChange('workingHours', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Google Rating (e.g. 5.0)</label>
                    <input 
                      type="text" 
                      value={contentData.googleRating || ''} 
                      onChange={e => handleFieldChange('googleRating', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Google Reviews Count (e.g. 48)</label>
                    <input 
                      type="text" 
                      value={contentData.googleReviewCount || ''} 
                      onChange={e => handleFieldChange('googleReviewCount', e.target.value)} 
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Footer About Text</label>
                  <textarea 
                    rows="3" 
                    value={contentData.footerText || ''} 
                    onChange={e => handleFieldChange('footerText', e.target.value)} 
                    style={{ width: '100%', padding: '10px 12px' }}
                  />
                </div>
              </div>
            )}

            {section !== 'site' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy)' }}>
                    Editing: {SECTIONS.find(s => s.id === section)?.label}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Switch to JSON Code mode for advanced nested configuration
                  </span>
                </div>
                <textarea
                  value={rawJson}
                  onChange={e => {
                    setRawJson(e.target.value);
                    try {
                      setContentData(JSON.parse(e.target.value));
                    } catch {}
                  }}
                  rows="14"
                  spellCheck="false"
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '0.86rem',
                    lineHeight: 1.5,
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)'
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
