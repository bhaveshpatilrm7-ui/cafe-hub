import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cart, setCart] = useState({ items: [], subtotal: 0, discountAmount: 0, grandTotal: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, discountAmount: 0, grandTotal: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await API.get('/cart');
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1, options = {}) => {
    if (!user) {
      addToast('Please login to add items to your cart', 'info');
      return false;
    }
    try {
      const res = await API.post('/cart/items', {
        productId,
        quantity,
        size: options.size,
        sugarLevel: options.sugarLevel,
        addOns: options.addOns
      });
      if (res.data.success) {
        setCart(res.data.data);
        addToast('Item added to cart!', 'success');
        return true;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to add item to cart';
      addToast(errorMsg, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await API.put(`/cart/items/${itemId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      addToast('Error updating item quantity', 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await API.delete(`/cart/items/${itemId}`);
      if (res.data.success) {
        setCart(res.data.data);
        addToast('Item removed from cart', 'info');
      }
    } catch (err) {
      addToast('Error removing item', 'error');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await API.post('/cart/coupon', { code });
      if (res.data.success) {
        setCart(res.data.data);
        addToast(res.data.message || 'Coupon applied!', 'success');
        return true;
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await API.delete('/cart/coupon');
      if (res.data.success) {
        setCart(res.data.data);
        addToast('Coupon removed', 'info');
      }
    } catch (err) {
      addToast('Error removing coupon', 'error');
    }
  };

  const clearCart = async () => {
    try {
      const res = await API.delete('/cart/clear');
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Error clearing cart', err);
    }
  };

  const cartItemCount = cart.items ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartItemCount,
      addToCart,
      updateQuantity,
      removeItem,
      applyCoupon,
      removeCoupon,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
