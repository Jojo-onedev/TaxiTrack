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
    <div className="login-container">
      <div className="login-card">
        <div className="icon-container">
          <div className="icon-circle">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="20" cy="30" r="12" fill="white" opacity="0.8"/>
              <circle cx="40" cy="30" r="12" fill="white"/>
            </svg>
          </div>
        </div>

        <h1 className="title">Admin Login</h1>
        <p className="subtitle">Enter your credentials to access the dashboard.</p>

        <div className="form-container">
          <div className="form-group">
            <label className="label">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M2 5l8 6 8-6" stroke="#9CA3AF" strokeWidth="2"/>
              </svg>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@taxitracker.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="9" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M6 8V5a4 4 0 018 0v3" stroke="#9CA3AF" strokeWidth="2"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="button-group">
          <button className="btn-cancel" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-login" onClick={handleLogin} disabled={loading}>
            {loading ? 'Connexion...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
