import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // ← AJOUTÉ

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await authService.login(email, password);

    setLoading(false);

    if (result.success) {
      // Vérifier si admin
      if (result.data.user.role === 'admin') {
        window.location.href = '/dashboard';
      } else {
        setError('Accès réservé aux administrateurs');
        authService.logout();
      }
    } else {
      setError(result.error);
    }
  };

  // ← FONCTION AJOUTÉE
  const handleCancel = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-split-container">
        {/* Left Side: Branding & Visuals */}
        <div className="login-branding-side">
          <div className="branding-content">
            <div className="logo-badge">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="12" fill="white" fillOpacity="0.2" />
                <path d="M10 20L15 25L30 15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>TaxiTrack Admin</span>
            </div>
            <h1 className="branding-title">
              Manage your fleet with <span className="text-gradient">precision</span>.
            </h1>
            <p className="branding-description">
              The most advanced platform for taxi and VTC management.
              Real-time tracking, automated dispatch, and deep analytics at your fingertips.
            </p>
            <div className="stat-cards">
              <div className="mini-stat">
                <span className="stat-value">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="mini-stat">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
          <div className="abstract-shape shape-1"></div>
          <div className="abstract-shape shape-2"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-side">
          <div className="login-card-premium">
            <div className="card-header">
              <h2 className="welcome-text">Welcome Back</h2>
              <p className="card-subtitle">Please enter your details to sign in.</p>
            </div>

            <div className="form-container">
              <div className="form-group-premium">
                <label>Email Address</label>
                <div className="input-group-premium">
                  <div className="input-icon-premium">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group-premium">
                <div className="label-row">
                  <label>Password</label>
                  <a href="#" className="forgot-link">Forgot?</a>
                </div>
                <div className="input-group-premium">
                  <div className="input-icon-premium">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-premium"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-alert-premium">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                className={`submit-btn-premium ${loading ? 'loading' : ''}`}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    Sign In to Dashboard
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <footer className="card-footer">
              <p>© 2026 TaxiTrack System. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
