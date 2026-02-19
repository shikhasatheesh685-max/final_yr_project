import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  ensureAdmin: () => api.get('/auth/ensure-admin'),
};

// Artworks API
export const artworksAPI = {
  getAll: (params) => api.get('/artworks', { params }),
  getById: (id) => api.get(`/artworks/${id}`),
  create: (formData) => api.post('/artworks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/artworks/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/artworks/${id}`),
  getByArtist: (artistId) => api.get(`/artworks/artist/${artistId}`),
  getCategories: () => api.get('/artworks/categories/list'),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { orderStatus: status }),
  transfer: (id) => api.put(`/orders/${id}/transfer`),
  getArtistSales: () => api.get('/orders/artist/sales'),
  getSalesReport: () => api.get('/orders/admin/sales-report'),
};

// Transactions API (artist payout history)
export const transactionsAPI = {
  getMy: () => api.get('/transactions/my'),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getStats: () => api.get('/users/stats'),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  approve: (id) => api.put(`/users/${id}/approve`),
  reject: (id) => api.put(`/users/${id}/reject`),
  delete: (id) => api.delete(`/users/${id}`),
};

// Categories API (public list; admin CRUD)
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (name) => api.post('/categories', { name }),
  update: (id, name) => api.put(`/categories/${id}`, { name }),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Settings / Site content (public read for hero; admin full)
export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  getAll: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Auctions API (spec: create listing, set base price & duration, place bid, view bids, finalize)
export const auctionsAPI = {
  getAll: (params) => api.get('/auctions', { params }),
  getMy: () => api.get('/auctions/my'),
  getById: (id) => api.get(`/auctions/${id}`),
  create: (data) => api.post('/auctions', data),
  placeBid: (id, amount) => api.post(`/auctions/${id}/bids`, { amount }),
  getBids: (id) => api.get(`/auctions/${id}/bids`),
  finalize: (id) => api.put(`/auctions/${id}/finalize`),
};

export default api;
