import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artworksAPI } from '../utils/api';
import './UploadArtwork.css';

const EditArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  const fetchArtwork = async () => {
    try {
      setFetching(true);
      const response = await artworksAPI.getById(id);
      const artwork = response.data;
      setFormData({
        title: artwork.title,
        description: artwork.description,
        price: artwork.price.toString(),
        category: artwork.category,
        isAvailable: artwork.isAvailable,
      });
      setCurrentImageUrl(artwork.imageURL);
    } catch (error) {
      setError('Failed to load artwork');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      setError('Please fill in all fields');
      return;
    }

    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('price', formData.price);
      uploadData.append('category', formData.category);
      uploadData.append('isAvailable', formData.isAvailable);
      if (image) {
        uploadData.append('image', image);
      }

      await artworksAPI.update(id, uploadData);
      setMessage('Artwork updated successfully!');
      
      setTimeout(() => {
        navigate('/artist/artworks');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update artwork');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading-container">Loading artwork...</div>;
  }

  return (
    <div className="upload-artwork-container">
      <div className="upload-artwork-card">
        <h2>Edit Artwork</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />
              Available for purchase
            </label>
          </div>

          <div className="form-group">
            <label>Image {image ? '(New)' : '(Current)'}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            ) : currentImageUrl ? (
              <div className="image-preview">
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${currentImageUrl}`}
                  alt="Current"
                />
                <p className="preview-note">Current image (leave empty to keep)</p>
              </div>
            ) : null}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/artist/artworks')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Updating...' : 'Update Artwork'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtwork;
