import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminSales.css';

const AdminSales = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { orders, stats } = salesData || {};

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = !searchTerm || 
      order.userID?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.artworkID?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.artworkID?.artistID?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="admin-main">
          <LoadingSpinner message="Loading sales report..." />
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
            <h1 className="page-title">Sales Report</h1>
          </div>
          <div className="header-right">
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

        {/* Page Content */}
        <div className="admin-page-content">
          {error && (
            <div className="error-banner">{error}</div>
          )}

          {/* Revenue Stats - Top Row */}
          {stats && (
            <div className="revenue-cards">
              <div className="revenue-card main">
                <div className="revenue-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="revenue-info">
                  <span className="revenue-label">Total Revenue</span>
                  <span className="revenue-value">${stats.totalRevenue?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              <div className="revenue-card commission">
                <div className="revenue-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="revenue-info">
                  <span className="revenue-label">Commission (7%)</span>
                  <span className="revenue-value">${stats.totalCommission?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              <div className="revenue-card payout">
                <div className="revenue-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div className="revenue-info">
                  <span className="revenue-label">Artist Payouts</span>
                  <span className="revenue-value">${stats.totalArtistPayout?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Stats - Second Row */}
          {stats && (
            <div className="order-stats-cards">
              <div className="order-stat-card">
                <div className="stat-icon total">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-number">{stats.totalOrders}</span>
                  <span className="stat-text">Total Orders</span>
                </div>
              </div>
              <div className="order-stat-card">
                <div className="stat-icon sold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-number">{stats.soldCount}</span>
                  <span className="stat-text">Sold</span>
                </div>
              </div>
              <div className="order-stat-card">
                <div className="stat-icon pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-number">{stats.pendingCount}</span>
                  <span className="stat-text">Pending</span>
                </div>
              </div>
              <div className="order-stat-card">
                <div className="stat-icon confirmed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-number">{stats.confirmedCount}</span>
                  <span className="stat-text">Confirmed</span>
                </div>
              </div>
              <div className="order-stat-card">
                <div className="stat-icon pending-rev">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-number">${stats.pendingRevenue?.toFixed(2) || '0.00'}</span>
                  <span className="stat-text">Pending Revenue</span>
                </div>
              </div>
              <div className="order-stat-card">
                <div className="stat-icon confirmed-rev">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-number">${stats.confirmedRevenue?.toFixed(2) || '0.00'}</span>
                  <span className="stat-text">Confirmed Revenue</span>
                </div>
              </div>
            </div>
          )}

          {/* Orders Table Section */}
          <div className="sales-section">
            <div className="section-header">
              <h2>All Orders</h2>
              <span className="order-count">{filteredOrders.length} orders</span>
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
                  placeholder="Search by customer, artwork, or artist..."
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
              </select>
            </div>

            {/* Table */}
            <div className="table-container">
              {filteredOrders.length === 0 ? (
                <div className="no-data">No orders found</div>
              ) : (
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Artwork</th>
                      <th>Artist</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">{order.userID?.name?.charAt(0).toUpperCase() || '?'}</div>
                            <div className="customer-info">
                              <span className="customer-name">{order.userID?.name || 'N/A'}</span>
                              <span className="customer-email">{order.userID?.email || ''}</span>
                            </div>
                          </div>
                        </td>
                        <td className="artwork-cell">{order.artworkID?.title || 'N/A'}</td>
                        <td className="artist-cell">{order.artworkID?.artistID?.name || 'Unknown'}</td>
                        <td className="amount-cell">${order.totalAmount?.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSales;
