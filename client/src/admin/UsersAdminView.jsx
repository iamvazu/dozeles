import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Shield, Smartphone, Clock, 
  Search, Plus, Trash2, RefreshCw, CheckCircle2, 
  Activity, Laptop, KeyRound, Mail, AlertCircle, X
} from 'lucide-react';
import { api } from '../api';

export default function UsersAdminView({ user: currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  
  const [draft, setDraft] = useState({ name: '', email: '', password: '', role: 'janitor' });
  const [editDraft, setEditDraft] = useState({ name: '', role: 'janitor', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and live heartbeat + polling
  useEffect(() => {
    loadUsers();

    // Send heartbeat so current user shows active online
    api.post('/api/admin/heartbeat', {}).catch(() => {});

    const heartbeatTimer = setInterval(() => {
      api.post('/api/admin/heartbeat', {}).catch(() => {});
    }, 60000); // every 60s

    const refreshTimer = setInterval(() => {
      api.get('/api/admin/users').then(setUsers).catch(() => {});
    }, 30000); // poll status every 30s

    return () => {
      clearInterval(heartbeatTimer);
      clearInterval(refreshTimer);
    };
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      await api.post('/api/admin/users', draft);
      setDraft({ name: '', email: '', password: '', role: 'janitor' });
      setShowAddModal(false);
      await loadUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user account');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!showEditModal) return;
    setErrorMsg('');
    setSaving(true);
    try {
      await api.put(`/api/admin/users/${showEditModal.id}`, editDraft);
      setShowEditModal(null);
      await loadUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userToDelete) => {
    if (userToDelete.id === currentUser?.id) {
      alert('You cannot delete your own logged-in account.');
      return;
    }
    if (confirm(`Are you sure you want to remove ${userToDelete.name} (${userToDelete.email}) from the team?`)) {
      try {
        await api.del(`/api/admin/users/${userToDelete.id}`);
        await loadUsers();
      } catch (err) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  // Helper for formatting date and relative time
  const formatLastLogin = (isoString) => {
    if (!isoString) return { formatted: 'Never logged in', relative: 'No activity yet', isRecent: false };
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relative = '';
    if (diffMins < 1) relative = 'Just now';
    else if (diffMins < 60) relative = `${diffMins}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays === 1) relative = 'Yesterday';
    else relative = `${diffDays}d ago`;

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return { formatted, relative, isRecent: diffHours < 24 };
  };

  // Analytics KPI counts
  const totalUsers = users.length;
  const onlineUsersCount = users.filter(u => u.isOnline).length;
  const activeTodayCount = users.filter(u => u.isActiveToday || u.isOnline).length;
  const janitorCount = users.filter(u => u.role === 'janitor').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  // Filtered list
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === 'online') matchesStatus = u.isOnline;
    else if (statusFilter === 'today') matchesStatus = u.isActiveToday && !u.isOnline;
    else if (statusFilter === 'offline') matchesStatus = !u.isOnline && !u.isActiveToday;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--navy)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="var(--blue)" />
            Team &amp; Field Staff Analytics
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Live login activity tracking, session status, and field role access for all team members.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={loadUsers} 
            className="btn btn-outline" 
            title="Refresh Live Status"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => { setErrorMsg(''); setShowAddModal(true); }} 
            className="btn btn-blue"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontWeight: 600 }}
          >
            <Plus size={16} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Card 1: Currently Online */}
        <div className="card" style={{ padding: '18px 20px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '1px solid #bbf7d0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Live Online Now</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                {onlineUsersCount}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '10px' }}>
            Active sessions in the last 15 minutes
          </div>
        </div>

        {/* Card 2: Total Team Members */}
        <div className="card" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Staff Accounts</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', marginTop: '4px' }}>
                {totalUsers}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="var(--blue)" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {adminCount} Admins • {janitorCount} Field Janitors
          </div>
        </div>

        {/* Card 3: Active in Last 24 Hours */}
        <div className="card" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Today (24h)</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                {activeTodayCount}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={22} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {Math.round((activeTodayCount / (totalUsers || 1)) * 100)}% daily team engagement
          </div>
        </div>

        {/* Card 4: Field Janitors Station Access */}
        <div className="card" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Field Janitors</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                {janitorCount}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={22} color="#0284c7" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Assigned to Field Photo Stations &amp; Check-ins
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search staff by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-light)', borderRadius: '8px', padding: '3px', border: '1px solid var(--line)' }}>
            <button 
              onClick={() => setRoleFilter('all')}
              style={{ padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', border: 'none', background: roleFilter === 'all' ? '#ffffff' : 'transparent', color: roleFilter === 'all' ? 'var(--navy)' : 'var(--text-muted)', boxShadow: roleFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
            >
              All Roles
            </button>
            <button 
              onClick={() => setRoleFilter('admin')}
              style={{ padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', border: 'none', background: roleFilter === 'admin' ? '#ffffff' : 'transparent', color: roleFilter === 'admin' ? 'var(--navy)' : 'var(--text-muted)', boxShadow: roleFilter === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
            >
              Admins ({adminCount})
            </button>
            <button 
              onClick={() => setRoleFilter('janitor')}
              style={{ padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', border: 'none', background: roleFilter === 'janitor' ? '#ffffff' : 'transparent', color: roleFilter === 'janitor' ? 'var(--navy)' : 'var(--text-muted)', boxShadow: roleFilter === 'janitor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
            >
              Janitors ({janitorCount})
            </button>
          </div>

          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.82rem', height: '38px', color: 'var(--navy)' }}
          >
            <option value="all">All Login Statuses</option>
            <option value="online">🟢 Online Now ({onlineUsersCount})</option>
            <option value="today">🟡 Active Today ({activeTodayCount})</option>
            <option value="offline">⚪ Offline</option>
          </select>
        </div>
      </div>

      {/* Main Staff Analytics Table */}
      <div className="table-card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team Member</th>
              <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role &amp; Permissions</th>
              <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Logged-In Status</th>
              <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Login Date &amp; Time</th>
              <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Logins</th>
              <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Users size={36} color="var(--line)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <strong>No staff accounts match your current filters.</strong>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const loginInfo = formatLastLogin(u.lastLogin || u.lastActiveAt);
                const isCurrent = u.id === currentUser?.id;
                const initials = (u.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--line)', transition: 'background 0.2s' }}>
                    {/* User Profile & Avatar */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: u.role === 'admin' ? '#0A192F' : '#0284c7', 
                          color: '#ffffff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 700, 
                          fontSize: '0.9rem',
                          position: 'relative'
                        }}>
                          {initials}
                          {/* Online status indicator dot */}
                          <span style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: u.isOnline ? '#22c55e' : u.isActiveToday ? '#f59e0b' : '#94a3b8',
                            border: '2px solid #ffffff'
                          }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.name}
                            {isCurrent && (
                              <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                YOU
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <Mail size={12} />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Pill */}
                    <td style={{ padding: '14px 18px' }}>
                      {u.role === 'admin' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', background: '#e0e7ff', color: '#3730a3', fontSize: '0.78rem', fontWeight: 700 }}>
                          <Shield size={13} />
                          Admin (Full Access)
                        </span>
                      ) : u.role === 'janitor' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.78rem', fontWeight: 700 }}>
                          <Smartphone size={13} />
                          Field Janitor (Photo Station)
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.78rem', fontWeight: 700 }}>
                          Staff
                        </span>
                      )}
                    </td>

                    {/* Logged in Status Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      {u.isOnline ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: '#dcfce7', color: '#15803d', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', animation: 'pulse 2s infinite' }} />
                            Online Now
                          </span>
                        </div>
                      ) : u.isActiveToday ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: '#fef3c7', color: '#b45309', fontSize: '0.78rem', fontWeight: 700 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                          Active Today
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                          Offline
                        </span>
                      )}
                    </td>

                    {/* Last Login Date & Time */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: u.lastLogin ? 'var(--navy)' : 'var(--text-muted)' }}>
                          {loginInfo.formatted}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span style={{ fontSize: '0.75rem', color: loginInfo.isRecent ? '#15803d' : 'var(--text-muted)', fontWeight: loginInfo.isRecent ? 600 : 400 }}>
                            {loginInfo.relative}
                          </span>
                          {u.device && (
                            <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                              {u.device}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total Logins & Engagement */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy)' }}>
                          {u.loginCount || 0}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {u.loginCount === 1 ? 'session' : 'sessions'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button 
                          onClick={() => {
                            setEditDraft({ name: u.name, role: u.role || 'janitor', password: '' });
                            setShowEditModal(u);
                          }}
                          className="btn btn-outline"
                          title="Edit user credentials or role"
                          style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                        >
                          Edit
                        </button>
                        {!isCurrent && (
                          <button 
                            onClick={() => handleDelete(u)}
                            className="btn btn-outline" 
                            title="Delete user account"
                            style={{ padding: '5px 9px', fontSize: '0.75rem', borderColor: '#fca5a5', color: '#b91c1c' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--blue)" />
                Add New Team Member
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Carlos Mendoza" 
                  value={draft.name} 
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Work Email Address *</label>
                <input 
                  type="email" 
                  placeholder="carlos@dozeles.com" 
                  value={draft.email} 
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Account Role &amp; Access Level *</label>
                <select 
                  value={draft.role} 
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  className="form-select"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                >
                  <option value="janitor">Field Janitor (Assigned Projects, Photo Stations, Check-in &amp; Mobile PWA)</option>
                  <option value="admin">Administrator (Full CRM, Leads, Quotes, Invoicing, Pricing &amp; Settings)</option>
                  <option value="staff">Operations Staff (Bookings, Schedule &amp; Inquiries)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Initial Temporary Password *</label>
                <input 
                  type="password" 
                  placeholder="Minimum 6 characters" 
                  value={draft.password} 
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-blue" style={{ padding: '8px 20px', fontWeight: 600 }}>
                  {saving ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="var(--blue)" />
                Edit Staff Member
              </h3>
              <button onClick={() => setShowEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Staff Name</label>
                <input 
                  type="text" 
                  value={editDraft.name} 
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Role</label>
                <select 
                  value={editDraft.role} 
                  onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })}
                  className="form-select"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                >
                  <option value="janitor">Field Janitor (Photo Station &amp; Projects)</option>
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                  Reset Password <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(leave blank to keep unchanged)</span>
                </label>
                <input 
                  type="password" 
                  placeholder="Enter new password to reset" 
                  value={editDraft.password} 
                  onChange={(e) => setEditDraft({ ...editDraft, password: e.target.value })} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-blue" style={{ padding: '8px 20px', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
