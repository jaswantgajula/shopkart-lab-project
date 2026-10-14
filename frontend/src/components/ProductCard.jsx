import React, { useState } from 'react';
import { ArrowUpRight, Heart, LoaderCircle, Plus, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductImage, handleProductImageError } from '../utils/productImage';

const ProductCard = ({ product }) => {
  const { _id, name, price, category, stock, description } = product;
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  const { wishlistIds, addToWishlist, removeFromWishlist } = useWishlist();
  const [wishlistStatus, setWishlistStatus] = useState('idle');
  const [cartStatus, setCartStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isInCart = cartItems.some((item) => (item.product?._id || item.product) === _id);
  const isWishlisted = wishlistIds.has(_id);

  const handleAddToWishlist = async () => {
    if (wishlistStatus === 'saving') return;
    setWishlistStatus('saving');
    setErrorMessage('');

    try {
      if (isWishlisted) await removeFromWishlist(_id);
      else await addToWishlist(_id);
      setWishlistStatus('idle');
    } catch (err) {
      setWishlistStatus('idle');
      if (err.response?.status === 401) {
        setErrorMessage('Sign in to save favorites');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setErrorMessage(err.response?.data?.error || 'Could not update wishlist');
      }
    }
  };

  const handleAddToCart = async () => {
    if (cartStatus === 'adding' || stock <= 0) return;
    setCartStatus('adding');
    setErrorMessage('');

    try {
      await addToCart(_id);
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage('Sign in to add items');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setErrorMessage(err.response?.data?.error || 'Could not add to cart');
      }
    } finally {
      setCartStatus('idle');
    }
  };

  return (
    <article className="sk-product-card h-full flex flex-col">
      <div className="relative h-60 overflow-hidden bg-[#edeae3]">
        <Link to={`/products/${_id}`} aria-label={`View ${name}`}>
          <img
            src={getProductImage(product)}
            alt={name}
            loading="lazy"
            onError={(event) => handleProductImageError(event, product)}
            className="sk-product-image h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
        </Link>

        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-700 backdrop-blur-md">
          {category}
        </span>
        <button
          type="button"
          onClick={handleAddToWishlist}
          disabled={wishlistStatus === 'saving'}
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={isWishlisted}
          className={`absolute right-3 top-3 sk-icon-button ${isWishlisted ? '!bg-rose-500 !text-white !border-rose-400' : ''}`}
        >
          {wishlistStatus === 'saving' ? <LoaderCircle size={17} className="animate-spin" /> : <Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} />}
        </button>

        <span className={`absolute left-3 bottom-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold backdrop-blur-md ${
          stock > 0 ? 'bg-slate-950/75 text-white' : 'bg-red-600/90 text-white'
        }`}>
          {stock > 0 && <span className="sk-status-dot !h-1.5 !w-1.5 !shadow-none" />}
          {stock > 0 ? `${stock} ready to ship` : 'Currently unavailable'}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <Link to={`/products/${_id}`} className="group/title inline-flex items-start gap-1.5">
            <h3 className="text-lg font-black leading-tight tracking-[-0.02em] text-slate-900 group-hover/title:text-blue-700 transition">
              {name}
            </h3>
            <ArrowUpRight size={15} className="mt-1 text-slate-300 group-hover/title:text-blue-600 transition" />
          </Link>
          <p className="mt-2 text-xs leading-5 text-slate-500 line-clamp-2">{description || 'A thoughtfully selected ShopKart essential.'}</p>
        </div>

        {errorMessage && (
          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your price</p>
            <p className="text-xl font-black tracking-[-0.03em] text-slate-950">₹{Number(price).toLocaleString('en-IN')}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartStatus === 'adding' || stock <= 0}
            className={`h-11 rounded-xl px-4 inline-flex items-center justify-center gap-2 text-xs font-bold transition ${
              stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#1746d2] hover:bg-[#103bb7] text-white shadow-[0_8px_20px_rgba(23,70,210,0.2)] hover:-translate-y-0.5'
            }`}
          >
            {cartStatus === 'adding' ? (
              <><LoaderCircle size={15} className="animate-spin" /> Adding</>
            ) : isInCart ? (
              <><Plus size={15} /> Add one</>
            ) : (
              <><ShoppingCart size={15} /> Add to cart</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
