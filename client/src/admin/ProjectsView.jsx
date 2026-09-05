import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { 
  Building2, Camera, Upload, CheckCircle2, Clock, 
  MapPin, Plus, Trash2, Edit3, Image as ImageIcon, 
  User, CheckSquare, Square, X, Calendar, ArrowRight, Eye, 
  Sparkles, ShieldCheck, Check, Copy
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

  const [newProject, setNewProject] = useState({
    title: '',
    clientName: '',
    address: '',
    facilityType: 'Commercial Office',
    frequency: '5x / week (Mon-Fri)',
    startDate: new Date().toISOString().split('T')[0],
    assignedJanitors: user.role === 'janitor' ? [user.name] : ['Lead Janitor'],
    notes: ''
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/projects');
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
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

  // Helper to ensure photo URL works in all environments (Vercel proxy + VPS)
  const getPhotoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    // If it starts with /uploads, route via /api/uploads for guaranteed proxying
    if (url.startsWith('/uploads/')) return '/api' + url;
    return url;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const created = await api.post('/api/admin/projects', newProject);
      setProjects([created, ...projects]);
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
      alert('Error creating project: ' + err.message);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (re) => setPreviewDataUrl(re.target.result);
    reader.readAsDataURL(file);

    // Auto trigger upload
    uploadPhoto(file);
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
      setProjects(projects.map(p => p.id === data.project.id ? data.project : p));
      setPhotoCaption('');
      setPreviewDataUrl(null);
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleChecklistItem = async (idx) => {
    if (!activeProject) return;
    const checklist = [...(activeProject.checklist || [])];
    checklist[idx].completed = !checklist[idx].completed;
    
    try {
      const updated = await api.put(`/api/admin/projects/${activeProject.id}`, { checklist });
      setActiveProject(updated);
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
    } catch (err) {
      console.error('Error updating checklist:', err);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!activeProject) return;
    try {
      const updated = await api.put(`/api/admin/projects/${activeProject.id}`, { status });
      setActiveProject(updated);
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.del(`/api/admin/projects/${id}`);
      const remaining = projects.filter(p => p.id !== id);
      setProjects(remaining);
      setActiveProject(remaining[0] || null);
    } catch (err) {
      alert('Error deleting project: ' + err.message);
    }
  };

  const completedCount = activeProject?.checklist?.filter(c => c.completed).length || 0;
  const totalChecklist = activeProject?.checklist?.length || 0;
  const progressPercent = totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="projects-layout">
      {/* Sidebar List */}
      <div className="projects-sidebar">
        <div className="projects-sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>Field Projects</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{projects.length} Active Sites</div>
            </div>
            {user.role === 'admin' && (
              <button className="btn btn-blue" style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: 8 }} onClick={() => setShowNewModal(true)}>
                <Plus size={15} style={{ marginRight: 4 }} /> New Site
              </button>
            )}
          </div>
          <input 
            type="text" 
            placeholder="Search facility or client..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="quote-search-input"
          />
          <div className="quote-filter-pills">
            {['all', 'in-progress', 'scheduled', 'completed'].map(st => (
              <button 
                key={st} 
                className={`filter-pill ${filterStatus === st ? 'active' : ''}`}
                onClick={() => setFilterStatus(st)}
              >
                {st.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="projects-list">
          {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Loading projects...</div>}
          {!loading && filteredProjects.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
              No projects found.
            </div>
          )}
          {filteredProjects.map(p => (
            <div 
              key={p.id} 
              className={`project-list-card ${activeProject?.id === p.id ? 'active' : ''}`}
              onClick={() => setActiveProject(p)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>{p.title}</span>
                <span className={`pill ${p.status}`}>{p.status}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={13} color="var(--blue)" /> {p.clientName}
              </div>
              {p.address && (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} /> {p.address}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                <span style={{ color: 'var(--blue)', fontWeight: 600 }}>📸 {p.photos?.length || 0} photos</span>
                <span style={{ color: 'var(--muted)' }}>{p.frequency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Project Details & Photo Upload Hub */}
      <div className="projects-main">
        {activeProject ? (
          <div className="project-detail-view">
            {/* Header */}
            <div className="project-header-bar">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>{activeProject.title}</h2>
                  <span className={`pill ${activeProject.status}`}>{activeProject.status}</span>
                </div>
                <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span><strong>Client:</strong> {activeProject.clientName}</span>
                  {activeProject.address && <span><strong>Site:</strong> {activeProject.address}</span>}
                  <span><strong>Schedule:</strong> {activeProject.frequency}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select 
                  className="form-select"
                  value={activeProject.status} 
                  onChange={e => handleStatusUpdate(e.target.value)}
                  style={{ padding: '8px 14px', fontSize: '0.85rem', borderRadius: 8, border: '1px solid var(--line)', fontWeight: 600 }}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </select>

                {user.role === 'admin' && (
                  <button className="btn btn-outline" style={{ color: '#b3261e', borderColor: '#fee2e2', padding: '8px 12px', borderRadius: 8 }} onClick={() => handleDeleteProject(activeProject.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Field Photo Upload Station */}
            <div className="card photo-upload-station" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Camera size={20} /> Janitor Photo Station &amp; Job Progress
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                    Upload inspection photos, before/after proof, and daily service updates.
                  </div>
                </div>
                <span className="pill in-progress" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                  {activeProject.photos?.length || 0} Photos Uploaded
                </span>
              </div>

              {/* Upload Controls Bar */}
              <div className="photo-upload-form">
                <div className="upload-controls-grid">
                  <div>
                    <label className="form-note" style={{ fontWeight: 700, color: 'var(--ink)' }}>Category</label>
                    <select 
                      className="form-select"
                      value={photoType} 
                      onChange={e => setPhotoType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
                    >
                      <option value="progress">Cleaning Progress / Daily Update</option>
                      <option value="before">Before Cleaning (Pre-Inspection)</option>
                      <option value="after">After Cleaning (Finished Proof)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-note" style={{ fontWeight: 700, color: 'var(--ink)' }}>Caption / Area Note</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Reception floor buffed, Restroom sanitized..." 
                      value={photoCaption} 
                      onChange={e => setPhotoCaption(e.target.value)} 
                      style={{ borderRadius: 8 }}
                    />
                  </div>

                  <div>
                    <label className="btn btn-blue" style={{ width: '100%', height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', borderRadius: 8 }}>
                      <Camera size={18} />
                      <span style={{ fontWeight: 700 }}>{uploading ? 'Uploading...' : 'Take / Select Photo'}</span>
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
                </div>

                {previewDataUrl && (
                  <div style={{ marginTop: 12, padding: 10, background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={previewDataUrl} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Uploading photo...</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Optimizing and sending to server</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Gallery Grid */}
              <div className="project-photos-grid" style={{ marginTop: 24 }}>
                {(!activeProject.photos || activeProject.photos.length === 0) ? (
                  <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '2px dashed #cbd5e1', color: 'var(--muted)' }}>
                    <ImageIcon size={42} style={{ opacity: 0.3, marginBottom: 10 }} />
                    <h4 style={{ margin: '0 0 6px 0', color: 'var(--ink)' }}>No Site Photos Uploaded Yet</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Tap <strong>Take / Select Photo</strong> above to upload before/after photos directly from your phone or camera.</p>
                  </div>
                ) : (
                  activeProject.photos.map((ph) => {
                    const fullImgUrl = getPhotoUrl(ph.url);
                    return (
                      <div key={ph.id} className="project-photo-card" onClick={() => setSelectedPhoto({ ...ph, resolvedUrl: fullImgUrl })}>
                        <div className="photo-img-wrapper">
                          <img 
                            src={fullImgUrl} 
                            alt={ph.caption || 'Project photo'} 
                            loading="lazy"
                            onError={(e) => {
                              // If /uploads failed, try direct /api/uploads prefix
                              if (!e.target.dataset.tried) {
                                e.target.dataset.tried = 'true';
                                e.target.src = ph.url.startsWith('/api') ? ph.url : '/api' + ph.url;
                              }
                            }}
                          />
                          <span className={`photo-type-badge ${ph.type}`}>
                            {ph.type === 'before' ? 'BEFORE' : ph.type === 'after' ? 'AFTER' : 'PROGRESS'}
                          </span>
                          <div className="photo-zoom-overlay">
                            <Eye size={20} color="#fff" />
                          </div>
                        </div>
                        <div className="photo-card-info">
                          <div className="photo-caption">{ph.caption || 'Site progress photo'}</div>
                          <div className="photo-meta">
                            <span>{ph.author} ({ph.authorRole || 'Janitor'})</span>
                            <span>{new Date(ph.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Checklist & Site Access Grid */}
            <div className="project-bottom-grid" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              
              {/* Daily Checklist for Janitors */}
              <div className="card" style={{ borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)' }}>
                    On-Site Cleaning Tasks
                  </h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: progressPercent === 100 ? '#16a34a' : 'var(--blue)' }}>
                    {progressPercent}% Done ({completedCount}/{totalChecklist})
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? '#16a34a' : 'var(--blue)', transition: 'width 0.3s' }}></div>
                </div>

                <div className="checklist-items">
                  {activeProject.checklist?.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className={`checklist-item ${item.completed ? 'completed' : ''}`}
                      onClick={() => toggleChecklistItem(idx)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        padding: '12px 14px', 
                        borderRadius: 8, 
                        marginBottom: 8, 
                        cursor: 'pointer', 
                        background: item.completed ? '#f0fdf4' : '#f8fafc', 
                        border: `1px solid ${item.completed ? '#bbf7d0' : '#e2e8f0'}`,
                        transition: 'all 0.2s' 
                      }}
                    >
                      {item.completed ? (
                        <CheckCircle2 size={20} color="#16a34a" />
                      ) : (
                        <Square size={20} color="#94a3b8" />
                      )}
                      <span style={{ fontSize: '0.9rem', fontWeight: item.completed ? 600 : 500, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#16a34a' : 'var(--ink)' }}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Notes & Keycard Instructions */}
              <div className="card" style={{ borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)' }}>
                    Site &amp; Access Protocol
                  </h3>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => {
                      navigator.clipboard.writeText(activeProject.notes || '');
                      setCopiedNote(true);
                      setTimeout(() => setCopiedNote(false), 2000);
                    }}
                  >
                    {copiedNote ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    {copiedNote ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: 16, borderRadius: 8, color: '#92400e', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 16 }}>
                  {activeProject.notes || 'Standard commercial access. Keycard provided. Ensure alarm is armed upon departure.'}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                  <div style={{ marginBottom: 6 }}><strong>Assigned Janitors:</strong> {activeProject.assignedJanitors?.join(', ') || 'Field Crew'}</div>
                  <div style={{ marginBottom: 6 }}><strong>Facility:</strong> {activeProject.facilityType}</div>
                  <div><strong>Schedule:</strong> {activeProject.frequency}</div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <Building2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>Select a project</h3>
            <p>Choose an ongoing job from the left sidebar to view tasks and upload site photos.</p>
          </div>
        )}
      </div>

      {/* New Project Modal (Admin Only) */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="modal-close" onClick={() => setShowNewModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="modal-body">
              <div className="form-row">
                <div>
                  <label className="form-note">Project Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mission St Tech Office" 
                    value={newProject.title} 
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="form-note">Client / Company Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Corp" 
                    value={newProject.clientName} 
                    onChange={e => setNewProject({ ...newProject, clientName: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Site Address</label>
                  <input 
                    type="text" 
                    placeholder="Street, City, State ZIP" 
                    value={newProject.address} 
                    onChange={e => setNewProject({ ...newProject, address: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="form-note">Facility Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Commercial Office, Medical" 
                    value={newProject.facilityType} 
                    onChange={e => setNewProject({ ...newProject, facilityType: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-note">Frequency</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5x / week, Bi-weekly" 
                    value={newProject.frequency} 
                    onChange={e => setNewProject({ ...newProject, frequency: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="form-note">Start Date</label>
                  <input 
                    type="date" 
                    value={newProject.startDate} 
                    onChange={e => setNewProject({ ...newProject, startDate: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-note">Assigned Janitor Name(s)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Carlos Gomez, Mateo Ramirez" 
                  value={newProject.assignedJanitors.join(', ')} 
                  onChange={e => setNewProject({ ...newProject, assignedJanitors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-note">Site Access &amp; Special Instructions</label>
                <textarea 
                  placeholder="Lockbox code, alarm protocol, focus areas..." 
                  value={newProject.notes} 
                  onChange={e => setNewProject({ ...newProject, notes: e.target.value })} 
                  style={{ minHeight: 80 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-blue">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo Inspection */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)} style={{ background: 'rgba(10, 25, 47, 0.92)', backdropFilter: 'blur(6px)' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 850, padding: 0, background: '#0f172a', color: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ position: 'relative', background: '#000' }}>
              <img 
                src={selectedPhoto.resolvedUrl || getPhotoUrl(selectedPhoto.url)} 
                alt={selectedPhoto.caption} 
                style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }} 
              />
              <button 
                onClick={() => setSelectedPhoto(null)} 
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
              <div>
                <span className={`photo-type-badge ${selectedPhoto.type}`} style={{ display: 'inline-block', position: 'static', marginBottom: 8 }}>
                  {selectedPhoto.type === 'before' ? 'BEFORE CLEANING' : selectedPhoto.type === 'after' ? 'AFTER CLEANING' : 'CLEANING PROGRESS'}
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedPhoto.caption || 'Site Photo'}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                  Uploaded by <strong>{selectedPhoto.author}</strong> ({selectedPhoto.authorRole || 'Janitor'}) • {new Date(selectedPhoto.uploadedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
