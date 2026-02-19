import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import './Auth.css';

/**
 * Separate admin login – only users with role 'admin' are allowed.
 * Ensures default admin exists so credentials work without running seed manually.
 */
const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: 'admin@artgallery.com',
    password: 'admin123',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure default admin exists on first run; ignore result.
    authAPI.ensureAdmin().catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        // Not an admin – clear session and show error
        logout();
        setError('Access denied. Admin credentials required.');
        setLoading(false);
      }
    } else {
      setError(result.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split-left"></div>
      <div className="auth-split-right"></div>
      <div className="auth-card admin-login-card">
        <h2>ADMIN LOGIN</h2>
        <p className="admin-login-hint">Administrator access only</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="ADMIN EMAIL"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'VERIFYING...' : 'SIGN IN'}
          </button>
        </form>

        <p className="auth-link">
          Not an admin? <Link to="/login">User login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
