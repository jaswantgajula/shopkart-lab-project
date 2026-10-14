import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  addToWishlist as apiAddToWishlist,
  getWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children, user }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getWishlist();
      setWishlistItems(data.wishlist || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    setError('');
    try {
      const data = await apiAddToWishlist(productId);
      setWishlistItems(data.wishlist || []);
      return data;
    } catch (err) {
      if (err.response?.status === 409) {
        const data = await getWishlist();
        setWishlistItems(data.wishlist || []);
        return data;
      }
      setError(err.response?.data?.error || 'Failed to add product to wishlist');
      throw err;
    }
  };

  const removeFromWishlist = async (productId) => {
    setError('');
    try {
      const data = await apiRemoveFromWishlist(productId);
      setWishlistItems(data.wishlist || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove product from wishlist');
      throw err;
    }
  };

  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((item) => item._id)),
    [wishlistItems],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistIds,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside WishlistProvider');
  }
  return context;
};
