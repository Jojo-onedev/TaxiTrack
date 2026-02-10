import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaUsers, FaCar, FaUserTie, FaTools, FaSignOutAlt } from 'react-icons/fa';
import './Layout.css';
import logo from '../../assets/logo.png';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaChartLine className="nav-icon-svg" /> },
    { path: '/drivers', label: 'Drivers', icon: <FaUsers className="nav-icon-svg" /> },
    { path: '/vehicles', label: 'Vehicles', icon: <FaCar className="nav-icon-svg" /> },
    { path: '/clients', label: 'Clients', icon: <FaUserTie className="nav-icon-svg" /> },
    { path: '/maintenance', label: 'Maintenance', icon: <FaTools className="nav-icon-svg" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <img src={logo} alt="TaxiTracker" />
          </div>
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
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            Déconnexion
          </button>
        </div>
      </aside>

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
            <div className="profile">
              <div className="avatar">TA</div>
              <div className="profile-text">
                <div className="profile-name">Admin</div>
                <div className="profile-role">Dispatcher</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
