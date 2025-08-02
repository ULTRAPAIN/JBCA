import axios from 'axios';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
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

// Response interceptor to handle common responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
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

// Export the base api instance for services that need direct access
export default api;

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Products APIs
export const productsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/products?${queryParams}`);
  },
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getPrice: (id) => api.get(`/products/${id}/price`),
  getBulkPrices: (productIds) => api.post('/products/bulk-prices', { productIds }),
};

// Orders APIs
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/orders/my-orders?${queryParams}`);
  },
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  checkDelivery: (pincode) => api.get(`/orders/check-delivery/${pincode}`),
};

// Admin APIs
export const adminAPI = {
  // Products
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Orders
  getAllOrders: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/admin/orders?${queryParams}`);
  },
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  updateOrder: (id, orderData) => api.put(`/admin/orders/${id}`, orderData),
  
  // Users
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${queryParams}`);
  },
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  
  // Delivery Zones
  getDeliveryZones: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/admin/delivery-zones?${queryParams}`);
  },
  createDeliveryZone: (zoneData) => api.post('/admin/delivery-zones', zoneData),
  updateDeliveryZone: (id, zoneData) => api.put(`/admin/delivery-zones/${id}`, zoneData),
  deleteDeliveryZone: (id) => api.delete(`/admin/delivery-zones/${id}`),
  
  // Dashboard
  getDashboard: (period = '30') => api.get(`/admin/dashboard?period=${period}`),
  getStats: () => api.get('/admin/stats'),
  getRecentOrders: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/admin/orders/recent?${queryParams}`);
  },
};

// Delivery Zones APIs for public access
export const deliveryZonesAPI = {
  getAll: () => api.get('/delivery-zones'),
  getById: (id) => api.get(`/delivery-zones/${id}`),
  checkDelivery: (pincode) => api.get(`/delivery-zones/check/${pincode}`),
};
