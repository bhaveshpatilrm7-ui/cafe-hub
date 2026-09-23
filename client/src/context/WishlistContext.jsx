import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const res = await API.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching wishlist', err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) {
      addToast('Please login to save products to your wishlist', 'info');
      return;
    }
    const productId = typeof product === 'string' ? product : product._id;
    const exists = wishlist.some(p => (p._id || p) === productId);

    try {
      if (exists) {
        const res = await API.delete(`/wishlist/${productId}`);
        if (res.data.success) {
          setWishlist(res.data.data);
          addToast('Removed from wishlist', 'info');
        }
      } else {
        const res = await API.post(`/wishlist/${productId}`);
        if (res.data.success) {
          setWishlist(res.data.data);
          addToast('Saved to wishlist!', 'success');
        }
      }
    } catch (err) {
      addToast('Failed to update wishlist', 'error');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => (p._id || p) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
