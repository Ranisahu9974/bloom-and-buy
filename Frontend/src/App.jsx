import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import WishlistPage from './pages/WishlistPage';
import { HelpCenterPage, ShippingInfoPage, ReturnsRefundsPage, ContactUsPage } from './pages/SupportPages';
import NotFoundPage from './pages/NotFoundPage';
import './index.css';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
    return (isAuthenticated && user) ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, isAdmin, loading } = useAuth();
    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
    if (!isAuthenticated || !user) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/" />;
    return children;
};

const SellerRoute = ({ children }) => {
    const { isAuthenticated, user, isSeller, loading } = useAuth();
    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
    if (!isAuthenticated || !user) return <Navigate to="/login" />;
    if (!isSeller) return <Navigate to="/" />;
    return children;
};

const AppContent = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <CartProvider>
            <div className="app-container">
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={(isAuthenticated && user) ? <Navigate to="/" /> : <LoginPage />} />
                        <Route path="/register" element={(isAuthenticated && user) ? <Navigate to="/" /> : <RegisterPage />} />
                        <Route path="/forgot-password" element={(isAuthenticated && user) ? <Navigate to="/" /> : <ForgotPasswordPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                        <Route path="/orders/tracking/:id" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/seller" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
                        <Route path="/help-center" element={<HelpCenterPage />} />
                        <Route path="/shipping-info" element={<ShippingInfoPage />} />
                        <Route path="/returns-refunds" element={<ReturnsRefundsPage />} />
                        <Route path="/contact-us" element={<ContactUsPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </main>
                <CartDrawer />
                <Chatbot />
                <Footer />
            </div>
        </CartProvider>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <ScrollToTop />
                <AppContent />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1a2235',
                            color: '#f1f5f9',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(10px)',
                        },
                        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                    }}
                />
            </AuthProvider>
        </Router>
    );
}

export default App;
