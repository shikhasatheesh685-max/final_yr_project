import { useState, useEffect } from 'react';
import { usersAPI, ordersAPI, artworksAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminReports.css';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [userStats, salesReport, artworksRes] = await Promise.all([
        usersAPI.getStats(),
        ordersAPI.getSalesReport(),
        artworksAPI.getAll(),
      ]);
      setData({
        ...userStats.data,
        totalArtworks: artworksRes.data.length,
        sales: salesReport.data.stats,
        orders: salesReport.data.orders,
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading reports..." />;
  }

  if (!data) {
    return <div className="admin-reports-container"><p>Failed to load reports.</p></div>;
  }

  const { sales = {} } = data;

  return (
    <div className="admin-reports-container">
      <h1>System Reports & Analytics</h1>
      <p className="admin-reports-desc">Overview of users, content, sales, and commissions. Admin only.</p>

      <section className="reports-section">
        <h2>User Analytics</h2>
        <div className="reports-grid">
          <div className="report-card">
            <h3>Total Users</h3>
            <p className="report-value">{data.totalUsers ?? 0}</p>
          </div>
          <div className="report-card">
            <h3>Artists</h3>
            <p className="report-value">{data.totalArtists ?? 0}</p>
          </div>
          <div className="report-card">
            <h3>Visitors</h3>
            <p className="report-value">{data.totalVisitors ?? 0}</p>
          </div>
          <div className="report-card">
            <h3>Admins</h3>
            <p className="report-value">{data.totalAdmins ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="reports-section">
        <h2>Content & Orders</h2>
        <div className="reports-grid">
          <div className="report-card">
            <h3>Total Artworks</h3>
            <p className="report-value">{data.totalArtworks ?? 0}</p>
          </div>
          <div className="report-card">
            <h3>Total Orders</h3>
            <p className="report-value">{sales.totalOrders ?? 0}</p>
          </div>
          <div className="report-card">
            <h3>Sold</h3>
            <p className="report-value">{sales.soldCount ?? 0}</p>
          </div>
          <div className="report-card">
            <h3>Pending</h3>
            <p className="report-value">{sales.pendingCount ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="reports-section">
        <h2>Revenue & Commission</h2>
        <div className="reports-grid highlight">
          <div className="report-card">
            <h3>Total Revenue (Sold)</h3>
            <p className="report-value">${(sales.totalRevenue ?? 0).toFixed(2)}</p>
          </div>
          <div className="report-card">
            <h3>Admin Commission (7%)</h3>
            <p className="report-value">${(sales.totalCommission ?? 0).toFixed(2)}</p>
          </div>
          <div className="report-card">
            <h3>Total Artist Payout</h3>
            <p className="report-value">${(sales.totalArtistPayout ?? 0).toFixed(2)}</p>
          </div>
          <div className="report-card">
            <h3>Pending Revenue</h3>
            <p className="report-value">${(sales.pendingRevenue ?? 0).toFixed(2)}</p>
          </div>
          <div className="report-card">
            <h3>Confirmed Revenue</h3>
            <p className="report-value">${(sales.confirmedRevenue ?? 0).toFixed(2)}</p>
          </div>
        </div>
      </section>

      <section className="reports-section">
        <h2>Recent Orders (last 10)</h2>
        {data.orders && data.orders.length > 0 ? (
          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Artwork</th>
                  <th>Amount</th>
                  <th>Admin Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.slice(0, 10).map((order) => (
                  <tr key={order._id}>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.userID?.name || 'N/A'}</td>
                    <td>{order.artworkID?.title || 'N/A'}</td>
                    <td>${order.totalAmount?.toFixed(2)}</td>
                    <td>${(order.adminCommission ?? 0).toFixed(2)}</td>
                    <td><span className={`status-badge status-${order.orderStatus?.toLowerCase()}`}>{order.orderStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No orders yet.</p>
        )}
      </section>
    </div>
  );
};

export default AdminReports;
