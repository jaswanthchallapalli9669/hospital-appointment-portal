import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Clock, ShieldCheck, HeartPulse } from 'lucide-react';

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageDetails = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Hospital Dashboard',
          subtitle: 'Overview of clinical operations, staff, and appointments',
        };
      case '/doctors':
        return {
          title: 'Doctors Directory',
          subtitle: 'Manage medical specialists, schedules, and clinical availability',
        };
      case '/patients':
        return {
          title: 'Patient Records',
          subtitle: 'Directory of registered hospital patients and demographics',
        };
      case '/appointments':
        return {
          title: 'Appointments Management',
          subtitle: 'Schedule, track, and update patient-doctor consultations',
        };
      default:
        return {
          title: 'Hospital Portal',
          subtitle: 'Management portal',
        };
    }
  };

  const { title, subtitle } = getPageDetails();

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="page-title-group">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="portal-badge" title="Real-time date and time">
          <Clock size={14} />
          <span>{formattedDate} • {formattedTime}</span>
        </div>

        <div className="user-profile-widget">
          <div className="user-avatar" title="System Administrator">
            AD
          </div>
          <div className="user-info">
            <span className="user-name">Admin Officer</span>
            <span className="user-role">Clinical Desk</span>
          </div>
        </div>
      </div>
    </header>
  );
}
