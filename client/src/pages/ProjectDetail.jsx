import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import Modal from '../components/UI/Modal';
import Badge from '../components/UI/Badge';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, UserMinus } from 'lucide-react';

const STATUSES = ['Pending', 'In Progress', 'Done'];
const STATUS_COLORS = { 'Pending': '#f59e0b', 'In Progress': '#0ea5e9', 'Done': '#10b981' };

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [saving, setSaving] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });

  const load = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
      setTasks(res.data.tasks);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (isAdmin) api.get('/users').then(r => setUsers(r.data.users)).catch(() => {});
  }, [id]);

  const handleCreateTask = async e => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Task title is required');
    setSaving(true);
    try {
      await api.post('/tasks', { ...taskForm, projectId: id, assignedTo: taskForm.assignedTo || undefined });
      toast.success('Task created!');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async taskId => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${taskId}`); toast.success('Task deleted'); setTasks(p => p.filter(t => t._id !== taskId)); }
    catch { toast.error('Failed to delete'); }
  };

  const handleDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) return;
    try {
      await api.put(`/tasks/${draggedTask._id}`, { status });
      setTasks(p => p.map(t => t._id === draggedTask._id ? { ...t, status } : t));
      toast.success(`Moved to ${status}`);
    } catch { toast.error('Failed to update status'); }
    setDraggedTask(null); setDragOver(null);
  };

  const handleRemoveMember = async userId => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data.project);
      toast.success('Member removed');
    } catch { toast.error('Failed'); }
  };

  const handleAddMember = async userId => {
    try {
      const res = await api.post(`/projects/${id}/members`, { memberIds: [userId] });
      setProject(res.data.project);
      toast.success('Member added');
    } catch { toast.error('Failed'); }
  };

  const isOverdue = t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done';
  const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><Navbar title="Project" /><div className="loader"><div className="spinner"></div></div></div></div>;

  const memberIds = project?.members?.map(m => m._id) || [];
  const nonMembers = users.filter(u => !memberIds.includes(u._id));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={project?.name || 'Project'} />
        <div className="page-body animate-fade">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 20 }}>
            <ArrowLeft size={15} /> Back to Projects
          </button>

          {/* Project Header */}
          <div className="project-detail-header">
            <div className="project-detail-title">
              <span className="project-color-dot" style={{ background: project?.color }}></span>
              {project?.name}
            </div>
            {project?.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 8 }}>{project.description}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Created by <strong style={{ color: 'var(--text-secondary)' }}>{project?.createdBy?.name}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team:</span>
                <div className="member-avatars">
                  {project?.members?.map(m => <div key={m._id} className="member-avatar" title={m.name}>{m.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>)}
                </div>
                {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>Manage</button>}
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>Kanban Board</h3>
            {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}><Plus size={16} /> Add Task</button>}
          </div>

          <div className="kanban-board">
            {STATUSES.map(status => {
              const colTasks = tasks.filter(t => t.status === status);
              return (
                <div key={status} className={`kanban-col ${dragOver === status ? 'drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(status); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => handleDrop(status)}>
                  <div className="kanban-col-header">
                    <div className="kanban-col-title">
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status], display: 'inline-block' }}></span>
                      {status}
                    </div>
                    <span className="kanban-col-count">{colTasks.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {colTasks.map(task => (
                      <div key={task._id} className={`task-card ${draggedTask?._id === task._id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => setDraggedTask(task)}
                        onDragEnd={() => { setDraggedTask(null); setDragOver(null); }}>
                        <div className="task-card-title">{task.title}</div>
                        {task.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{task.description.slice(0, 60)}{task.description.length > 60 ? '...' : ''}</div>}
                        <div className="task-card-meta">
                          <Badge text={task.priority} />
                          {task.assignedTo && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>👤 {task.assignedTo.name}</span>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          {task.dueDate ? <span className={`task-card-due ${isOverdue(task) ? 'overdue' : ''}`}>{isOverdue(task) ? '⚠️ ' : ''}{fmt(task.dueDate)}</span> : <span />}
                          {isAdmin && <button className="btn-icon" style={{ padding: 4 }} onClick={() => handleDeleteTask(task._id)}><Trash2 size={13} /></button>}
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <div className={`kanban-drop-zone ${dragOver === status ? 'drag-over' : ''}`}>Drop tasks here</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task"
        footer={<><button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreateTask} disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button></>}>
        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title" /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} placeholder="Task details..." /></div>
        <div className="form-group"><label className="form-label">Assign To</label>
          <select className="form-select" value={taskForm.assignedTo} onChange={e => setTaskForm(p => ({ ...p, assignedTo: e.target.value }))}>
            <option value="">Unassigned</option>
            {project?.members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label className="form-label">Priority</label>
            <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
        </div>
      </Modal>

      {/* Manage Members Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Team Members">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>Current Members</p>
          {project?.members?.map(m => (
            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: 8 }}>
              <div className="member-avatar">{m.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <span style={{ flex: 1, fontSize: '0.85rem' }}>{m.name}</span>
              <Badge text={m.role} />
              {m._id !== project.createdBy?._id && <button className="btn-icon" onClick={() => handleRemoveMember(m._id)}><UserMinus size={14} /></button>}
            </div>
          ))}
          {nonMembers.length > 0 && <>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12, marginBottom: 8 }}>Add Members</p>
            {nonMembers.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <span style={{ flex: 1, fontSize: '0.85rem' }}>{u.name}</span>
                <button className="btn btn-primary btn-sm" onClick={() => handleAddMember(u._id)}><Plus size={14} /> Add</button>
              </div>
            ))}
          </>}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
