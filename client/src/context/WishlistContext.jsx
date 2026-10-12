import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [], priceWatch: [] });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const { data } = await api.get('/wishlist');
        if (data.success && data.wishlist) {
          setWishlist(data.wishlist);
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      } finally {
        setLoading(false);
      }
    } else {
      setWishlist({ products: [], priceWatch: [] });
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) return false;
    try {
      const { data } = await api.post('/wishlist', { productId });
      if (data.success) {
        await fetchWishlist();
        return true;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return false;
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      if (data.success) {
        await fetchWishlist();
        return true;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.products?.some(p => (p._id || p) === productId);
  };

  const setPriceWatch = async (productId, targetPrice) => {
    if (!isAuthenticated) return false;
    try {
      const { data } = await api.post('/wishlist/price-watch', { productId, targetPrice });
      if (data.success) {
        await fetchWishlist();
        return true;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        setPriceWatch,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
