import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, transactionsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Payment.css';

const Payment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [artistSales, setArtistSales] = useState(null); // { orders, stats }
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      if (user.role === 'admin') {
        const res = await ordersAPI.getSalesReport();
        setOrders(res.data.orders || []);
      } else if (user.role === 'artist') {
        const [salesRes, txRes] = await Promise.all([
          ordersAPI.getArtistSales(),
          transactionsAPI.getMy().catch(() => ({ data: [] })),
        ]);
        setArtistSales(salesRes.data);
        setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      } else {
        // visitor / customer
        const res = await ordersAPI.getAll();
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Payment fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load payment history');
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

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  if (loading) return <LoadingSpinner message="Loading payment history..." />;

  return (
    <div className="payment-page">
      <h1>Payment & Transaction History</h1>
      <p className="payment-subtitle">
        {user?.role === 'admin' && 'Overview of all orders and revenue.'}
        {user?.role === 'artist' && 'Your sales and payouts. Amount received is after 7% platform commission.'}
        {user?.role !== 'admin' && user?.role !== 'artist' && 'Your orders and payments. Amount paid is deducted when you purchase.'}
      </p>

      {error && <div className="payment-error">{error}</div>}

      {/* Visitor / Customer: orders they paid for (money deducted) */}
      {(user?.role === 'visitor' || !['admin', 'artist'].includes(user?.role)) && (
        <section className="payment-section">
          <h2>Your payments (amount paid / deducted)</h2>
          {orders.length === 0 ? (
            <div className="payment-empty">
              <p>You haven&apos;t made any payments yet.</p>
              <Link to="/">Browse artworks</Link>
            </div>
          ) : (
            <div className="payment-table-wrap">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Artwork</th>
                    <th>Amount paid (deducted)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        {order.artworkID?.title || '—'}
                        {order.artworkID?.artistID?.name && (
                          <span className="payment-meta"> by {order.artworkID.artistID.name}</span>
                        )}
                      </td>
                      <td className="amount-deducted">−${(order.totalAmount ?? 0).toFixed(2)}</td>
                      <td>
                        <span className={getStatusBadgeClass(order.orderStatus)}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Artist: sales (money received) */}
      {user?.role === 'artist' && artistSales && (
        <>
          <section className="payment-section">
            <h2>Your sales (amount received)</h2>
            {artistSales.stats && (
              <div className="payment-stats">
                <span>Sold: {artistSales.stats.soldCount ?? 0}</span>
                <span>Total received (after commission): <strong className="amount-received">${(artistSales.orders || [])
                  .filter((o) => o.orderStatus === 'Sold')
                  .reduce((s, o) => s + (o.artistAmount ?? 0), 0)
                  .toFixed(2)}</strong></span>
              </div>
            )}
            {(!artistSales.orders || artistSales.orders.length === 0) ? (
              <div className="payment-empty">
                <p>No sales yet.</p>
              </div>
            ) : (
              <div className="payment-table-wrap">
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Artwork</th>
                      <th>Buyer</th>
                      <th>Order total</th>
                      <th>Amount received (after commission)</th>
                      <th>Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artistSales.orders.map((order) => (
                      <tr key={order._id}>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>{order.artworkID?.title || '—'}</td>
                        <td>{order.userID?.name || order.userID?.email || '—'}</td>
                        <td>${(order.totalAmount ?? 0).toFixed(2)}</td>
                        <td className="amount-received">+${(order.artistAmount ?? 0).toFixed(2)}</td>
                        <td>
                          {order.orderStatus === 'Sold' ? (
                            order.payoutStatus === 'Transferred' ? (
                              <span className="status-badge status-sold">Transferred</span>
                            ) : (
                              <span className="status-badge status-pending">Pending</span>
                            )
                          ) : (
                            <span className={getStatusBadgeClass(order.orderStatus)}>
                              {order.orderStatus}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {transactions.length > 0 && (
            <section className="payment-section">
              <h2>Payout transactions</h2>
              <div className="payment-table-wrap">
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Order</th>
                      <th>From</th>
                      <th>Amount received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t._id}>
                        <td>{new Date(t.createdAt).toLocaleString()}</td>
                        <td>{t.type || 'payout'}</td>
                        <td>{t.orderID?._id ? String(t.orderID._id).slice(-8) : '—'}</td>
                        <td>{t.fromUser?.name || t.fromUser?.email || 'System'}</td>
                        <td className="amount-received">+${(t.amount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* Admin: summary and link */}
      {user?.role === 'admin' && (
        <section className="payment-section">
          <h2>All orders</h2>
          <div className="payment-admin-actions">
            <Link to="/admin/orders" className="payment-link-btn">Manage Orders</Link>
            <Link to="/admin/reports" className="payment-link-btn">Reports &amp; Analytics</Link>
          </div>
          {orders.length === 0 ? (
            <p className="payment-empty">No orders in the system.</p>
          ) : (
            <div className="payment-table-wrap">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Artwork</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map((order) => (
                    <tr key={order._id}>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>{order.userID?.name || order.userID?.email || '—'}</td>
                      <td>{order.artworkID?.title || '—'}</td>
                      <td>${(order.totalAmount ?? 0).toFixed(2)}</td>
                      <td>{order.paymentType || '—'}</td>
                      <td>
                        <span className={getStatusBadgeClass(order.orderStatus)}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length > 20 && (
                <p className="payment-more">
                  <Link to="/admin/orders">View all {orders.length} orders →</Link>
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Payment;
