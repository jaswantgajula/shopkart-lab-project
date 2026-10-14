import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../services/api';
import { getProductImage, handleProductImageError } from '../utils/productImage';

const OrderDetails = ({ success = false }) => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadOrder = async () => {
      try {
        const data = await getOrderById(id);
        if (active) setOrder(data.order);
      } catch (err) {
        if (active) setError(err.response?.data?.error || 'Unable to load this order.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadOrder();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="py-16 text-center text-gray-600">Loading order...</div>;
  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto my-12 text-center bg-red-50 border border-red-200 rounded-xl p-8">
        <h1 className="text-xl font-bold text-red-700 mb-2">Order unavailable</h1>
        <p className="text-sm text-red-600 mb-5">{error || 'Order not found.'}</p>
        <Link to="/orders" className="text-blue-600 font-semibold text-sm">Back to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      {success && (
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">✅</div>
          <h1 className="text-3xl font-bold text-gray-900">Order Placed Successfully</h1>
          <p className="text-gray-500 mt-1">Your payment was verified and your order was saved.</p>
        </div>
      )}
      {!success && <h1 className="text-3xl font-bold mb-6">Order Details</h1>}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 bg-gray-50 border-b flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-mono text-sm break-all">{order._id}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-500">Placed on</p>
            <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {order.items.map((item) => (
            <div key={`${order._id}-${item.product}`} className="flex items-center gap-4">
              <img
                src={getProductImage(item)}
                alt={item.name}
                onError={(event) => handleProductImageError(event, item)}
                className="w-14 h-14 object-cover rounded bg-gray-100"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        <div className="p-5 border-t bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">Shipping Address</h2>
            <p className="text-sm font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
          </div>
          <div className="sm:text-right space-y-1">
            <p className="text-sm">Payment: <strong>{order.paymentStatus}</strong></p>
            <p className="text-sm">Status: <strong>{order.status}</strong></p>
            <p className="text-xl font-bold text-blue-600">₹{order.totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <Link to="/orders" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">View My Orders</Link>
        <Link to="/products" className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderDetails;
