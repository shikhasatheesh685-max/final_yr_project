import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { artworksAPI, auctionsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './CreateAuction.css';

const CreateAuction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myArtworks, setMyArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ artworkID: '', basePrice: '', durationHours: '24' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      artworksAPI.getAll().then((r) => setMyArtworks(r.data || [])).catch(() => setMyArtworks([])).finally(() => setLoading(false));
    } else {
      artworksAPI.getByArtist(user?._id).then((r) => setMyArtworks(r.data || [])).catch(() => setMyArtworks([])).finally(() => setLoading(false));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.artworkID || !form.basePrice) {
      setError('Select an artwork and enter base price');
      return;
    }
    const basePrice = parseFloat(form.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      setError('Enter a valid base price');
      return;
    }
    setSubmitting(true);
    try {
      await auctionsAPI.create({
        artworkID: form.artworkID,
        basePrice,
        durationHours: form.durationHours || 24,
      });
      navigate('/artist/auctions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your artworks..." />;

  const availableArtworks = myArtworks.filter((a) => a.isAvailable);

  return (
    <div className="create-auction-page">
      <Link to="/artist/auctions" className="back-link">← Back to My Auctions</Link>
      <h1>Create Auction</h1>
      <p className="create-auction-desc">Select an available artwork, set base price and duration. Only available artworks can be auctioned.</p>

      {error && <div className="error-message">{error}</div>}

      {availableArtworks.length === 0 ? (
        <p className="no-artworks">No available artworks. <Link to="/artist/upload">Upload one</Link> first.</p>
      ) : (
        <form onSubmit={handleSubmit} className="create-auction-form">
          <div className="form-group">
            <label>Artwork *</label>
            <select
              value={form.artworkID}
              onChange={(e) => setForm((p) => ({ ...p, artworkID: e.target.value }))}
              required
            >
              <option value="">Select artwork</option>
              {availableArtworks.map((a) => (
                <option key={a._id} value={a._id}>{a.title} — ${a.price}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Base price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.basePrice}
              onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Duration (hours)</label>
            <input
              type="number"
              min="1"
              max="720"
              value={form.durationHours}
              onChange={(e) => setForm((p) => ({ ...p, durationHours: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Auction'}</button>
        </form>
      )}
    </div>
  );
};

export default CreateAuction;
