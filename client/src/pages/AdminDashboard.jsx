import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, artworksAPI, ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [userStats, artworksRes, ordersRes] = await Promise.all([
        usersAPI.getStats(),
        artworksAPI.getAll(),
        ordersAPI.getSalesReport(),
      ]);

      setStats({
        ...userStats,
        totalArtworks: artworksRes.data.length,
        totalOrders: ordersRes.data.stats?.totalOrders || 0,
        totalRevenue: ordersRes.data.stats?.totalRevenue || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <div className="stat-breakdown">
              <span>Artists: {stats.totalArtists}</span>
              <span>Visitors: {stats.totalVisitors}</span>
              <span>Admins: {stats.totalAdmins}</span>
            </div>
          </div>

          <div className="stat-card">
            <h3>Total Artworks</h3>
            <p className="stat-value">{stats.totalArtworks}</p>
          </div>

          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>

          <div className="stat-card highlight">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      )}

      <div className="dashboard-links">
        <Link to="/admin/users" className="dashboard-link-card">
          <h3>Manage Users</h3>
          <p>View and manage all users and artists</p>
        </Link>

        <Link to="/admin/artworks" className="dashboard-link-card">
          <h3>Manage Artworks</h3>
          <p>View, edit, and delete all artworks</p>
        </Link>

        <Link to="/admin/orders" className="dashboard-link-card">
          <h3>Manage Orders</h3>
          <p>View and update order statuses</p>
        </Link>

        <Link to="/admin/sales" className="dashboard-link-card">
          <h3>Sales Reports</h3>
          <p>View detailed sales reports and analytics</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
