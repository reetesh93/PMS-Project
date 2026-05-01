import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="navbar">
      <div>
        <div className="navbar-title">{title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </div>
      </div>
      <div className="navbar-right">
        <button className="btn-icon"><Bell size={18} /></button>
        <div className="user-avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
