import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImage, handleProductImageError } from '../utils/productImage';

const Cart = () => {
  const {
    cartItems,
    loading,
    error,
    cartCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    refreshCart,
  } = useCart();

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Handle increasing quantity
  const handleIncrease = async (item) => {
    const productId = item.product?._id || item.product;
    const currentQty = item.quantity;
    const maxStock = item.product?.stock || 0;

    if (currentQty >= maxStock) {
      setActionError(`Cannot add more. Maximum available stock is ${maxStock}.`);
      return;
    }

    setActionError('');
    setUpdatingId(productId);
    try {
      await updateQuantity(productId, currentQty + 1);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle decreasing quantity
  const handleDecrease = async (item) => {
    const productId = item.product?._id || item.product;
    const currentQty = item.quantity;

    if (currentQty <= 1) {
      return;
    }

    setActionError('');
    setUpdatingId(productId);
    try {
      await updateQuantity(productId, currentQty - 1);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle removing item
  const handleRemove = async (productId) => {
    setActionError('');
    setRemovingId(productId);
    try {
      await removeFromCart(productId);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your cart...</p>
      </div>
    );
  }

  // 2. Error State
  if (error && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load your cart.</h2>
        <p className="text-gray-600 text-sm mb-5">{error}</p>
        <button
          onClick={refreshCart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 3. Empty State
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-14 sk-card p-10 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-4xl rotate-3">🛒</div>
        <span className="sk-section-label">Your shopping bag</span>
        <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 mt-3 mb-2">Your cart is craving company</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-7">
          Looks like you haven't added anything to your cart yet. Explore our products and find great deals!
        </p>
        <Link
          to="/products"
          className="sk-btn-primary"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 pb-10">
      {/* Title */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-end justify-between gap-4 rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-[#102b80] to-[#1746d2] text-white p-7 sm:p-9 mb-7 shadow-[0_20px_55px_rgba(15,43,128,0.2)]">
        <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/10" />
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-200">Almost yours</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] mt-2">Your cart</h1>
          <p className="text-sm text-blue-100 mt-2">
            {cartItems.length} unique item{cartItems.length > 1 ? 's' : ''} ({cartCount} total units)
          </p>
        </div>
        <Link
          to="/products"
          className="relative self-start sm:self-auto rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20 transition"
        >
          ← Continue Shopping
        </Link>
      </div>

      {/* Global Action Error Alert */}
      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError('')}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Grid: Cart Items (Left) + Order Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = item.product || {};
            const productId = product._id || item.product;
            const isItemUpdating = updatingId === productId;
            const isItemRemoving = removingId === productId;
            const itemTotal = (product.price || 0) * (item.quantity || 0);

            return (
              <div
                key={productId}
                className="sk-card !rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* Product Image & Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(event) => handleProductImageError(event, product)}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${productId}`}
                      className="text-base font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
                    >
                      {product.name || 'Unnamed Product'}
                    </Link>
                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                    <div className="text-sm font-bold text-gray-900">
                      ₹{Number(product.price || 0).toLocaleString('en-IN')}
                    </div>
                    {product.stock <= 5 && product.stock > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Only {product.stock} left in stock!
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                  {/* Quantity Stepper: [-] qty [+] */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      onClick={() => handleDecrease(item)}
                      disabled={isItemUpdating || item.quantity <= 1}
                      title="Decrease Quantity"
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-colors"
                    >
                      −
                    </button>

                    <span className="px-3 py-1.5 text-sm font-semibold text-gray-800 min-w-[2.5rem] text-center bg-white">
                      {isItemUpdating ? '...' : item.quantity}
                    </span>

                    <button
                      onClick={() => handleIncrease(item)}
                      disabled={isItemUpdating || item.quantity >= (product.stock || 0)}
                      title="Increase Quantity"
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Subtotal Price */}
                  <div className="text-right">
                    <div className="text-base font-bold text-blue-600">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </div>
                    <button
                      onClick={() => handleRemove(productId)}
                      disabled={isItemRemoving}
                      className="text-xs text-red-500 hover:text-red-700 underline mt-1 disabled:opacity-50"
                    >
                      {isItemRemoving ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary (Right Column) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] sticky top-32">
          <div className="absolute -right-12 -top-16 w-44 h-44 rounded-full bg-blue-600/20" />
          <h2 className="relative text-lg font-black pb-3 border-b border-white/10 mb-4">
            Order Summary
          </h2>

          <div className="relative space-y-3 text-sm text-slate-300 mb-6">
            <div className="flex justify-between">
              <span>Total Units</span>
              <span className="font-semibold text-white">{cartCount}</span>
            </div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Shipping</span>
              <span className="font-semibold">FREE</span>
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-between text-base font-bold text-white">
              <span>Order Total</span>
              <span className="text-blue-600">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="relative w-full bg-[#ff7657] hover:bg-[#ff6543] text-white font-black py-3 px-4 rounded-xl shadow-[0_10px_25px_rgba(255,118,87,0.25)] transition text-center text-sm"
          >
            Proceed to Checkout
          </Link>

          <p className="text-xs text-slate-500 text-center mt-3">
            🔒 Safe & Secure Checkout
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
