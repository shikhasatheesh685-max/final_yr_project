import { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminSales.css';

const AdminSales = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getSalesReport();
      setSalesData(response.data);
    } catch (error) {
      setError('Failed to load sales report');
      console.error('Error fetching sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading sales report..." />;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  const { orders, stats } = salesData || {};

  return (
    <div className="admin-sales-container">
      <h1>Sales Reports</h1>

      {stats && (
        <div className="sales-stats">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
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
            <p className="stat-value">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Revenue</h3>
            <p className="stat-value">${stats.pendingRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>Confirmed Revenue</h3>
            <p className="stat-value">${stats.confirmedRevenue?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      )}

      <div className="sales-list">
        <h2>All Orders</h2>
        {orders && orders.length === 0 ? (
          <p className="no-orders">No orders yet</p>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Customer</th>
                  <th>Artwork</th>
                  <th>Artist</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order._id}>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="customer-info">
                        <strong>{order.userID?.name || 'N/A'}</strong>
                        <span>{order.userID?.email || ''}</span>
                      </div>
                    </td>
                    <td>{order.artworkID?.title || 'N/A'}</td>
                    <td>{order.artworkID?.artistID?.name || 'Unknown'}</td>
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

export default AdminSales;
