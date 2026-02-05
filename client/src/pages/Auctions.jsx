import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Auctions.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auctionsAPI.getAll().then((r) => {
      setAuctions(r.data);
    }).catch(() => setAuctions([])).finally(() => setLoading(false));
  }, []);

  const isEnded = (endTime) => new Date(endTime) < new Date();

  if (loading) return <LoadingSpinner message="Loading auctions..." />;

  return (
    <div className="auctions-page">
      <h1>Live Auctions</h1>
      <p className="auctions-intro">Place bids on artworks. Highest bidder wins when the auction ends.</p>

      {auctions.length === 0 ? (
        <p className="no-data">No active auctions at the moment.</p>
      ) : (
        <div className="auctions-grid">
          {auctions.map((a) => {
            const art = a.artworkID;
            const ended = isEnded(a.endTime);
            return (
              <Link key={a._id} to={`/auction/${a._id}`} className="auction-card">
                <div className="auction-image">
                  {art?.imageURL ? (
                    <img src={`${API_BASE}${art.imageURL}`} alt={art.title} />
                  ) : (
                    <div className="placeholder">No Image</div>
                  )}
                  <span className={`status-badge ${ended ? 'ended' : 'active'}`}>
                    {ended ? 'Ended' : 'Active'}
                  </span>
                </div>
                <div className="auction-info">
                  <h3>{art?.title}</h3>
                  <p className="base-price">Base: ${a.basePrice}</p>
                  <p className="end-time">Ends: {new Date(a.endTime).toLocaleString()}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Auctions;
