import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artworksAPI } from '../utils/api';
import './UploadArtwork.css';

const UploadArtwork = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price (greater than 0)');
      return;
    }

    if (!formData.category.trim()) {
      setError('Please enter a category');
      return;
    }

    if (!image) {
      setError('Please select an image');
      return;
    }

    // Check file size (5MB limit)
    if (image.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('price', formData.price);
      uploadData.append('category', formData.category);
      uploadData.append('image', image);

      await artworksAPI.create(uploadData);
      setMessage('Artwork uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
      });
      setImage(null);
      setImagePreview(null);
      e.target.reset();

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/artist/artworks');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload artwork');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-artwork-container">
      <div className="upload-artwork-card">
        <h2>Upload New Artwork</h2>
        
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
                placeholder="e.g., Painting, Sculpture, Digital"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/artist/dashboard')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Uploading...' : 'Upload Artwork'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadArtwork;
