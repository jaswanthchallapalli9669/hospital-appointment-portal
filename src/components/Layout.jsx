import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { doctorApi } from '../services/api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // Check backend server status
  useEffect(() => {
    const checkServer = async () => {
      try {
        await doctorApi.getAll();
        setServerOnline(true);
      } catch (err) {
        console.warn('Backend server check failed:', err);
        setServerOnline(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        serverOnline={serverOnline}
      />
      <div className="main-wrapper">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="content-area">
          {!serverOnline && (
            <div className="alert-banner warning">
              <div className="alert-content">
                <strong>Backend Notice:</strong> JSON Server (port 3000) does not appear to be responding. Make sure to run <code>npm run server</code> or <code>npm start</code>.
              </div>
            </div>
          )}
          <Outlet context={{ serverOnline }} />
        </main>
      </div>
    </div>
  );
}
