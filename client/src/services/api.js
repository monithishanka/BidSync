import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  checkAuth: () => api.get('/auth/check')
};

// RFQ API
export const rfqAPI = {
  getAll: (params) => api.get('/rfq', { params }),
  getMy: (params) => api.get('/rfq/my', { params }),
  getCategories: () => api.get('/rfq/categories'),
  getTemplates: () => api.get('/rfq/templates'),
  getById: (id) => api.get(`/rfq/${id}`),
  create: (data) => api.post('/rfq', data),
  update: (id, data) => api.put(`/rfq/${id}`, data),
  delete: (id) => api.delete(`/rfq/${id}`),
  getBids: (id) => api.get(`/rfq/${id}/bids`),
  award: (id, data) => api.post(`/rfq/${id}/award`, data)
};

// Bid API
export const bidAPI = {
  getMyBids: (params) => api.get('/bid/my', { params }),
  getById: (id) => api.get(`/bid/${id}`),
  submit: (data) => api.post('/bid', data),
  update: (id, data) => api.put(`/bid/${id}`, data),
  withdraw: (id, data) => api.delete(`/bid/${id}`, { data }),
  cancel: (id) => api.delete(`/bid/${id}`)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  uploadKYC: (formData) => api.post('/user/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  searchVendors: (params) => api.get('/user/vendors', { params }),
  getVendorProfile: (id) => api.get(`/user/vendor/${id}`),
  rateVendor: (vendorId, data) => api.post(`/user/rate/${vendorId}`, data),
  changePassword: (data) => api.put('/user/password', data)
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`),
  rejectUser: (id, data) => api.put(`/admin/users/${id}/reject`, data),
  suspendUser: (id, data) => api.put(`/admin/users/${id}/suspend`, data),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  getKYCPending: () => api.get('/admin/kyc'),
  approveKYC: (userId, docIndex) => api.put(`/admin/kyc/${userId}/${docIndex}/approve`),
  rejectKYC: (userId, docIndex, data) => api.put(`/admin/kyc/${userId}/${docIndex}/reject`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  createAdmin: (data) => api.post('/admin/create', data)
};

export default api;
