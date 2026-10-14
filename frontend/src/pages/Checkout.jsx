import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';
import { getProductImage, handleProductImageError } from '../utils/productImage';

const initialAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
};

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve();
    return;
  }

  const existingScript = document.querySelector('script[data-razorpay-checkout]');
  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout.')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.dataset.razorpayCheckout = 'true';
  script.onload = resolve;
  script.onerror = () => reject(new Error('Unable to load Razorpay Checkout. Check your internet connection.'));
  document.body.appendChild(script);
});

const validateAddress = (address) => {
  const cleaned = Object.fromEntries(
    Object.entries(address).map(([key, value]) => [key, value.trim()]),
  );
  const errors = {};

  Object.entries(cleaned).forEach(([key, value]) => {
    if (!value) errors[key] = 'This field is required.';
  });
  if (cleaned.phone && !/^\+?\d{10,15}$/.test(cleaned.phone)) {
    errors.phone = 'Enter a valid phone number (10 to 15 digits).';
  }
  if (cleaned.pincode && !/^\d{6}$/.test(cleaned.pincode)) {
    errors.pincode = 'Pincode must contain 6 digits.';
  }

  return { cleaned, errors };
};

const Checkout = ({ user }) => {
  const navigate = useNavigate();
  const { cartItems, subtotal, loading: cartLoading, clearCart } = useCart();
  const [address, setAddress] = useState({
    ...initialAddress,
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPaymentMessage('');

    const { cleaned, errors } = validateAddress(address);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!cartItems.length) {
      setError('Your cart is empty.');
      return;
    }

    setProcessing(true);
    try {
      setPaymentMessage('Loading secure payment...');
      await loadRazorpayCheckout();
      setPaymentMessage('Creating your order...');
      const data = await createPaymentOrder(cleaned);

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'ShopKart',
        description: 'ShopKart order payment',
        order_id: data.razorpayOrder.id,
        prefill: {
          name: cleaned.fullName,
          contact: cleaned.phone,
          email: user?.email || '',
        },
        notes: {
          shopkartOrderId: data.shopkartOrderId,
        },
        theme: { color: '#2563eb' },
        handler: async (paymentResponse) => {
          try {
            setPaymentMessage('Verifying payment...');
            const verification = await verifyPayment({
              shopkartOrderId: data.shopkartOrderId,
              ...paymentResponse,
            });
            clearCart();
            navigate(`/order-success/${verification.order._id}`, { replace: true });
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.error
              || 'Payment was received but verification failed. Please contact support.',
            );
            setPaymentMessage('');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled. Your cart has not been cleared.');
            setPaymentMessage('');
            setProcessing(false);
          },
        },
      });

      checkout.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setPaymentMessage('');
        setProcessing(false);
      });

      setPaymentMessage('Complete the payment in the Razorpay window.');
      checkout.open();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to start payment.');
      setPaymentMessage('');
      setProcessing(false);
    }
  };

  if (cartLoading) {
    return <div className="py-16 text-center text-gray-600">Loading checkout...</div>;
  }

  if (!cartItems.length) {
    return (
      <div className="max-w-lg mx-auto my-12 sk-card p-9 text-center">
        <div className="text-5xl mb-3">🛒</div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mb-6">Add a product before starting checkout.</p>
        <Link to="/products" className="sk-btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  const fields = [
    ['fullName', 'Full Name', 'text', 'Aarav Sharma'],
    ['phone', 'Phone Number', 'tel', '9876543210'],
    ['addressLine1', 'Address Line', 'text', '22 MG Road'],
    ['city', 'City', 'text', 'Bengaluru'],
    ['state', 'State', 'text', 'Karnataka'],
    ['pincode', 'Pincode', 'text', '560001'],
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 pb-10">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#0b1739] via-[#102b80] to-[#1746d2] text-white p-7 sm:p-9 mb-7 shadow-[0_20px_55px_rgba(15,43,128,0.2)]">
        <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <Link to="/cart" className="relative text-xs font-bold text-blue-200 hover:text-white">← Back to cart</Link>
        <p className="relative mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-200">Secure final step</p>
        <h1 className="relative text-3xl sm:text-4xl font-black tracking-[-0.04em] mt-2">Checkout, without the clutter.</h1>
        <p className="relative text-sm text-blue-100 mt-2">Delivery details on the left. Your final edit on the right.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <section className="lg:col-span-3 sk-card !rounded-2xl p-6 sm:p-7">
          <p className="sk-section-label">Where it is going</p>
          <h2 className="text-2xl font-black tracking-[-0.03em] mt-2 mb-6">Shipping details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(([name, label, type, placeholder]) => (
              <div key={name} className={name === 'addressLine1' ? 'sm:col-span-2' : ''}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={address[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  disabled={processing}
                  className={`sk-field ${
                    fieldErrors[name] ? '!border-red-400 !ring-red-100' : ''
                  }`}
                />
                {fieldErrors[name] && <p className="text-xs text-red-600 mt-1">{fieldErrors[name]}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-slate-950 text-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] lg:sticky lg:top-32">
          <div className="absolute -right-12 -top-16 w-44 h-44 rounded-full bg-blue-600/20" />
          <p className="relative text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">Your final edit</p>
          <h2 className="relative text-xl font-black pb-4 border-b border-white/10 mt-1 mb-4">Order summary</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product._id} className="flex gap-3 items-center">
                <img
                  src={getProductImage(item.product)}
                  alt={item.product.name}
                  onError={(event) => handleProductImageError(event, item.product)}
                  className="w-12 h-12 rounded object-cover bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-4 pt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-600">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Prices and stock are rechecked before payment.</p>
          {paymentMessage && <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded mt-4">{paymentMessage}</p>}
          <button
            type="submit"
            disabled={processing}
            className="relative w-full mt-5 bg-[#ff7657] hover:bg-[#ff6543] text-white font-black py-3.5 rounded-xl shadow-[0_10px_25px_rgba(255,118,87,0.25)] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {processing ? 'Processing...' : 'Pay with Razorpay'}
          </button>
          <p className="text-xs text-center text-slate-500 mt-3">Razorpay Test Mode · No real money</p>
        </section>
      </form>
    </div>
  );
};

export default Checkout;
