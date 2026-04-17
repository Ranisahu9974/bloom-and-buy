import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (window.location.host.includes('vercel.app') ? '/api' : 'http://localhost:8000/api');

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses and malformed data
api.interceptors.response.use(
    (response) => {
        // Safety check: If the response is HTML (common fallback for static proxy errors), 
        // treat it as an error to prevent the app from trying to process HTML as JSON.
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('text/html') && typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            return Promise.reject({
                message: 'Received HTML instead of JSON. This usually indicates a backend URL configuration error.',
                response
            });
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.clear();
            localStorage.clear();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/users/register/', data),
    login: (data) => api.post('/token/', { username: data.email, password: data.password }),
    googleLogin: (data) => api.post('/users/google/', data),
    subscribe: (data) => api.post('/users/subscribe/', data),
    getProfile: () => api.get('/users/me/'),
    updateProfile: (data) => api.put('/users/me/', data),
    getAddresses: () => api.get('/users/addresses/'),
    addAddress: (data) => api.post('/users/addresses/', data),
    deleteAddress: (id) => api.delete(`/users/addresses/${id}/`),
    getNotifications: () => api.get('/users/notifications/'),
    markNotificationRead: (id) => api.post(`/users/notifications/${id}/read/`),
    getAnnouncements: () => api.get('/users/announcements/'),
};

// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products/', { params }),
    getById: (id) => api.get(`/products/${id}/`),
    getRelated: (id) => api.get(`/products/${id}/related/`),
    getCategories: () => api.get('/products/categories/'),
    getRecommendations: () => api.get('/products/recommendations/'),
    getStats: () => api.get('/products/stats/'),
    getBanners: () => api.get('/products/recent/'),
};

// Reviews API
export const reviewsAPI = {
    getForProduct: (productId) => api.get(`/products/${productId}/reviews/`),
    add: (productId, data) => api.post(`/products/${productId}/reviews/`, data),
};

// Discounts / Coupons API
export const discountsAPI = {
    validate: (code, subtotal) => api.post('/discounts/validate/', { code, subtotal }),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart/'),
    add: (productId, quantity = 1) => api.post('/add-to-cart/', { product_id: productId, quantity }),
    update: (productId, quantity) => api.put('/cart/update/', { product_id: productId, quantity }),
    remove: (productId) => api.delete(`/cart/remove/${productId}/`),
    clear: () => api.delete('/cart/clear/'),
};

// Orders API
export const ordersAPI = {
    checkout: (data) => api.post('/orders/checkout/', data),
    getAll: (page = 1) => api.get(`/orders/my-orders/?page=${page}`),
    getById: (id) => api.get(`/orders/${id}/`),
    track: (id) => api.get(`/orders/track/${id}/`),
    downloadInvoice: (id) => `${API_BASE}/orders/invoice/${id}/`,
};

// Payment API (Razorpay)
export const paymentAPI = {
    verify: (data) => api.post('/orders/verify-payment/', data),
};

// AI Features API
export const aiAPI = {
    chatbot: (query) => api.post('/ai/chatbot/', { query }),
    recommendations: (userId) => api.get(`/ai/recommendations/${userId}/`),
};

// Admin API
export const adminAPI = {
    getSummary: () => api.get('/admin/summary'),
    getOrders: (params) => api.get('/admin/orders', { params }),
    getOrderDetail: (id) => api.get(`/admin/orders/${id}`),
    updateOrderStatus: (id, data) => api.patch(`/orders/update-status/${id}/`, data),
    getInventory: (params) => api.get('/admin/inventory', { params }),
    getModerationProducts: (params) => api.get('/admin/products/moderation', { params }),
    moderateProduct: (id, data) => api.put(`/admin/products/${id}/moderate`, data),
    overrideProduct: (id, data) => api.put(`/admin/products/${id}/override`, data),
    getUsers: () => api.get('/admin/users'),
    getUserDetail: (id) => api.get(`/admin/users/${id}`),
    toggleUser: (id) => api.post(`/admin/users/${id}/toggle`),
    getSellers: () => api.get('/admin/sellers'),
    getSellerDetail: (id) => api.get(`/admin/sellers/${id}`),
    toggleSeller: (id) => api.post(`/admin/sellers/${id}/toggle`),
    getNotifications: () => api.get('/admin/notifications'),
    markNotificationRead: (id) => api.post(`/admin/notifications/${id}/read`),
    sendNotification: (data) => api.post('/admin/notifications/send', data),
    sendPromotion: (data) => api.post('/admin/promotions/send', data),
    getAnnouncements: () => api.get('/users/announcements/'),
    deleteAnnouncement: (id) => api.delete(`/users/announcements/${id}/`),
};

// Seller API
export const sellerAPI = {
    getDashboard: () => api.get('/seller/dashboard/'),
    getAnalytics: () => api.get('/seller/analytics/'),
    getProducts: (params) => api.get('/seller/products/', { params }),
    addProduct: (formData) => api.post('/seller/products/', formData),
    updateProduct: (id, formData) => api.put(`/seller/products/${id}/`, formData),
    deleteProduct: (id) => api.delete(`/seller/products/${id}/`),
    getOrders: (params) => api.get('/seller/orders/', { params }),
    getNotifications: () => api.get('/seller/notifications/'),
    markNotificationRead: (id) => api.put(`/seller/notifications/${id}/read/`),
    updateOrderStatus: (id, data) => api.patch(`/orders/update-status/${id}/`, data),
};

// Wishlist API
export const wishlistAPI = {
    get: () => api.get('/wishlist/'),
    add: (productId) => api.post(`/wishlist/${productId}/`),
    remove: (productId) => api.delete(`/wishlist/${productId}/`),
};

export default api;
