import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './UserOrders.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Sold':
        return 'status-badge status-sold';
      case 'Confirmed':
        return 'status-badge status-confirmed';
      default:
        return 'status-badge status-pending';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your orders..." />;
  }

  return (
    <div className="user-orders-container">
      <h1>My Orders</h1>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="browse-btn">
            Browse Artworks
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p className="order-date">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={getStatusBadgeClass(order.orderStatus)}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="order-content">
                <div className="order-artwork">
                  {order.artworkID?.imageURL ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${order.artworkID.imageURL}`}
                      alt={order.artworkID.title}
                      className="order-image"
                    />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                  <div className="artwork-details">
                    <Link to={`/artwork/${order.artworkID?._id}`} className="artwork-title">
                      {order.artworkID?.title || 'Artwork'}
                    </Link>
                    <p className="artist-name">
                      by {typeof order.artworkID?.artistID === 'object'
                        ? order.artworkID.artistID?.name || 'Unknown'
                        : 'Unknown'}
                    </p>
                    <p className="category">{order.artworkID?.category || 'N/A'}</p>
                  </div>
                </div>
                <div className="order-amount">
                  <p className="amount-label">Total Amount</p>
                  <p className="amount-value">${order.totalAmount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
