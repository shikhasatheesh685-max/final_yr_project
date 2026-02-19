import { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      setMessage('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setMessage('');
      await ordersAPI.updateStatus(orderId, newStatus);
      setMessage('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleTransfer = async (orderId) => {
    try {
      setMessage('');
      await ordersAPI.transfer(orderId);
      setMessage('Payout marked as transferred');
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to mark payout transferred');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

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

  return (
    <div className="admin-orders-container">
      <h1>Manage Orders</h1>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="no-data">No orders found</p>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order Date</th>
                <th>Customer</th>
                <th>Artwork</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Payout</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.userID?.name || 'N/A'}</strong>
                      <span>{order.userID?.email || ''}</span>
                    </div>
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
                      <div>
                        <strong>{order.artworkID?.title || 'N/A'}</strong>
                        <span>by {order.artworkID?.artistID?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </td>
                  <td>${order.totalAmount?.toFixed(2)}</td>
                  <td>{order.paymentType || '—'}</td>
                  <td>
                    <span className={getStatusBadgeClass(order.orderStatus)}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    {order.orderStatus === 'Sold' ? (
                      order.payoutStatus === 'Transferred' ? (
                        <span className="status-badge status-sold">Transferred</span>
                      ) : (
                        <button
                          type="button"
                          className="transfer-btn"
                          onClick={() => handleTransfer(order._id)}
                        >
                          Mark transferred
                        </button>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
