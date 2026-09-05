import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { 
  Building2, Camera, Upload, CheckCircle2, Clock, 
  MapPin, Plus, Trash2, Edit3, Image as ImageIcon, 
  User, CheckSquare, Square, X, Calendar, ArrowRight, Eye, 
  Sparkles, ShieldCheck, Check, Copy, Navigation, Layers,
  Search, AlertCircle
} from 'lucide-react';

export default function ProjectsView({ user }) {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoType, setPhotoType] = useState('progress');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedNote, setCopiedNote] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const [newProject, setNewProject] = useState({
    title: '',
    clientName: '',
    address: '',
    facilityType: 'Commercial Office',
    frequency: '5x / week (Mon-Fri)',
    startDate: new Date().toISOString().split('T')[0],
    assignedJanitors: user?.role === 'janitor' ? [user?.name || 'Field Staff'] : ['Lead Janitor'],
    notes: ''
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/projects');
      const list = Array.isArray(data) ? data : [];
      setProjects(list);
      if (list.length > 0) {
        if (!activeProject) {
          setActiveProject(list[0]);
        } else {
          const refreshed = list.find(p => p.id === activeProject.id);
          setActiveProject(refreshed || list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const getPhotoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return '/api' + url;
    return url;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const created = await api.post('/api/admin/projects', newProject);
      setProjects([created, ...(projects || [])]);
      setActiveProject(created);
      setShowNewModal(false);
      setNewProject({
        title: '',
        clientName: '',
        address: '',
        facilityType: 'Commercial Office',
        frequency: '5x / week (Mon-Fri)',
        startDate: new Date().toISOString().split('T')[0],
        assignedJanitors: ['Lead Janitor'],
        notes: ''
      });
    } catch (err) {
      alert('Error creating project: ' + (err.message || err));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (re) => setPreviewDataUrl(re.target.result);
    reader.readAsDataURL(file);

    uploadPhoto(file);
  };

  const handleGPSCheckin = () => {
    if (!activeProject) return;
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your device.');
      return;
    }
    setCheckingIn(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.post(`/api/admin/projects/${activeProject.id}/checkin`, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          });
          setActiveProject(res.project);
          setProjects((projects || []).map(p => p.id === res.project.id ? res.project : p));
          alert(`✅ Verified check-in recorded at ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}!`);
        } catch (err) {
          alert('Check-in failed: ' + (err.message || err));
        } finally {
          setCheckingIn(false);
        }
      },
      (err) => {
        setCheckingIn(false);
        alert('Could not retrieve GPS location: ' + err.message + '\nPlease enable location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const uploadPhoto = async (file) => {
    if (!file || !activeProject) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('caption', photoCaption);
    fd.append('type', photoType);

    try {
      const res = await fetch(`/api/admin/projects/${activeProject.id}/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('dz_token')}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');
      
      setActiveProject(data.project);
      setProjects((projects || []).map(p => p.id === data.project.id ? data.project : p));
      setPhotoCaption('');
      setPreviewDataUrl(null);
    } catch (err) {
      alert('Upload failed: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const toggleChecklistItem = async (idx) => {
    if (!activeProject || !activeProject.checklist) return;
    const updatedChecklist = [...activeProject.checklist];
    updatedChecklist[idx].completed = !updatedChecklist[idx].completed;

    try {
      const res = await api.put(`/api/admin/projects/${activeProject.id}`, { checklist: updatedChecklist });
      setActiveProject(res);
      setProjects((projects || []).map(p => p.id === res.id ? res : p));
    } catch (err) {
      alert('Error updating checklist: ' + (err.message || err));
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!activeProject) return;
    try {
      const res = await api.put(`/api/admin/projects/${activeProject.id}`, { status: newStatus });
      setActiveProject(res);
      setProjects((projects || []).map(p => p.id === res.id ? res : p));
    } catch (err) {
      alert('Error updating status: ' + (err.message || err));
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this field project and all photo records?')) return;
    try {
      await api.del(`/api/admin/projects/${id}`);
      const remaining = (projects || []).filter(p => p.id !== id);
      setProjects(remaining);
      setActiveProject(remaining[0] || null);
    } catch (err) {
      alert('Error deleting project: ' + (err.message || err));
    }
  };

  const filteredProjects = (projects || []).filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = 
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.clientName && p.clientName.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q));
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalChecklist = activeProject?.checklist?.length || 0;
  const completedCount = (activeProject?.checklist || []).filter(c => c.completed).length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={24} color="var(--blue)" />
            Field Projects &amp; Photo Stations
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Live inspection photos, before &amp; after proof, on-site janitorial task checklists, and GPS check-ins.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowNewModal(true)} 
            className="btn btn-blue"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
          >
            <Plus size={16} />
            <span>New Field Site</span>
          </button>
        )}
      </div>

      {/* Main 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Sidebar: Projects Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search projects or clients..."
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ width: '100%', paddingLeft: '32px', height: '36px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.84rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-light)', padding: '3px', borderRadius: '6px' }}>
              {['all', 'in-progress', 'scheduled', 'completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: filterStatus === st ? '#ffffff' : 'transparent',
                    color: filterStatus === st ? 'var(--navy)' : 'var(--text-muted)',
                    boxShadow: filterStatus === st ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {st === 'in-progress' ? 'Active' : st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '720px', overflowY: 'auto' }}>
            {loading ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Loading sites...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No projects found.
              </div>
            ) : (
              filteredProjects.map(p => {
                const isSelected = activeProject?.id === p.id;
                const photoCount = p.photos?.length || 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProject(p)}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.92rem' }}>{p.title}</span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '12px',
                        background: p.status === 'completed' ? '#dcfce7' : p.status === 'scheduled' ? '#ede9fe' : '#e0f2fe',
                        color: p.status === 'completed' ? '#15803d' : p.status === 'scheduled' ? '#6d28d9' : '#0369a1'
                      }}>
                        {p.status?.replace('-', ' ')?.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                      <Building2 size={12} /> {p.clientName}
                    </div>

                    {p.address && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                        <MapPin size={12} /> {p.address}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.04)', fontSize: '0.74rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--blue)', fontWeight: 600 }}>
                        <Camera size={12} /> {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {p.frequency}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Panel: Photo Station, Checklists & GPS Check-Ins */}
        <div>
          {activeProject ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Modern Project Action Header Bar */}
              <div className="card" style={{ padding: '18px 22px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)' }}>
                      {activeProject.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} /> {activeProject.clientName}
                      </span>
                      {activeProject.address && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> {activeProject.address}
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {activeProject.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Refined Action Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={handleGPSCheckin} 
                      disabled={checkingIn} 
                      className="btn btn-blue"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600 }}
                    >
                      <Navigation size={14} />
                      <span>{checkingIn ? 'Acquiring GPS...' : 'Log GPS Check-In'}</span>
                    </button>

                    <select 
                      className="form-select"
                      value={activeProject.status} 
                      onChange={e => handleStatusUpdate(e.target.value)}
                      style={{ padding: '7px 12px', fontSize: '0.84rem', borderRadius: '8px', border: '1px solid var(--line)', fontWeight: 600, color: 'var(--navy)', height: '36px' }}
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                    </select>

                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handleDeleteProject(activeProject.id)} 
                        className="btn btn-outline" 
                        title="Delete Field Site"
                        style={{ padding: '8px 10px', borderColor: '#fca5a5', color: '#b91c1c', borderRadius: '8px', height: '36px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modern Janitor Photo Station Card */}
              <div className="card" style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Camera size={19} color="var(--blue)" />
                      Janitor Photo Station &amp; Job Progress
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Upload verified field inspection photos, before/after proof, and daily service updates.
                    </p>
                  </div>

                  <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px' }}>
                    {activeProject.photos?.length || 0} Photos Uploaded
                  </span>
                </div>

                {/* Sleek Photo Upload Bar */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    
                    {/* Category Selector Pills */}
                    <div style={{ display: 'flex', background: '#ffffff', padding: '3px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      {[
                        { id: 'progress', label: 'Daily Progress' },
                        { id: 'before', label: 'Before Cleaning' },
                        { id: 'after', label: 'After Cleaning' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setPhotoType(cat.id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: photoType === cat.id ? 'var(--blue)' : 'transparent',
                            color: photoType === cat.id ? '#ffffff' : 'var(--text-muted)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Area Note Input */}
                    <input 
                      type="text" 
                      placeholder="Area note (e.g. Reception floor polished, Restroom sanitized)..." 
                      value={photoCaption} 
                      onChange={e => setPhotoCaption(e.target.value)} 
                      style={{ flex: '1 1 240px', height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.84rem' }}
                    />

                    {/* Compact Upload CTA */}
                    <label 
                      className="btn btn-blue" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '8px 18px', 
                        height: '36px', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontWeight: 600, 
                        fontSize: '0.84rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Camera size={15} />
                      <span>{uploading ? 'Uploading...' : 'Take / Select Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        style={{ display: 'none' }} 
                        onChange={handleFileSelect} 
                        disabled={uploading} 
                      />
                    </label>
                  </div>

                  {previewDataUrl && (
                    <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={previewDataUrl} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--navy)' }}>Uploading &amp; Optimizing Image...</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Attaching timestamp and staff signature</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Gallery Grid */}
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                  {(!activeProject.photos || activeProject.photos.length === 0) ? (
                    <div style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1.5px dashed var(--line)' }}>
                      <ImageIcon size={38} color="var(--line)" style={{ margin: '0 auto 10px', display: 'block' }} />
                      <h4 style={{ margin: '0 0 6px 0', color: 'var(--navy)', fontSize: '0.96rem' }}>No Site Photos Uploaded Yet</h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Tap <strong>Take / Select Photo</strong> above to upload before/after photos directly from your phone or camera.
                      </p>
                    </div>
                  ) : (
                    activeProject.photos.map(ph => {
                      const fullImgUrl = getPhotoUrl(ph.url);
                      return (
                        <div 
                          key={ph.id} 
                          onClick={() => setSelectedPhoto({ ...ph, resolvedUrl: fullImgUrl })}
                          style={{
                            border: '1px solid var(--line)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: '#ffffff',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                          }}
                        >
                          <div style={{ position: 'relative', width: '100%', height: '140px', background: '#0f172a' }}>
                            <img 
                              src={fullImgUrl} 
                              alt={ph.caption || 'Project photo'} 
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                if (!e.target.dataset.tried) {
                                  e.target.dataset.tried = 'true';
                                  e.target.src = ph.url.startsWith('/api') ? ph.url : '/api' + ph.url;
                                }
                              }}
                            />
                            <span style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              color: '#ffffff',
                              background: ph.type === 'before' ? '#ea580c' : ph.type === 'after' ? '#16a34a' : '#0284c7',
                              textTransform: 'uppercase'
                            }}>
                              {ph.type}
                            </span>
                          </div>

                          <div style={{ padding: '10px 12px' }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ph.caption || 'Site Inspection Photo'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              <span>{ph.author || 'Staff'}</span>
                              <span>{new Date(ph.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2-Column Split: Checklist & GPS Check-Ins */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                
                {/* Janitor Checklist */}
                <div className="card" style={{ padding: '20px 22px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)' }}>
                      On-Site Service Checklist
                    </h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: progressPercent === 100 ? '#16a34a' : 'var(--blue)' }}>
                      {progressPercent}% Complete ({completedCount}/{totalChecklist})
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? '#16a34a' : 'var(--blue)', transition: 'width 0.3s ease' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(activeProject.checklist || []).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => toggleChecklistItem(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: item.completed ? '#f0fdf4' : '#f8fafc',
                          border: `1px solid ${item.completed ? '#bbf7d0' : 'var(--line)'}`,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {item.completed ? (
                          <CheckCircle2 size={18} color="#16a34a" />
                        ) : (
                          <Square size={18} color="#94a3b8" />
                        )}
                        <span style={{ fontSize: '0.85rem', fontWeight: item.completed ? 600 : 500, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#16a34a' : 'var(--navy)' }}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GPS Check-in Logs & Access Protocol */}
                <div className="card" style={{ padding: '20px 22px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)' }}>
                      📍 Site Access &amp; Verified Check-Ins
                    </h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeProject.notes || '');
                        setCopiedNote(true);
                        setTimeout(() => setCopiedNote(false), 2000);
                      }}
                      className="btn btn-outline"
                      style={{ padding: '4px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedNote ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      <span>{copiedNote ? 'Copied' : 'Copy Access'}</span>
                    </button>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px 14px', borderRadius: '8px', color: '#92400e', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '14px' }}>
                    <strong>Access Protocol:</strong> {activeProject.notes || 'Standard commercial keycard access. Ensure alarm is armed and all perimeter doors locked upon exit.'}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Recent Staff Check-Ins:
                    </div>

                    {(!activeProject.checkins || activeProject.checkins.length === 0) ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px' }}>
                        No check-ins logged yet today. Tap <strong>Log GPS Check-In</strong> above when arriving on site.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                        {activeProject.checkins.map(chk => (
                          <div 
                            key={chk.id} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              background: '#f0fdf4', 
                              border: '1px solid #bbf7d0', 
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              fontSize: '0.78rem' 
                            }}
                          >
                            <div>
                              <strong style={{ color: '#15803d' }}>📍 {chk.staffName}</strong> ({chk.staffRole || 'Staff'})
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(chk.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            <a 
                              href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none' }}
                            >
                              View Map ↗
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Building2 size={44} color="var(--line)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <strong>Select a project on the left to view tasks and photo records.</strong>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--blue)" />
                Create New Field Cleaning Project
              </h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Project Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mission St Tech Office Janitorial" 
                  value={newProject.title} 
                  onChange={e => setNewProject({ ...newProject, title: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Client / Company Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Skyline Financial" 
                    value={newProject.clientName} 
                    onChange={e => setNewProject({ ...newProject, clientName: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Facility Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Commercial Office" 
                    value={newProject.facilityType} 
                    onChange={e => setNewProject({ ...newProject, facilityType: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Facility Street Address</label>
                <input 
                  type="text" 
                  placeholder="100 Pine St, San Francisco, CA" 
                  value={newProject.address} 
                  onChange={e => setNewProject({ ...newProject, address: e.target.value })} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Cleaning Frequency</label>
                  <select 
                    value={newProject.frequency} 
                    onChange={e => setNewProject({ ...newProject, frequency: e.target.value })}
                    className="form-select"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  >
                    <option value="5x / week (Mon-Fri)">5x / week (Mon-Fri Evening)</option>
                    <option value="7x / week (Daily Nightly)">7x / week (Daily Nightly)</option>
                    <option value="3x / week (MWF)">3x / week (Mon / Wed / Fri)</option>
                    <option value="Weekly Deep Clean">Weekly Deep Clean</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Start Date</label>
                  <input 
                    type="date" 
                    value={newProject.startDate} 
                    onChange={e => setNewProject({ ...newProject, startDate: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Access Protocol &amp; Instructions</label>
                <textarea 
                  rows="2" 
                  placeholder="Keycard location, alarm disarm code, special chemical instructions..." 
                  value={newProject.notes} 
                  onChange={e => setNewProject({ ...newProject, notes: e.target.value })} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue" style={{ padding: '8px 20px', fontWeight: 600 }}>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.94)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }} onClick={() => setSelectedPhoto(null)}>
          <div style={{ maxWidth: '850px', width: '100%', background: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', background: '#000', textAlign: 'center' }}>
              <img 
                src={selectedPhoto.resolvedUrl || getPhotoUrl(selectedPhoto.url)} 
                alt={selectedPhoto.caption} 
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }} 
              />
              <button 
                onClick={() => setSelectedPhoto(null)} 
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
              <div>
                <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: selectedPhoto.type === 'before' ? '#ea580c' : selectedPhoto.type === 'after' ? '#16a34a' : '#0284c7', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {selectedPhoto.type}
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedPhoto.caption || 'Site Photo'}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px' }}>
                  Uploaded by <strong>{selectedPhoto.author}</strong> • {new Date(selectedPhoto.uploadedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
