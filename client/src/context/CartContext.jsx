import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  // Load server cart or guest cart
  const refreshCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const { data } = await api.get('/cart');
        if (data.success && data.cart) {
          setCart(data.cart);
        }
      } catch (err) {
        console.error('Failed to load server cart', err);
      } finally {
        setLoading(false);
      }
    } else {
      // LocalStorage guest cart
      const saved = localStorage.getItem('smartcart_guest_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCart(parsed);
        } catch {
          setCart({ items: [], subtotal: 0, itemCount: 0 });
        }
      }
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  // Sync guest cart to server on login
  useEffect(() => {
    const syncGuestItems = async () => {
      if (isAuthenticated) {
        const saved = localStorage.getItem('smartcart_guest_cart');
        if (saved) {
          try {
            const guestCart = JSON.parse(saved);
            if (guestCart.items && guestCart.items.length > 0) {
              const formatted = guestCart.items.map(i => ({
                productId: i.product?._id || i.product,
                quantity: i.quantity,
              }));
              await api.post('/cart/sync', { guestItems: formatted });
              localStorage.removeItem('smartcart_guest_cart');
              await refreshCart();
            }
          } catch (e) {
            console.error('Error syncing guest cart', e);
          }
        }
      }
    };
    syncGuestItems();
  }, [isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      const { data } = await api.post('/cart/items', {
        productId: product._id,
        quantity,
      });
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } else {
      // Local guest cart update
      const existing = [...cart.items];
      const index = existing.findIndex(i => (i.product?._id || i.product) === product._id);
      if (index > -1) {
        existing[index].quantity += quantity;
      } else {
        existing.push({
          _id: `guest-${Date.now()}-${Math.random()}`,
          product,
          quantity,
          priceAtAdd: product.price,
        });
      }
      const subtotal = existing.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0);
      const itemCount = existing.reduce((acc, i) => acc + i.quantity, 0);
      const newCart = { items: existing, subtotal, itemCount };
      setCart(newCart);
      localStorage.setItem('smartcart_guest_cart', JSON.stringify(newCart));
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (isAuthenticated) {
      const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } else {
      const existing = cart.items.map(i => {
        if (i._id === itemId) return { ...i, quantity };
        return i;
      });
      const subtotal = existing.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0);
      const itemCount = existing.reduce((acc, i) => acc + i.quantity, 0);
      const newCart = { items: existing, subtotal, itemCount };
      setCart(newCart);
      localStorage.setItem('smartcart_guest_cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } else {
      const existing = cart.items.filter(i => i._id !== itemId);
      const subtotal = existing.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0);
      const itemCount = existing.reduce((acc, i) => acc + i.quantity, 0);
      const newCart = { items: existing, subtotal, itemCount };
      setCart(newCart);
      localStorage.setItem('smartcart_guest_cart', JSON.stringify(newCart));
    }
  };

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, itemCount: 0 });
    localStorage.removeItem('smartcart_guest_cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
