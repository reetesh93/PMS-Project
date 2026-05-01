import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import Modal from '../components/UI/Modal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, FolderKanban } from 'lucide-react';

const PROJECT_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const Projects = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#7c3aed', memberIds: [] });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (isAdmin) api.get('/users').then(r => setUsers(r.data.users)).catch(() => {});
  }, [isAdmin]);

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '', color: '#7c3aed', memberIds: [] });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleMember = id => setForm(p => ({
    ...p, memberIds: p.memberIds.includes(id) ? p.memberIds.filter(m => m !== id) : [...p.memberIds, id]
  }));

  const pct = p => p.taskCount > 0 ? Math.round((p.doneCount / p.taskCount) * 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Projects" />
        <div className="page-body animate-fade">
          <div className="page-header">
            <div><h2>Projects</h2><p>{projects.length} project{projects.length !== 1 ? 's' : ''} found</p></div>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> New Project</button>
            )}
          </div>

          {loading ? <div className="loader"><div className="spinner"></div></div> : (
            projects.length === 0 ? (
              <div className="empty-state">
                <FolderKanban size={48} />
                <h3>No projects yet</h3>
                <p>{isAdmin ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}</p>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map(p => (
                  <div key={p._id} className="project-card" style={{ '--card-color': p.color }} onClick={() => navigate(`/projects/${p._id}`)}>
                    <div className="project-card-name">{p.name}</div>
                    <div className="project-card-desc">{p.description || 'No description provided.'}</div>
                    <div className="project-progress">
                      <div className="progress-text"><span>{pct(p)}% complete</span><span>{p.doneCount}/{p.taskCount} tasks</span></div>
                      <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${pct(p)}%`, background: p.color }}></div></div>
                    </div>
                    <div className="project-card-footer" style={{ marginTop: 16 }}>
                      <div className="member-avatars">
                        {p.members?.slice(0, 4).map(m => (
                          <div key={m._id} className="member-avatar" title={m.name}>
                            {m.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        ))}
                        {p.members?.length > 4 && <div className="member-avatar">+{p.members.length - 4}</div>}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</button></>}>
        <div className="form-group"><label className="form-label">Project Name *</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. E-commerce Website" /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this project about?" /></div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PROJECT_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none' }} />
            ))}
          </div>
        </div>
        {users.length > 0 && (
          <div className="form-group">
            <label className="form-label">Add Team Members</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
              {users.map(u => (
                <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, background: form.memberIds.includes(u._id) ? 'var(--accent-dim)' : 'transparent' }}>
                  <input type="checkbox" checked={form.memberIds.includes(u._id)} onChange={() => toggleMember(u._id)} />
                  <span style={{ fontSize: '0.85rem' }}>{u.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{u.role}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Projects;
