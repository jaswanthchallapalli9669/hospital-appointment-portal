import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarDays,
  Activity,
  Server,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, serverOnline = true }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Activity size={24} />
        </div>
        <div className="brand-title">
          <span>MedPulse</span>
          <span className="brand-subtitle">Hospital Portal</span>
        </div>
        {isOpen && (
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ marginLeft: 'auto' }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status-card">
          <div className={`status-dot ${serverOnline ? '' : 'offline'}`} />
          <div>
            <div className="status-text-title">
              {serverOnline ? 'Backend Online' : 'Backend Offline'}
            </div>
            <div className="status-text-sub">
              {serverOnline ? 'JSON Server: Port 3000' : 'Check json-server'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
