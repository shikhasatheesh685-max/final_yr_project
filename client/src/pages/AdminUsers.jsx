import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminUsers.css';

const AdminUsers = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      setMessage('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setMessage('');
      await usersAPI.updateRole(userId, newRole);
      setMessage('User role updated successfully');
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleApprove = async (userId) => {
    try {
      setMessage('');
      await usersAPI.approve(userId);
      setMessage('Artist approved successfully');
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to approve artist');
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Revoke approval for this artist? They will not be able to upload or manage artworks until approved again.')) {
      return;
    }
    try {
      setMessage('');
      await usersAPI.reject(userId);
      setMessage('Artist approval revoked');
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reject artist');
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    try {
      setMessage('');
      await usersAPI.update(editingUser._id, { name: editForm.name.trim(), email: editForm.email.trim() });
      setMessage('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setMessage('');
      await usersAPI.delete(userId);
      setMessage('User deleted successfully');
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'artist':
        return 'role-badge artist';
      default:
        return 'role-badge visitor';
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="admin-main">
          <LoadingSpinner message="Loading users..." />
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
            <h1 className="page-title">Manage Users</h1>
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
          {/* Edit User Modal */}
          {editingUser && (
            <div className="edit-user-modal-overlay" onClick={() => setEditingUser(null)}>
              <div className="edit-user-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Edit User</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setEditingUser(null)} className="cancel-btn">Cancel</button>
                  <button type="button" onClick={handleEditSave} className="save-btn">Save</button>
                </div>
              </div>
            </div>
          )}

          {/* Message Toast */}
          {message && (
            <div className={`message-toast ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
              <button className="close-toast" onClick={() => setMessage('')}>×</button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="user-stats-cards">
            <div className="stat-card-mini">
              <div className="stat-icon total">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="stat-details">
                <span className="stat-number">{users.length}</span>
                <span className="stat-text">Total Users</span>
              </div>
            </div>
            <div className="stat-card-mini">
              <div className="stat-icon artists">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
              </div>
              <div className="stat-details">
                <span className="stat-number">{users.filter(u => u.role === 'artist').length}</span>
                <span className="stat-text">Artists</span>
              </div>
            </div>
            <div className="stat-card-mini">
              <div className="stat-icon visitors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="stat-details">
                <span className="stat-number">{users.filter(u => u.role === 'visitor').length}</span>
                <span className="stat-text">Visitors</span>
              </div>
            </div>
            <div className="stat-card-mini">
              <div className="stat-icon pending">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="stat-details">
                <span className="stat-number">{users.filter(u => u.role === 'artist' && !u.isApproved).length}</span>
                <span className="stat-text">Pending Approval</span>
              </div>
            </div>
          </div>

          {/* Users Table Section */}
          <div className="users-section">
            <div className="section-header">
              <h2>All Users</h2>
              <span className="user-count">{filteredUsers.length} users</span>
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
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="visitor">Visitor</option>
                <option value="artist">Artist</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Table */}
            <div className="table-container">
              {filteredUsers.length === 0 ? (
                <div className="no-data">No users found</div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                            <span className="user-name">{u.name}</span>
                          </div>
                        </td>
                        <td className="email-cell">{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className={`role-select ${u.role}`}
                          >
                            <option value="visitor">Visitor</option>
                            <option value="artist">Artist</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          {u.role === 'artist' ? (
                            u.isApproved ? (
                              <span className="status-badge approved">Approved</span>
                            ) : (
                              <span className="status-badge pending">Pending</span>
                            )
                          ) : (
                            <span className="status-badge neutral">—</span>
                          )}
                        </td>
                        <td className="date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditClick(u)}
                              className="action-btn edit"
                              title="Edit user"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {u.role === 'artist' && !u.isApproved && (
                              <button
                                onClick={() => handleApprove(u._id)}
                                className="action-btn approve"
                                title="Approve artist"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </button>
                            )}
                            {u.role === 'artist' && u.isApproved && (
                              <button
                                onClick={() => handleReject(u._id)}
                                className="action-btn reject"
                                title="Revoke approval"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(u._id)}
                              className="action-btn delete"
                              title="Delete user"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
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

export default AdminUsers;
