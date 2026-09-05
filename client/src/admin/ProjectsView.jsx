import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { 
  Building2, Camera, Upload, CheckCircle2, Clock, 
  MapPin, Plus, Trash2, Edit3, Image as ImageIcon, 
  User, CheckSquare, Square, X, Calendar, ArrowRight, Eye
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
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
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
      setPhotoType('progress');
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
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Active Projects</h3>
            {user.role === 'admin' && (
              <button className="btn btn-blue" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setShowNewModal(true)}>
                <Plus size={15} style={{ marginRight: 4 }} /> New Project
              </button>
            )}
          </div>
          <input 
            type="text" 
            placeholder="Search projects..." 
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>{p.title}</span>
                <span className={`pill ${p.status}`}>{p.status}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={13} /> {p.clientName}
              </div>
              {p.address && (
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> {p.address}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '0.75rem', color: 'var(--muted)' }}>
                <span>{p.photos?.length || 0} photos uploaded</span>
                <span>{p.frequency}</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-body)' }}>{activeProject.title}</h2>
                  <span className={`pill ${activeProject.status}`}>{activeProject.status}</span>
                </div>
                <div style={{ color: 'var(--muted)', marginTop: 4, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span><strong>Client:</strong> {activeProject.clientName}</span>
                  {activeProject.address && <span><strong>Site:</strong> {activeProject.address}</span>}
                  <span><strong>Schedule:</strong> {activeProject.frequency}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select 
                  className="form-select"
                  value={activeProject.status} 
                  onChange={e => handleStatusUpdate(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: 6, border: '1px solid var(--line)' }}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </select>

                {user.role === 'admin' && (
                  <button className="btn btn-outline" style={{ color: '#b3261e', borderColor: '#b3261e', padding: '6px 10px' }} onClick={() => handleDeleteProject(activeProject.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Field Photo Upload Station (Crucial for Janitors on Mobile) */}
            <div className="card photo-upload-station" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Camera size={20} /> Janitor Photo Station &amp; Job Progress
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Upload before/after proof &amp; daily updates
                </span>
              </div>

              <div className="photo-upload-form">
                <div className="upload-controls-grid">
                  <div>
                    <label className="form-note">Photo Tag / Category</label>
                    <select 
                      className="form-select"
                      value={photoType} 
                      onChange={e => setPhotoType(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)' }}
                    >
                      <option value="progress">Progress / Cleaning Update</option>
                      <option value="before">Before Cleaning (Inspection)</option>
                      <option value="after">After Cleaning (Finished Proof)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-note">Photo Caption / Note</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Lobby floors buffed, Breakroom disinfected..." 
                      value={photoCaption} 
                      onChange={e => setPhotoCaption(e.target.value)} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    {/* Direct Mobile Camera Capture */}
                    <label className="btn btn-blue" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', padding: '10px 16px' }}>
                      <Camera size={18} />
                      <span>{uploading ? 'Uploading...' : 'Take / Upload Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        style={{ display: 'none' }} 
                        onChange={handlePhotoUpload} 
                        disabled={uploading} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Photo Gallery Grid */}
              <div className="project-photos-grid" style={{ marginTop: 20 }}>
                {(!activeProject.photos || activeProject.photos.length === 0) ? (
                  <div style={{ gridColumn: '1 / -1', padding: 30, textAlign: 'center', background: '#f8fafc', borderRadius: 8, color: 'var(--muted)' }}>
                    <ImageIcon size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No job photos uploaded yet. Tap <strong>Take / Upload Photo</strong> above to add field photos.</p>
                  </div>
                ) : (
                  activeProject.photos.map((ph) => (
                    <div key={ph.id} className="project-photo-card" onClick={() => setSelectedPhoto(ph)}>
                      <div className="photo-img-wrapper">
                        <img src={ph.url} alt={ph.caption || 'Project photo'} loading="lazy" />
                        <span className={`photo-type-badge ${ph.type}`}>
                          {ph.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="photo-card-info">
                        <div className="photo-caption">{ph.caption || 'Site progress photo'}</div>
                        <div className="photo-meta">
                          <span>{ph.author} ({ph.authorRole || 'Janitor'})</span>
                          <span>{new Date(ph.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checklist & Site Details Grid */}
            <div className="project-bottom-grid" style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              
              {/* Daily Checklist for Janitors */}
              <div className="card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: 'var(--ink)' }}>
                  On-Site Cleaning Checklist
                </h3>
                <div className="checklist-items">
                  {activeProject.checklist?.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className={`checklist-item ${item.completed ? 'completed' : ''}`}
                      onClick={() => toggleChecklistItem(idx)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, marginBottom: 8, cursor: 'pointer', background: item.completed ? '#e8f7f0' : '#f8fafc', transition: 'all 0.2s' }}
                    >
                      {item.completed ? (
                        <CheckCircle2 size={18} color="#138a4d" />
                      ) : (
                        <Square size={18} color="var(--muted)" />
                      )}
                      <span style={{ fontSize: '0.9rem', textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#138a4d' : 'var(--ink)' }}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Notes & Team Info */}
              <div className="card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: 'var(--ink)' }}>
                  Site &amp; Access Notes
                </h3>
                <div style={{ background: '#fff4dd', padding: 14, borderRadius: 6, color: '#a06a00', fontSize: '0.9rem', marginBottom: 16 }}>
                  {activeProject.notes || 'Standard commercial protocol. Ensure alarms are reset upon exit.'}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  <div style={{ marginBottom: 6 }}><strong>Assigned Janitors:</strong> {activeProject.assignedJanitors?.join(', ') || 'Field Crew'}</div>
                  <div style={{ marginBottom: 6 }}><strong>Facility:</strong> {activeProject.facilityType}</div>
                  <div><strong>Start Date:</strong> {activeProject.startDate}</div>
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
                  placeholder="e.g. Carlos Gomez, Elena Rodriguez" 
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
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)} style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, padding: 0, background: '#000', color: '#fff' }}>
            <div style={{ position: 'relative' }}>
              <img src={selectedPhoto.url} alt={selectedPhoto.caption} style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }} />
              <button 
                onClick={() => setSelectedPhoto(null)} 
                style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={`photo-type-badge ${selectedPhoto.type}`} style={{ display: 'inline-block', marginBottom: 6 }}>
                  {selectedPhoto.type.toUpperCase()}
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedPhoto.caption || 'Site Photo'}</div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 4 }}>
                  Uploaded by {selectedPhoto.author} • {new Date(selectedPhoto.uploadedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
