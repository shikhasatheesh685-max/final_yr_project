import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './MyAuctions.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const MyAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const r = await auctionsAPI.getMy();
      setAuctions(r.data);
    } catch (e) {
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (id) => {
    if (!window.confirm('Finalize this auction? The highest bidder will win and the artwork will be marked sold.')) return;
    try {
      setMessage('');
      await auctionsAPI.finalize(id);
      setMessage('Auction finalized. Artwork marked as sold.');
      fetchAuctions();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to finalize');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your auctions..." />;

  return (
    <div className="my-auctions-page">
      <div className="my-auctions-header">
        <h1>My Auctions</h1>
        <Link to="/artist/auctions/create" className="create-auction-btn">Create Auction</Link>
      </div>

      {message && (
        <div className={`message ${message.includes('finalized') ? 'success' : 'error'}`}>{message}</div>
      )}

      {auctions.length === 0 ? (
        <p className="no-data">You have not created any auctions yet. <Link to="/artist/auctions/create">Create one</Link>.</p>
      ) : (
        <div className="my-auctions-list">
          {auctions.map((a) => {
            const art = a.artworkID;
            const ended = new Date(a.endTime) < new Date();
            const isActive = a.status === 'active';
            return (
              <div key={a._id} className="my-auction-card">
                <div className="my-auction-image">
                  {art?.imageURL ? (
                    <img src={`${API_BASE}${art.imageURL}`} alt={art.title} />
                  ) : (
                    <div className="placeholder">No Image</div>
                  )}
                </div>
                <div className="my-auction-info">
                  <h3>{art?.title}</h3>
                  <p>Base: ${a.basePrice} · Ends: {new Date(a.endTime).toLocaleString()}</p>
                  <p><strong>Status:</strong> {a.status}</p>
                  <div className="my-auction-actions">
                    <Link to={`/auction/${a._id}`} className="view-btn">View & Bids</Link>
                    {isActive && ended && (
                      <button type="button" onClick={() => handleFinalize(a._id)} className="finalize-btn">
                        Finalize Auction
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAuctions;
