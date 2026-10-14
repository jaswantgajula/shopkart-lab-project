import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeIndianRupee,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { getOrders } from '../services/api';
import { getProductImage, handleProductImageError } from '../utils/productImage';

const statusStyles = {
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700 ring-amber-200',
  PLACED: 'bg-blue-50 text-blue-700 ring-blue-200',
  CONFIRMED: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  SHIPPED: 'bg-violet-50 text-violet-700 ring-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const summary = useMemo(() => ({
    total: orders.length,
    active: orders.filter((order) => !['DELIVERED', 'PENDING_PAYMENT'].includes(order.status)).length,
    spent: orders
      .filter((order) => order.paymentStatus === 'PAID')
      .reduce((total, order) => total + Number(order.totalAmount || 0), 0),
  }), [orders]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-6 space-y-5 animate-pulse">
        <div className="h-48 rounded-2xl bg-slate-200" />
        {[1, 2].map((item) => (
          <div key={item} className="h-64 rounded-2xl bg-white border border-slate-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto my-14 text-center bg-white border border-red-100 rounded-2xl p-9 shadow-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <RefreshCw size={25} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Could not load your orders</h1>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button onClick={loadOrders} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
          Try Again
        </button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="max-w-xl mx-auto my-14 text-center bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center rotate-3">
          <Package size={38} />
        </div>
        <p className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase mb-2">Your purchases</p>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">No orders yet</h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-7">
          When you place an order, you can track its status and view every purchased item here.
        </p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm">
          Explore Products <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-7">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-28 w-48 h-48 rounded-full bg-blue-400/10" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] uppercase text-blue-200 mb-2">Purchase history</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">My Orders</h1>
              <p className="text-sm text-blue-100/80 mt-2">Review purchases, payment details, and delivery progress.</p>
            </div>
            <Link to="/products" className="self-start sm:self-auto inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm">
              <ShoppingBag size={16} /> Shop again
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><Package size={20} /></div>
              <div><p className="text-2xl font-bold leading-none">{summary.total}</p><p className="text-xs text-blue-100 mt-1">Total orders</p></div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><Clock3 size={20} /></div>
              <div><p className="text-2xl font-bold leading-none">{summary.active}</p><p className="text-xs text-blue-100 mt-1">Active orders</p></div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><BadgeIndianRupee size={20} /></div>
              <div><p className="text-xl font-bold leading-none">{formatCurrency(summary.spent)}</p><p className="text-xs text-blue-100 mt-1">Total purchased</p></div>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">Newest purchases are shown first</p>
          </div>
          <button onClick={loadOrders} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3 py-2 rounded-lg">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {orders.map((order) => {
          const visibleItems = order.items.slice(0, 3);
          const extraItems = order.items.length - visibleItems.length;
          const itemCount = order.items.reduce((count, item) => count + item.quantity, 0);
          const address = order.shippingAddress;

          return (
            <article key={order._id} className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Package size={21} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">Order #{order._id.slice(-8).toUpperCase()}</h3>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 ring-inset ${statusStyles[order.status] || statusStyles.PLACED}`}>
                          {order.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <CalendarDays size={13} />
                        {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-slate-500">Order total</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-5">
                  <div className="lg:col-span-2 space-y-3">
                    {visibleItems.map((item) => (
                      <div key={`${order._id}-${item.product}`} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            onError={(event) => handleProductImageError(event, item)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">Qty {item.quantity} · {formatCurrency(item.price)} each</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    {extraItems > 0 && <p className="text-xs text-slate-500 pl-1">+ {extraItems} more item{extraItems > 1 ? 's' : ''}</p>}
                  </div>

                  <div className="lg:border-l lg:border-slate-100 lg:pl-6 space-y-4">
                    <div>
                      <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">Delivering to</p>
                      <p className="flex items-start gap-2 text-sm text-slate-700">
                        <MapPin size={15} className="text-blue-600 mt-0.5 shrink-0" />
                        <span><strong>{address?.fullName}</strong><br /><span className="text-slate-500">{address?.city}, {address?.state} · {address?.pincode}</span></span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">Payment</p>
                      <p className={`inline-flex items-center gap-1.5 text-xs font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {order.paymentStatus === 'PAID' ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                        {order.paymentStatus} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <Link to={`/orders/${order._id}`} className="inline-flex items-center gap-2 bg-slate-900 group-hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                    View order details <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default Orders;
