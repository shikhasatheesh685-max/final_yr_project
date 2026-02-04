import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

/**
 * Separate admin login – not linked from public navbar.
 * Only users with role 'admin' are allowed; others are redirected with an error.
 */
const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="auth-container">
      <div className="auth-card admin-login-card">
        <h2>Admin Login</h2>
        <p className="admin-login-hint">Administrator access only. Use your admin account.</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Verifying...' : 'Admin Login'}
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
