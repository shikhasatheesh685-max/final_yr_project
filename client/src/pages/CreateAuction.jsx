import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { artworksAPI, auctionsAPI, categoriesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './CreateAuction.css';

const CreateAuction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState('existing'); // 'existing' | 'upload'
  const [myArtworks, setMyArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Existing artwork form
  const [form, setForm] = useState({ artworkID: '', basePrice: '', durationHours: '24' });

  // Upload new artwork for auction form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    basePrice: '',
    durationHours: '24',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [artRes, catRes] = await Promise.all([
          user?.role === 'admin' ? artworksAPI.getAll() : artworksAPI.getByArtist(user?._id),
          categoriesAPI.getAll().catch(() => ({ data: [] })),
        ]);
        setMyArtworks(artRes?.data || []);
        const list = Array.isArray(catRes?.data) ? catRes.data.map((c) => (c.name ?? c)) : [];
        setCategories(list.length ? list : []);
      } catch {
        setMyArtworks([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const handleSubmitExisting = async (e) => {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!uploadForm.title.trim()) {
      setError('Enter a title');
      return;
    }
    if (!uploadForm.description.trim() || uploadForm.description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }
    if (!uploadForm.category?.trim()) {
      setError('Select or enter a category');
      return;
    }
    const basePrice = parseFloat(uploadForm.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      setError('Enter a valid base price');
      return;
    }
    if (!image) {
      setError('Select an image');
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setSubmitting(true);
    try {
      const uploadData = new FormData();
      uploadData.append('title', uploadForm.title.trim());
      uploadData.append('description', uploadForm.description.trim());
      uploadData.append('price', String(basePrice));
      uploadData.append('category', uploadForm.category.trim());
      uploadData.append('image', image);

      const artRes = await artworksAPI.create(uploadData);
      const artworkID = artRes.data?._id;
      if (!artworkID) {
        setError('Artwork was created but ID was not returned');
        setSubmitting(false);
        return;
      }

      await auctionsAPI.create({
        artworkID,
        basePrice,
        durationHours: uploadForm.durationHours || 24,
      });
      navigate('/artist/auctions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create artwork or auction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  const availableArtworks = myArtworks.filter((a) => a.isAvailable);

  return (
    <div className="create-auction-page">
      <Link to="/artist/auctions" className="back-link">← Back to My Auctions</Link>
      <h1>Create Auction</h1>

      <div className="create-auction-tabs">
        <button
          type="button"
          className={`tab ${mode === 'existing' ? 'active' : ''}`}
          onClick={() => setMode('existing')}
        >
          Use existing artwork
        </button>
        <button
          type="button"
          className={`tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          Upload new artwork for auction
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {mode === 'existing' && (
        <>
          <p className="create-auction-desc">Select an available artwork, set base price and duration. Only available artworks can be auctioned.</p>
          {availableArtworks.length === 0 ? (
            <p className="no-artworks">No available artworks. <Link to="/artist/upload">Upload one</Link> or use &quot;Upload new artwork for auction&quot; above.</p>
          ) : (
            <form onSubmit={handleSubmitExisting} className="create-auction-form">
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
        </>
      )}

      {mode === 'upload' && (
        <>
          <p className="create-auction-desc">Upload a new artwork and list it for auction. Base price will be used as the artwork price and minimum bid.</p>
          <form onSubmit={handleSubmitUpload} className="create-auction-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Description * (min 10 characters)</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              {categories.length > 0 ? (
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm((p) => ({ ...p, category: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Painting, Sculpture"
                  required
                />
              )}
            </div>
            <div className="form-group">
              <label>Base price / Min bid ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={uploadForm.basePrice}
                onChange={(e) => setUploadForm((p) => ({ ...p, basePrice: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Duration (hours)</label>
              <input
                type="number"
                min="1"
                max="720"
                value={uploadForm.durationHours}
                onChange={(e) => setUploadForm((p) => ({ ...p, durationHours: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Image *</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
              {imagePreview && (
                <div className="image-preview-small">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Upload & Create Auction'}</button>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateAuction;
