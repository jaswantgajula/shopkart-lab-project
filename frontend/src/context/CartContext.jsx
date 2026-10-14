import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart whenever the logged-in user changes
  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCartItems(data.cart || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Add product to cart
  const addToCart = async (productId) => {
    setError(null);
    try {
      const data = await apiAddToCart(productId);
      setCartItems(data.cart || []);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to add item to cart';
      setError(errMsg);
      throw err;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    setError(null);
    try {
      const data = await apiUpdateCartQuantity(productId, quantity);
      setCartItems(data.cart || []);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update quantity';
      setError(errMsg);
      throw err;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setError(null);
    try {
      const data = await apiRemoveFromCart(productId);
      setCartItems(data.cart || []);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to remove item';
      setError(errMsg);
      throw err;
    }
  };

  // Derived values (computed directly from cartItems state)
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.product?.price || 0;
    return total + itemPrice * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart: fetchCart,
        clearCart: () => setCartItems([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
