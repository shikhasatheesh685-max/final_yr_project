import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { artworksAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminArtworks.css';

const AdminArtworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await artworksAPI.getAll();
      setArtworks(response.data);
    } catch (error) {
      setMessage('Failed to load artworks');
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) {
      return;
    }

    try {
      setMessage('');
      await artworksAPI.delete(id);
      setMessage('Artwork deleted successfully');
      fetchArtworks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete artwork');
    }
  };

  const handleToggleFeatured = async (artwork) => {
    try {
      setMessage('');
      const formData = new FormData();
      formData.append('isFeatured', !artwork.isFeatured);
      await artworksAPI.update(artwork._id, formData);
      setMessage('Artwork updated successfully');
      fetchArtworks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update artwork');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading artworks..." />;
  }

  return (
    <div className="admin-artworks-container">
      <h1>Manage Artworks</h1>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {artworks.length === 0 ? (
        <p className="no-data">No artworks found</p>
      ) : (
        <div className="artworks-grid">
          {artworks.map((artwork) => (
            <div key={artwork._id} className="artwork-card">
              <div className="artwork-image">
                {artwork.imageURL ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${artwork.imageURL}`}
                    alt={artwork.title}
                  />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
                {artwork.isFeatured && (
                  <span className="featured-badge">Featured</span>
                )}
                {!artwork.isAvailable && (
                  <span className="sold-badge">Sold</span>
                )}
              </div>
              <div className="artwork-info">
                <h3>{artwork.title}</h3>
                <p className="artist">
                  by {typeof artwork.artistID === 'object' 
                    ? artwork.artistID?.name || 'Unknown'
                    : 'Unknown'}
                </p>
                <p className="category">{artwork.category}</p>
                <p className="price">${artwork.price}</p>
                <div className="artwork-actions">
                  <Link to={`/artwork/${artwork._id}`} className="view-btn">
                    View
                  </Link>
                  <button
                    onClick={() => handleToggleFeatured(artwork)}
                    className={`feature-btn ${artwork.isFeatured ? 'active' : ''}`}
                  >
                    {artwork.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => handleDelete(artwork._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminArtworks;
