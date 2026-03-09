import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI, artworksAPI, ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userStats, artworksRes, ordersRes, allOrders] = await Promise.all([
        usersAPI.getStats(),
        artworksAPI.getAll(),
        ordersAPI.getSalesReport(),
        ordersAPI.getAll(),
      ]);

      setStats({
        totalUsers: userStats.data?.totalUsers || 0,
        totalArtists: userStats.data?.totalArtists || 0,
        totalVisitors: userStats.data?.totalVisitors || 0,
        totalArtworks: artworksRes.data?.length || 0,
        totalOrders: ordersRes.data?.stats?.totalOrders || 0,
        totalRevenue: ordersRes.data?.stats?.totalRevenue || 0,
      });

      // Get recent orders (last 10)
      const orders = Array.isArray(allOrders.data) ? allOrders.data : [];
      setRecentOrders(orders.slice(0, 10));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'Sold': 'paid',
      'Cancelled': 'failed',
    };
    return statusMap[status] || 'pending';
  };

  const filteredOrders = recentOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userID?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.artworkID?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="admin-main">
          <LoadingSpinner message="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="page-title">Dashboard Overview</h1>
          </div>
          <div className="header-right">
            <button className="header-btn notification-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notification-dot"></span>
            </button>
            <div className="admin-profile">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="profile-name">{user?.name}</span>
            </div>
            <button className="header-btn logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon users-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="card-info">
                <span className="card-value">{stats?.totalUsers || 0}</span>
                <span className="card-label">Total Users</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon artworks-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div className="card-info">
                <span className="card-value">{stats?.totalArtworks || 0}</span>
                <span className="card-label">Total Artworks</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon orders-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <div className="card-info">
                <span className="card-value">{stats?.totalOrders || 0}</span>
                <span className="card-label">Total Orders</span>
              </div>
            </div>

            <div className="summary-card revenue-card">
              <div className="card-icon revenue-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="card-info">
                <span className="card-value">${stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
                <span className="card-label">Total Revenue</span>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="orders-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="view-all-link">View All</Link>
            </div>

            {/* Filters */}
            <div className="table-filters">
              <div className="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Sold">Sold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Artwork</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-message">No orders found</td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="order-id">#{order._id?.slice(-6).toUpperCase()}</td>
                        <td>{order.userID?.name || 'Unknown'}</td>
                        <td>{order.artworkID?.title || 'N/A'}</td>
                        <td className="amount">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadge(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/admin/orders`} className="action-btn">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
