import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { artworksAPI } from '../utils/api';
import './Home.css';

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    featured: false,
    available: true,
  });

  useEffect(() => {
    fetchArtworks();
    fetchCategories();
  }, [filters]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.featured) params.featured = 'true';
      if (filters.available !== undefined) params.available = filters.available.toString();
      
      const response = await artworksAPI.getAll(params);
      setArtworks(response.data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await artworksAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Art Gallery Showcase</h1>
        <p>Discover beautiful artworks from talented artists</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
            />
            Featured Only
          </label>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filters.available}
              onChange={(e) => handleFilterChange('available', e.target.checked)}
            />
            Available Only
          </label>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading artworks...</div>
      ) : artworks.length === 0 ? (
        <div className="no-artworks">No artworks found</div>
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
                <p className="artist-name">
                  by {artwork.artistID?.name || 'Unknown'}
                </p>
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

export default Home;
