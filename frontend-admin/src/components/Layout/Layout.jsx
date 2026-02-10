import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { FaChartLine, FaUsers, FaCar, FaUserTie, FaTools, FaSignOutAlt } from 'react-icons/fa';
import './Layout.css';
import logo from '../../assets/logo.png';
=======
import './Layout.css';
>>>>>>> origin/frontend-admin

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
<<<<<<< HEAD
    { path: '/dashboard', label: 'Dashboard', icon: <FaChartLine className="nav-icon-svg" /> },
    { path: '/drivers', label: 'Drivers', icon: <FaUsers className="nav-icon-svg" /> },
    { path: '/vehicles', label: 'Vehicles', icon: <FaCar className="nav-icon-svg" /> },
    { path: '/clients', label: 'Clients', icon: <FaUserTie className="nav-icon-svg" /> },
    { path: '/maintenance', label: 'Maintenance', icon: <FaTools className="nav-icon-svg" /> },
=======
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/drivers', label: 'Drivers', icon: '🚕' },
    { path: '/vehicles', label: 'Vehicles', icon: '🚗' },
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/maintenance', label: 'Maintenance', icon: '🛠️' },
    { path: '/feedback', label: 'Feedback', icon: '💬' },
>>>>>>> origin/frontend-admin
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
<<<<<<< HEAD
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <img src={logo} alt="TaxiTracker" />
          </div>
=======
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🚕</div>
>>>>>>> origin/frontend-admin
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
<<<<<<< HEAD
              {item.icon}
              <span>{item.label}</span>
=======
              <span className="nav-icon">{item.icon}</span>
              {item.label}
>>>>>>> origin/frontend-admin
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
<<<<<<< HEAD
            <FaSignOutAlt className="logout-icon" />
            Déconnexion
=======
            🚪 Déconnexion
>>>>>>> origin/frontend-admin
          </button>
        </div>
      </aside>

<<<<<<< HEAD
      <main className="main-content">
        <header className="topbar">
          {/* <div className="search-wrap">
            <input className="search" placeholder="Search anything here..." />
          </div> */}

          <div className="topbar-right">
            {/* <button className="icon-btn" title="Notifications">
              <FaSignOutAlt className="top-icon" />
            </button>
            <button className="icon-btn" title="Settings">
              <FaSignOutAlt className="top-icon" />
            </button> */}
=======
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
>>>>>>> origin/frontend-admin
            <div className="profile">
              <div className="avatar">TA</div>
              <div className="profile-text">
                <div className="profile-name">Admin</div>
                <div className="profile-role">Dispatcher</div>
              </div>
            </div>
          </div>
        </header>

<<<<<<< HEAD
=======
        {/* Page Content */}
>>>>>>> origin/frontend-admin
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
