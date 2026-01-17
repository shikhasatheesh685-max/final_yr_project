import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ArtistDashboard.css';

const ArtistDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="artist-dashboard">
      <div className="dashboard-header">
        <h1>Artist Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Quick Actions</h3>
          <Link to="/artist/upload" className="action-btn primary">
            Upload New Artwork
          </Link>
        </div>
      </div>

      <div className="dashboard-links">
        <Link to="/artist/artworks" className="dashboard-link-card">
          <h3>My Artworks</h3>
          <p>View and manage all your uploaded artworks</p>
        </Link>

        <Link to="/artist/sales" className="dashboard-link-card">
          <h3>Sales Status</h3>
          <p>Track your artwork sales and revenue</p>
        </Link>
      </div>
    </div>
  );
};

export default ArtistDashboard;
