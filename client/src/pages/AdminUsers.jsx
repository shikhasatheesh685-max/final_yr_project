import { useState, useEffect } from 'react';
import { usersAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

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

  return (
    <div className="admin-users-container">
      <h1>Manage Users</h1>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {users.length === 0 ? (
        <p className="no-data">No users found</p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className={getRoleBadgeClass(user.role)}
                    >
                      <option value="visitor">Visitor</option>
                      <option value="artist">Artist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    {user.role === 'artist' ? (
                      user.isApproved ? (
                        <span className="status-badge approved">Approved</span>
                      ) : (
                        <span className="status-badge pending">Pending</span>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.role === 'artist' && !user.isApproved && (
                      <button
                        onClick={() => handleApprove(user._id)}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                    )}
                    {user.role === 'artist' && user.isApproved && (
                      <button
                        onClick={() => handleReject(user._id)}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
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

export default AdminUsers;
