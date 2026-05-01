import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import api from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import Badge from '../components/UI/Badge';

const COLORS = ['#f59e0b', '#0ea5e9', '#10b981', '#ef4444'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard').then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content"><Navbar title="Dashboard" /><div className="loader"><div className="spinner"></div></div></div>
    </div>
  );

  const { stats, tasksByProject, recentTasks } = data || {};

  const pieData = [
    { name: 'Pending', value: stats?.pending || 0 },
    { name: 'In Progress', value: stats?.inProgress || 0 },
    { name: 'Done', value: stats?.done || 0 },
    { name: 'Overdue', value: stats?.overdue || 0 },
  ];

  const barData = (tasksByProject || []).map(t => ({ name: t.projectName || 'Unknown', tasks: t.count }));

  const statCards = [
    { label: 'Total Tasks', value: stats?.total || 0, icon: <ListTodo size={22} />, color: '#7c3aed', bg: 'var(--accent-dim)' },
    { label: 'Completed', value: stats?.done || 0, icon: <CheckCircle size={22} />, color: '#10b981', bg: 'var(--green-dim)' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: <Clock size={22} />, color: '#0ea5e9', bg: 'var(--teal-dim)' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: <AlertCircle size={22} />, color: '#ef4444', bg: 'var(--red-dim)' },
  ];

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date';
  const isOverdue = t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />
        <div className="page-body animate-fade">
          <div className="page-header">
            <div><h2>Overview</h2><p>Track your team's progress and workload</p></div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid">
            {statCards.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="stat-content">
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Task Status Breakdown</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-title">Tasks per Project</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="tasks" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="card">
            <div className="chart-title">Recent Tasks</div>
            {recentTasks?.length === 0 ? (
              <div className="empty-state"><p>No recent tasks</p></div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none' }}>
                <table className="table">
                  <thead><tr><th>Task</th><th>Project</th><th>Assigned To</th><th>Status</th><th>Due Date</th></tr></thead>
                  <tbody>
                    {recentTasks?.map(t => (
                      <tr key={t._id}>
                        <td style={{ fontWeight: 600 }}>{t.title}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.projectId?.color || '#7c3aed', display: 'inline-block' }}></span>
                            {t.projectId?.name || '—'}
                          </span>
                        </td>
                        <td>{t.assignedTo?.name || 'Unassigned'}</td>
                        <td><Badge text={t.status} /></td>
                        <td><span className={`task-card-due ${isOverdue(t) ? 'overdue' : ''}`}>{formatDate(t.dueDate)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
