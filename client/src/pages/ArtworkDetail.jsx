import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { artworksAPI, ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ArtworkDetail.css';

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  const fetchArtwork = async () => {
    try {
      setLoading(true);
      const response = await artworksAPI.getById(id);
      setArtwork(response.data);
    } catch (error) {
      console.error('Error fetching artwork:', error);
      setMessage('Artwork not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user.role === 'artist' && artwork.artistID._id === user._id) {
      setMessage('You cannot purchase your own artwork');
      return;
    }

    try {
      setPurchasing(true);
      setMessage('');
      await ordersAPI.create({ artworkID: artwork._id });
      setMessage('Order placed successfully!');
      // Refresh artwork to show updated availability
      setTimeout(() => {
        fetchArtwork();
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to place order'
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!artwork) {
    return (
      <div className="error-container">
        <p>Artwork not found</p>
        <Link to="/">Back to Gallery</Link>
      </div>
    );
  }

  return (
    <div className="artwork-detail-container">
      <Link to="/" className="back-link">← Back to Gallery</Link>
      
      <div className="artwork-detail-content">
        <div className="artwork-image-section">
          {artwork.imageURL ? (
            <img
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${artwork.imageURL}`}
              alt={artwork.title}
            />
          ) : (
            <div className="placeholder-image">No Image</div>
          )}
        </div>

        <div className="artwork-info-section">
          <div className="artwork-header">
            <h1>{artwork.title}</h1>
            {artwork.isFeatured && (
              <span className="featured-badge">Featured</span>
            )}
            {!artwork.isAvailable && (
              <span className="sold-badge">Sold</span>
            )}
          </div>

          <div className="artwork-meta">
            <p className="artist">
              <strong>Artist:</strong>{' '}
              <Link to={`/artist/${artwork.artistID._id}`}>
                {artwork.artistID.name}
              </Link>
            </p>
            <p className="category">
              <strong>Category:</strong> {artwork.category}
            </p>
            <p className="price">
              <strong>Price:</strong> ${artwork.price}
            </p>
          </div>

          <div className="artwork-description">
            <h3>Description</h3>
            <p>{artwork.description}</p>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="artwork-actions">
            {artwork.isAvailable ? (
              <>
                {isAuthenticated ? (
                  artwork.artistID._id !== user._id ? (
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="purchase-btn"
                    >
                      {purchasing ? 'Processing...' : 'Purchase Artwork'}
                    </button>
                  ) : (
                    <p className="info-message">This is your artwork</p>
                  )
                ) : (
                  <Link to="/login" className="purchase-btn">
                    Login to Purchase
                  </Link>
                )}
              </>
            ) : (
              <p className="sold-message">This artwork has been sold</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
