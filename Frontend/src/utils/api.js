import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    getProfile: () => api.get('/users/me'),
    updateProfile: (data) => api.put('/users/me', data),
    getOrderHistory: (page = 1) => api.get(`/users/me/orders?page=${page}`),
};

// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
    update: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
    remove: (productId) => api.delete(`/cart/remove/${productId}`),
    clear: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
    checkout: (data) => api.post('/orders/checkout', data),
    getAll: (page = 1) => api.get(`/orders?page=${page}`),
    getById: (id) => api.get(`/orders/${id}`),
    track: (id) => api.get(`/orders/${id}/track`),
};

// Reviews API
export const reviewsAPI = {
    getByProduct: (productId, page = 1) => api.get(`/reviews/product/${productId}?page=${page}`),
    create: (data) => api.post('/reviews', data),
};

// Discounts API
export const discountsAPI = {
    validate: (code, subtotal) => api.post('/discounts/validate', { code, subtotal }),
    getAll: () => api.get('/discounts'),
    create: (data) => api.post('/discounts', data),
    update: (id, data) => api.put(`/discounts/${id}`, data),
    delete: (id) => api.delete(`/discounts/${id}`),
};

// Membership API
export const membershipAPI = {
    get: () => api.get('/membership'),
    getDetails: () => api.get('/membership'),
};

// Pay Later API
export const payLaterAPI = {
    checkEligibility: (amount) => api.post('/paylater/check-eligibility', { amount }),
    getPlans: () => api.get('/paylater/plans'),
};

// Admin API
export const adminAPI = {
    getSummary: () => api.get('/admin/summary'),
    getInventory: (params) => api.get('/admin/inventory', { params }),
    getOrders: (params) => api.get('/admin/orders', { params }),
    updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
    getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
    getDiscountPerformance: () => api.get('/admin/discount-performance'),
    overrideProduct: (id, data) => api.put(`/admin/products/${id}/override`, data),
    getFlaggedReviews: () => api.get('/admin/flagged-reviews'),
    // Seller management
    createSeller: (data) => api.post('/admin/sellers', data),
    getSellers: (params) => api.get('/admin/sellers', { params }),
    getSellerDetail: (id) => api.get(`/admin/sellers/${id}`),
    toggleSeller: (id) => api.put(`/admin/sellers/${id}/toggle`),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),
};

// Seller API
export const sellerAPI = {
    getDashboard: () => api.get('/seller/dashboard'),
    getProfile: () => api.get('/seller/profile'),
    updateProfile: (data) => api.put('/seller/profile', data),
    getProducts: (params) => api.get('/seller/products', { params }),
    addProduct: (data) => api.post('/seller/products', data),
    updateProduct: (id, data) => api.put(`/seller/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/seller/products/${id}`),
    getOrders: (params) => api.get('/seller/orders', { params }),
};

export default api;
