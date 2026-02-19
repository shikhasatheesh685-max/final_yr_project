import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { auctionsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './AuctionDetail.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    auctionsAPI.getById(id).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [id]);

  const handleEndEarly = async () => {
    if (!window.confirm('End this auction now? The highest bidder will win and the artwork will be marked sold. This cannot be undone.')) return;
    setFinalizing(true);
    setMessage('');
    try {
      await auctionsAPI.finalize(id);
      setMessage('Auction ended. Winner has been set.');
      const r = await auctionsAPI.getById(id);
      setData(r.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to end auction');
    } finally {
      setFinalizing(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) {
      setMessage('Enter a valid amount');
      return;
    }
    setBidding(true);
    setMessage('');
    try {
      await auctionsAPI.placeBid(id, amount);
      setMessage('Bid placed successfully!');
      setBidAmount('');
      const r = await auctionsAPI.getById(id);
      setData(r.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading auction..." />;
  if (!data?.auction) return <div className="auction-detail-page"><p>Auction not found.</p><Link to="/auctions">Back to Auctions</Link></div>;

  const { auction, bids } = data;
  const art = auction.artworkID;
  const ended = new Date(auction.endTime) < new Date();
  const artworkSold = art && art.isAvailable === false;
  const isOwner = user && (auction.createdBy?._id === user._id || auction.createdBy === user._id);
  const highestBid = bids?.length ? bids[0] : null;
  const minBid = highestBid ? highestBid.amount + 0.01 : auction.basePrice;
  const isAdmin = user?.role === 'admin';
  const canBid = !ended && !isOwner && !isAdmin && isAuthenticated && !artworkSold && auction.status === 'active';

  return (
    <div className="auction-detail-page">
      <Link to="/auctions" className="back-link">← Back to Auctions</Link>

      <div className="auction-detail-layout">
        <div className="auction-image-section">
          {art?.imageURL ? (
            <img src={`${API_BASE}${art.imageURL}`} alt={art.title} />
          ) : (
            <div className="placeholder">No Image</div>
          )}
          <span className={`status-badge ${artworkSold ? 'sold' : ended ? 'ended' : 'active'}`}>
            {artworkSold ? 'Sold' : ended ? 'Ended' : 'Active'}
          </span>
        </div>

        <div className="auction-detail-info">
          <h1>{art?.title}</h1>
          <p className="artist">By {auction.createdBy?.name || 'Artist'}</p>
          <p><strong>Base price:</strong> ${auction.basePrice}</p>
          <p><strong>Ends:</strong> {new Date(auction.endTime).toLocaleString()}</p>
          {highestBid && <p className="current-bid"><strong>Current highest bid:</strong> ${highestBid.amount} {highestBid.userID?.name && `(${highestBid.userID.name})`}</p>}

          {artworkSold && (
            <p className="sold-notice">This artwork has been sold. Bidding is closed.</p>
          )}
          {canBid && (
            <form onSubmit={handlePlaceBid} className="bid-form">
              <label>Your bid (min ${minBid})</label>
              <input
                type="number"
                step="0.01"
                min={minBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={minBid}
              />
              <button type="submit" disabled={bidding}>{bidding ? 'Placing...' : 'Place Bid'}</button>
            </form>
          )}
          {!ended && !artworkSold && !isAuthenticated && (
            <p><Link to="/login">Log in</Link> to place a bid.</p>
          )}
          {!ended && !artworkSold && isAuthenticated && isAdmin && (
            <p className="admin-no-bid">Admins cannot place bids.</p>
          )}
          {!artworkSold && isAuthenticated && isOwner && auction.status === 'active' && (
            <div className="owner-actions">
              <p className="owner-notice">
                {ended ? 'Auction time has ended. Finalize to set the winner.' : 'You are the auction owner. You can end the auction before the scheduled time.'}
              </p>
              <button type="button" onClick={handleEndEarly} disabled={finalizing} className="end-early-btn">
                {finalizing ? 'Ending...' : ended ? 'Finalize auction' : 'End auction early'}
              </button>
            </div>
          )}

          {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        </div>
      </div>

      <div className="bids-section">
        <h2>Bids ({bids?.length || 0})</h2>
        {bids?.length ? (
          <ul className="bids-list">
            {bids.map((b) => (
              <li key={b._id}>
                <strong>${b.amount}</strong> — {b.userID?.name || 'User'} ({new Date(b.createdAt).toLocaleString()})
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-bids">No bids yet.</p>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;
