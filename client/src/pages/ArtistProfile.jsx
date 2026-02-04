import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { artworksAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ArtistProfile.css';

const ArtistProfile = () => {
  const { id } = useParams();
  const [artworks, setArtworks] = useState([]);
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArtworks();
  }, [id]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await artworksAPI.getByArtist(id);
      setArtworks(response.data);
      if (response.data.length > 0 && response.data[0].artistID) {
        setArtistName(response.data[0].artistID.name || 'Artist');
      } else {
        setArtistName('Artist');
      }
    } catch (err) {
      console.error('Error fetching artist artworks:', err);
      setError('Could not load artist profile.');
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading artist profile..." />;
  }

  return (
    <div className="artist-profile-container">
      <Link to="/" className="back-link">← Back to Gallery</Link>

      <div className="artist-profile-header">
        <h1>Artworks by {artistName}</h1>
        <p className="artworks-count">
          {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
        </p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {!error && artworks.length === 0 ? (
        <div className="no-artworks">No artworks found for this artist.</div>
      ) : (
        <div className="artworks-grid">
          {artworks.map((artwork) => (
            <Link
              key={artwork._id}
              to={`/artwork/${artwork._id}`}
              className="artwork-card"
            >
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
                <p className="category">{artwork.category}</p>
                <p className="price">${artwork.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistProfile;
