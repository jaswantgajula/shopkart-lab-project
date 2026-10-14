import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart,
  LogIn,
  LogOut,
  Package,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (onLogout) onLogout();
      navigate('/login');
    }
  };

  const isActive = (path) => (
    path === '/products'
      ? location.pathname === path || location.pathname.startsWith('/products/')
      : location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  const navLink = (path) => `relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
    isActive(path)
      ? 'bg-blue-50 text-blue-700'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
  }`;

  const links = [
    { to: '/products', label: 'Discover', icon: Sparkles },
    ...(user?.role === 'admin' ? [{ to: '/admin/products', label: 'Admin', icon: ShieldCheck }] : []),
    { to: '/wishlist', label: 'Wishlist', icon: Heart, count: wishlistItems.length },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, count: cartCount },
    ...(user ? [{ to: '/orders', label: 'Orders', icon: Package }] : []),
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden sm:block bg-[#102b80] text-white">
        <div className="max-w-7xl mx-auto px-6 h-7 flex items-center justify-between text-[10px] font-bold tracking-[0.16em] uppercase">
          <span>Curated essentials for modern living</span>
          <span className="text-blue-200">Secure checkout · Thoughtful picks</span>
        </div>
      </div>

      <nav className="border-b border-white/80 bg-[#fbfaf7]/90 backdrop-blur-xl shadow-[0_6px_25px_rgba(15,23,42,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px] flex items-center gap-4">
          <Link to="/products" className="group flex items-center gap-3 shrink-0" aria-label="ShopKart home">
            <span className="relative w-10 h-10 rounded-[14px] bg-[#1746d2] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(23,70,210,0.28)] transition group-hover:-rotate-3 group-hover:scale-105">
              <ShoppingBag size={20} strokeWidth={2.4} />
              <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-[#ff7657] border-2 border-[#fbfaf7]" />
            </span>
            <span className="leading-none">
              <span className="block text-xl font-black tracking-[-0.04em] text-slate-950">ShopKart</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600 mt-1">Find your good</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 ml-6">
            {links.map(({ to, label, icon: Icon, count }) => (
              <Link key={to} to={to} className={navLink(to)}>
                <Icon size={16} />
                {label}
                {typeof count === 'number' && (
                  <span className={`min-w-5 h-5 px-1 rounded-full text-[10px] flex items-center justify-center font-black ${
                    count > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Link to="/home" className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 hover:border-blue-200 transition">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-black">
                    {(user.fullName || user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden xl:block max-w-32">
                    <span className="block text-[10px] text-slate-400">Welcome back</span>
                    <span className="block text-xs font-bold text-slate-800 truncate">{user.fullName || user.name || user.email}</span>
                  </span>
                </Link>
                <button onClick={handleLogout} title="Logout" className="sk-icon-button !shadow-sm !border-slate-200">
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-slate-700 px-3 py-2 hover:text-blue-700">
                  <LogIn size={16} /> Log in
                </Link>
                <Link to="/register" className="sk-btn-primary !px-4 !py-2.5">Join ShopKart</Link>
              </>
            )}
          </div>
        </div>

        <div className="lg:hidden max-w-7xl mx-auto px-3 pb-2 flex items-center gap-1 overflow-x-auto sk-no-scrollbar">
          {links.map(({ to, label, icon: Icon, count }) => (
            <Link key={to} to={to} className={`${navLink(to)} shrink-0 !px-3 !py-1.5 !text-xs`}>
              <Icon size={14} /> {label}
              {typeof count === 'number' && <span className="text-[10px] font-black">{count}</span>}
            </Link>
          ))}
          {user && (
            <Link to="/home" className={`${navLink('/home')} shrink-0 !px-3 !py-1.5 !text-xs`}>
              <UserRound size={14} /> Profile
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
