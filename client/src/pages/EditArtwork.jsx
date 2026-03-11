import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artworksAPI, categoriesAPI, getArtworkImageSrc } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './UploadArtwork.css';

const EditArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
  });
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  useEffect(() => {
    categoriesAPI.getAll().then((r) => {
      const list = Array.isArray(r.data) ? r.data.map((c) => (c.name ?? c)) : [];
      setCategories(list);
    }).catch(() => {});
  }, []);

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
      setImageURL('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageURLChange = (e) => {
    const url = e.target.value.trim();
    setImageURL(url);
    if (url) {
      setImage(null);
      setImagePreview(url);
    } else {
      setImagePreview(null);
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

    if (image && image.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    const useNewURL = imageURL && (imageURL.startsWith('http://') || imageURL.startsWith('https://'));

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
      } else if (useNewURL) {
        uploadData.append('imageURL', imageURL);
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
    return <LoadingSpinner message="Loading artwork..." />;
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
              {categories.length > 0 ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
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
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              )}
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
            <label>Image {image || imageURL ? '(New)' : '(Current)'}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="form-hint">or paste an image URL to replace</p>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageURL}
              onChange={handleImageURLChange}
              className="image-url-input"
            />
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            ) : currentImageUrl ? (
              <div className="image-preview">
                <img
                  src={getArtworkImageSrc(currentImageUrl)}
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
