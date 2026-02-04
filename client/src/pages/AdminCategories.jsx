import { useState, useEffect } from 'react';
import { categoriesAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      setMessage('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setMessage('');
      await categoriesAPI.create(newName.trim());
      setMessage('Category added');
      setNewName('');
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add category');
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      setMessage('');
      await categoriesAPI.update(id, editName.trim());
      setMessage('Category updated');
      setEditingId(null);
      setEditName('');
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Artworks using it must be changed first.')) return;
    try {
      setMessage('');
      await categoriesAPI.delete(id);
      setMessage('Category deleted');
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  return (
    <div className="admin-categories-container">
      <h1>Manage Categories</h1>
      <p className="admin-categories-desc">Control which categories appear for artworks. Artists and visitors will see these in filters and dropdowns.</p>

      {message && (
        <div className={`message ${message.includes('success') || message.includes('added') || message.includes('updated') || message.includes('deleted') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleCreate} className="add-category-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="category-input"
        />
        <button type="submit" className="submit-btn">Add Category</button>
      </form>

      <div className="categories-list">
        {categories.length === 0 ? (
          <p className="no-data">No categories yet. Add one above.</p>
        ) : (
          <ul>
            {categories.map((cat) => (
              <li key={cat._id} className="category-item">
                {editingId === cat._id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="category-input"
                      autoFocus
                    />
                    <button type="button" onClick={() => handleUpdate(cat._id)} className="save-btn">Save</button>
                    <button type="button" onClick={() => { setEditingId(null); setEditName(''); }} className="cancel-btn">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="category-name">{cat.name}</span>
                    <button type="button" onClick={() => { setEditingId(cat._id); setEditName(cat.name); }} className="edit-btn">Edit</button>
                    <button type="button" onClick={() => handleDelete(cat._id)} className="delete-btn">Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
