import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Team = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });

  const load = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch { 
      toast.error('Failed to load users'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('Team member created successfully!');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'member' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    if (id === currentUser?.id) {
      return toast.error("You cannot delete your own account");
    }
    if (!window.confirm('Are you sure you want to delete this member? They will be removed from all projects and unassigned from all tasks.')) return;
    
    try {
      await api.delete(`/users/${id}`);
      toast.success('Member deleted');
      setUsers(p => p.filter(u => u._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Team" />
        <div className="page-body animate-fade">
          <div className="page-header">
            <div><h2>Team Members</h2><p>{users.length} user{users.length !== 1 ? 's' : ''} in your workspace</p></div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Add Member
            </button>
          </div>
          
          {loading ? <div className="loader"><div className="spinner"></div></div> : (
            users.length === 0 ? (
              <div className="empty-state"><Users size={48} /><h3>No users found</h3></div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="user-avatar" style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                              {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                        <td><Badge text={u.role} /></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          {u._id !== currentUser?.id && (
                            <button className="btn-icon" onClick={() => handleDelete(u._id)} title="Delete Member">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Team Member"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Member'}
          </button>
        </>}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Jane Doe" />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Temporary Password *</label>
          <input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default Team;
