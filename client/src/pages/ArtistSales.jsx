import { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';
import './ArtistSales.css';

const ArtistSales = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getArtistSales();
      setSalesData(response.data);
    } catch (error) {
      setError('Failed to load sales data');
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading sales data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  const { orders, stats } = salesData || {};

  return (
    <div className="artist-sales-container">
      <h1>Sales Status</h1>

      {stats && (
        <div className="sales-stats">
          <div className="stat-card">
            <h3>Total Sales</h3>
            <p className="stat-value">{stats.totalSales}</p>
          </div>
          <div className="stat-card">
            <h3>Sold</h3>
            <p className="stat-value">{stats.soldCount}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pendingCount}</p>
          </div>
          <div className="stat-card">
            <h3>Confirmed</h3>
            <p className="stat-value">{stats.confirmedCount}</p>
          </div>
          <div className="stat-card highlight">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="sales-list">
        <h2>Order History</h2>
        {orders && orders.length === 0 ? (
          <p className="no-orders">No sales yet</p>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Artwork</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order._id}>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="artwork-info-cell">
                        {order.artworkID?.imageURL && (
                          <img
                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${order.artworkID.imageURL}`}
                            alt={order.artworkID.title}
                            className="order-artwork-image"
                          />
                        )}
                        <span>{order.artworkID?.title || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{order.userID?.name || 'N/A'}</td>
                    <td>${order.totalAmount}</td>
                    <td>
                      <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistSales;
