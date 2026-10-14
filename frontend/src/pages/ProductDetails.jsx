import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  LoaderCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductImage, handleProductImageError } from '../utils/productImage';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistIds, addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToast, setAddedToast] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProductById(id);
        if (active) setProduct(data.product || data);
      } catch (err) {
        if (active) setError(err.response?.status === 404 ? 'Product not found.' : err.response?.data?.error || 'Failed to load product details.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProduct();
    return () => { active = false; };
  }, [id]);

  const handleAddToCart = async () => {
    setAddingCart(true);
    setActionError('');
    try {
      await addToCart(id);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2600);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else setActionError(err.response?.data?.error || 'Failed to add product to cart');
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlist = async () => {
    setSavingWishlist(true);
    setActionError('');
    try {
      if (wishlistIds.has(id)) await removeFromWishlist(id);
      else await addToWishlist(id);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else setActionError(err.response?.data?.error || 'Failed to update wishlist');
    } finally {
      setSavingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        <div className="h-[520px] rounded-[2rem] bg-slate-200" />
        <div className="py-8 space-y-5"><div className="h-4 w-24 bg-slate-200 rounded" /><div className="h-12 w-4/5 bg-slate-200 rounded" /><div className="h-7 w-32 bg-slate-200 rounded" /><div className="h-28 bg-slate-100 rounded" /></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto my-14 sk-card p-10 text-center">
        <p className="text-5xl mb-4">◌</p>
        <h2 className="text-2xl font-black text-slate-900">This product slipped away</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">{error || 'Something went wrong.'}</p>
        <Link to="/products" className="sk-btn-primary"><ArrowLeft size={16} /> Back to collection</Link>
      </div>
    );
  }

  const { name, description, price, category, stock } = product;
  const isWishlisted = wishlistIds.has(id);

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-5 sk-rise">
      <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-700 transition">
        <ArrowLeft size={15} /> Back to the collection
      </Link>

      {addedToast && (
        <div className="fixed z-[60] right-5 top-28 max-w-sm rounded-2xl bg-slate-950 text-white p-4 shadow-2xl flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={18} /></span>
          <span><strong className="block text-sm">Added to your cart</strong><small className="text-slate-300">{name} is ready for checkout.</small></span>
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_70px_rgba(15,23,42,0.1)] grid grid-cols-1 md:grid-cols-2">
        <div className="relative min-h-[420px] md:min-h-[610px] bg-[#ebe8df] overflow-hidden">
          <img
            src={getProductImage(product)}
            alt={name}
            onError={(event) => handleProductImageError(event, product)}
            className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
          <span className="absolute left-5 top-5 rounded-full border border-white bg-white/85 backdrop-blur px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-800">
            {category}
          </span>
          <span className="absolute left-5 bottom-5 rounded-xl bg-slate-950/75 text-white backdrop-blur px-4 py-3 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span><strong className="block text-xs">{stock > 0 ? 'Available now' : 'Currently unavailable'}</strong><small className="text-[10px] text-slate-300">{stock > 0 ? `${stock} pieces in stock` : 'Check back soon'}</small></span>
          </span>
        </div>

        <div className="p-7 sm:p-10 lg:p-12 flex flex-col">
          <span className="sk-section-label">A ShopKart pick</span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black leading-[1.02] tracking-[-0.055em] text-slate-950">{name}</h1>
          <div className="mt-5 flex items-end gap-2">
            <p className="text-3xl font-black tracking-[-0.04em] text-blue-700">₹{Number(price).toLocaleString('en-IN')}</p>
            <span className="text-xs text-slate-400 pb-1">inclusive of taxes</span>
          </div>

          <div className="mt-7 border-y border-slate-100 py-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400 mb-2">Why it made the edit</p>
            <p className="text-sm sm:text-base leading-7 text-slate-600">{description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            {[
              [Truck, 'Thoughtful', 'delivery'],
              [ShieldCheck, 'Secure', 'checkout'],
              [PackageCheck, 'Stock', 'verified'],
            ].map(([Icon, top, bottom]) => (
              <div key={top} className="rounded-xl bg-slate-50 p-3 text-center">
                <Icon size={18} className="mx-auto text-blue-700 mb-2" />
                <strong className="block text-[11px] text-slate-800">{top}</strong>
                <small className="text-[10px] text-slate-400">{bottom}</small>
              </div>
            ))}
          </div>

          {actionError && <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-600">{actionError}</div>}

          <div className="mt-auto pt-7 flex flex-col sm:flex-row gap-3">
            <button onClick={handleAddToCart} disabled={addingCart || stock <= 0} className="sk-btn-primary flex-1 !py-3.5">
              {addingCart ? <><LoaderCircle size={18} className="animate-spin" /> Adding...</> : stock > 0 ? <><ShoppingCart size={18} /> Add to cart</> : 'Currently unavailable'}
            </button>
            <button
              onClick={handleWishlist}
              disabled={savingWishlist}
              className={`h-12 sm:h-auto px-5 rounded-xl border inline-flex items-center justify-center gap-2 text-sm font-bold transition ${isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-700 hover:border-rose-200 hover:text-rose-600'}`}
            >
              {savingWishlist ? <LoaderCircle size={18} className="animate-spin" /> : <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />}
              {isWishlisted ? 'Saved' : 'Save'}
            </button>
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles size={12} /> Your cart is rechecked before payment
          </p>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
