import React, { useState } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import WishlistCard from '../components/WishlistCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const {
    wishlistItems,
    loading,
    error,
    removeFromWishlist,
    refreshWishlist,
  } = useWishlist();
  const { cartItems, addToCart } = useCart();
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    setActionError('');
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to remove product from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId) => {
    setAddingId(productId);
    setActionError('');
    try {
      await addToCart(productId);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to add product to cart');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-[420px] rounded-[1.4rem] bg-white border border-white shadow-sm" />)}
      </div>
    );
  }

  if (error && !wishlistItems.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load your wishlist</h2>
        <p className="text-gray-600 text-sm mb-5">{error}</p>
        <button onClick={refreshWishlist} className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded">
          Try Again
        </button>
      </div>
    );
  }

  if (!wishlistItems.length) {
    return (
      <div className="max-w-xl mx-auto my-14 sk-card p-10 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-[1.5rem] bg-rose-50 text-rose-500 flex items-center justify-center rotate-3">
          <Heart size={36} />
        </div>
        <span className="sk-section-label">Your saved edit</span>
        <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 mt-3 mb-2">Nothing saved—yet.</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-7">Tap the heart on anything that catches your eye. Your personal shortlist will live right here.</p>
        <Link to="/products" className="sk-btn-primary">
          Discover products <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-10">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#3b145f] via-[#6d1f78] to-[#d94f70] p-7 sm:p-9 text-white shadow-[0_20px_55px_rgba(83,31,105,0.2)]">
        <div className="absolute -right-12 -top-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-200">Saved for later</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] mt-2">Things you love</h1>
            <p className="text-sm text-rose-100 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'product' : 'products'} saved
            </p>
          </div>
          <Link to="/products" className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm font-bold hover:bg-white/20 transition">Keep exploring <ArrowRight size={16} /></Link>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{actionError}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
            onAddToCart={handleAddToCart}
            isRemoving={removingId === product._id}
            isAdding={addingId === product._id}
            isInCart={cartItems.some((item) => (item.product?._id || item.product) === product._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
