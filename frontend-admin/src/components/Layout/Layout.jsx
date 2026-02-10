import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/drivers', label: 'Drivers', icon: '🚕' },
    { path: '/vehicles', label: 'Vehicles', icon: '🚗' },
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/maintenance', label: 'Maintenance', icon: '🛠️' },
    // { path: '/feedback', label: 'Feedback', icon: '💬' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🚕</div>
          <div className="brand-text">
            <div className="brand-name">TaxiTracker</div>
            <div className="brand-tag">Admin Panel</div>
          </div>
        </div>

        <div className="nav-section">MENU</div>

        <nav className="nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="topbar">
          <div className="search-wrap">
            <input className="search" placeholder="Search anything here..." />
          </div>

          <div className="topbar-right">
            <button className="icon-btn">🔔</button>
            <button className="icon-btn">⚙️</button>
            <div className="profile">
              <div className="avatar">TA</div>
              <div className="profile-text">
                <div className="profile-name">Admin</div>
                <div className="profile-role">Dispatcher</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
