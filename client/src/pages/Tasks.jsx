import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import Badge from '../components/UI/Badge';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, Filter, Trash2 } from 'lucide-react';

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStatus, filterPriority]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setTasks(p => p.map(t => t._id === taskId ? { ...t, status } : t));
      toast.success('Status updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async taskId => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${taskId}`); setTasks(p => p.filter(t => t._id !== taskId)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const isOverdue = t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done';
  const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Tasks" />
        <div className="page-body animate-fade">
          <div className="page-header">
            <div><h2>All Tasks</h2><p>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p></div>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-input-wrap">
              <Search size={16} />
              <input className="form-input search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option>Pending</option><option>In Progress</option><option>Done</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            {(filterStatus || filterPriority || search) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); }}>Clear</button>
            )}
          </div>

          {loading ? <div className="loader"><div className="spinner"></div></div> : (
            tasks.length === 0 ? (
              <div className="empty-state">
                <Filter size={48} />
                <h3>No tasks found</h3>
                <p>Try adjusting your filters or create new tasks from a project.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Task</th><th>Project</th><th>Assigned To</th>
                      <th>Priority</th><th>Status</th><th>Due Date</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{t.title}</div>
                          {t.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.description.slice(0, 50)}{t.description.length > 50 ? '...' : ''}</div>}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.projectId?.color || '#7c3aed', display: 'inline-block' }}></span>
                            {t.projectId?.name || '—'}
                          </span>
                        </td>
                        <td>{t.assignedTo?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                        <td><Badge text={t.priority} /></td>
                        <td>
                          <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                            value={t.status} onChange={e => handleStatusChange(t._id, e.target.value)}>
                            <option>Pending</option><option>In Progress</option><option>Done</option>
                          </select>
                        </td>
                        <td><span className={`task-card-due ${isOverdue(t) ? 'overdue' : ''}`}>{isOverdue(t) ? '⚠️ ' : ''}{fmt(t.dueDate)}</span></td>
                        {isAdmin && (
                          <td><button className="btn-icon" onClick={() => handleDelete(t._id)}><Trash2 size={15} /></button></td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
