import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ items: [] });
    const [subtotal, setSubtotal] = useState(0);
    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart({ items: [] });
            setSubtotal(0);
            setItemCount(0);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data } = await cartAPI.get();
            setCart(data.cart);
            setSubtotal(data.subtotal);
            setItemCount(data.itemCount);
        } catch (error) {
            console.error('Fetch cart error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        const { data } = await cartAPI.add(productId, quantity);
        await fetchCart();
        return data;
    };

    const updateQuantity = async (productId, quantity) => {
        await cartAPI.update(productId, quantity);
        await fetchCart();
    };

    const removeFromCart = async (productId) => {
        await cartAPI.remove(productId);
        await fetchCart();
    };

    const clearCart = async () => {
        await cartAPI.clear();
        setCart({ items: [] });
        setSubtotal(0);
        setItemCount(0);
    };

    return (
        <CartContext.Provider value={{
            cart, subtotal, itemCount, loading,
            addToCart, updateQuantity, removeFromCart, clearCart, fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
