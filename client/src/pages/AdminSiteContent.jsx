import { useState, useEffect } from 'react';
import { settingsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminSiteContent.css';

const AdminSiteContent = () => {
  const [settings, setSettings] = useState({ siteName: '', tagline: '', welcomeMessage: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      setSettings({
        siteName: response.data.siteName ?? 'Art Gallery',
        tagline: response.data.tagline ?? 'Discover beautiful artworks',
        welcomeMessage: response.data.welcomeMessage ?? '',
      });
    } catch (error) {
      setMessage('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      await settingsAPI.update(settings);
      setMessage('Site content saved. The homepage will reflect these changes.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading site content..." />;
  }

  return (
    <div className="admin-site-content-container">
      <h1>Site Content</h1>
      <p className="admin-site-content-desc">Control the main text shown on the public homepage. Only admins can edit this.</p>

      {message && (
        <div className={`message ${message.includes('saved') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="site-content-form">
        <div className="form-group">
          <label>Site Name</label>
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
            placeholder="e.g. Art Gallery Showcase"
          />
        </div>
        <div className="form-group">
          <label>Tagline (hero subtitle)</label>
          <input
            type="text"
            name="tagline"
            value={settings.tagline}
            onChange={handleChange}
            placeholder="e.g. Discover beautiful artworks"
          />
        </div>
        <div className="form-group">
          <label>Welcome Message (optional)</label>
          <textarea
            name="welcomeMessage"
            value={settings.welcomeMessage}
            onChange={handleChange}
            rows={3}
            placeholder="Optional short welcome text for the homepage"
          />
        </div>
        <button type="submit" disabled={saving} className="submit-btn">
          {saving ? 'Saving...' : 'Save Site Content'}
        </button>
      </form>
    </div>
  );
};

export default AdminSiteContent;
