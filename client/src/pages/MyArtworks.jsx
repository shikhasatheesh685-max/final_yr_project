import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { artworksAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './MyArtworks.css';

const MyArtworks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await artworksAPI.getByArtist(user._id);
      setArtworks(response.data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setMessage('Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) {
      return;
    }

    try {
      await artworksAPI.delete(id);
      setMessage('Artwork deleted successfully');
      fetchArtworks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete artwork');
    }
  };

  const handleEdit = (id) => {
    navigate(`/artist/artworks/edit/${id}`);
  };

  if (loading) {
    return <div className="loading-container">Loading your artworks...</div>;
  }

  return (
    <div className="my-artworks-container">
      <div className="page-header">
        <h1>My Artworks</h1>
        <Link to="/artist/upload" className="upload-btn">
          + Upload New Artwork
        </Link>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {artworks.length === 0 ? (
        <div className="no-artworks">
          <p>You haven't uploaded any artworks yet.</p>
          <Link to="/artist/upload" className="upload-btn">
            Upload Your First Artwork
          </Link>
        </div>
      ) : (
        <div className="artworks-list">
          {artworks.map((artwork) => (
            <div key={artwork._id} className="artwork-item">
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
              <div className="artwork-details">
                <h3>{artwork.title}</h3>
                <p className="category">{artwork.category}</p>
                <p className="price">${artwork.price}</p>
                <p className="status">
                  Status: {artwork.isAvailable ? 'Available' : 'Sold'}
                </p>
                <div className="artwork-actions">
                  <Link
                    to={`/artwork/${artwork._id}`}
                    className="view-btn"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleEdit(artwork._id)}
                    className="edit-btn"
                  >
                    Edit
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

export default MyArtworks;
