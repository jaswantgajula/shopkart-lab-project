import axios from 'axios';

// Base URL for the backend API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerCustomer = async (customerData) => {
  const payload = {
    fullName: customerData.fullName?.trim() || customerData.name?.trim(),
    name: customerData.fullName?.trim() || customerData.name?.trim(),
    email: customerData.email?.trim().toLowerCase(),
    password: customerData.password,
    phone: customerData.phone?.trim() || customerData.phoneNumber?.trim(),
  };
  const response = await api.post('/customers/register', payload);
  return response.data;
};

// POST /customers/login
export const loginCustomer = async (credentials) => {
  const payload = {
    email: credentials.email?.trim().toLowerCase(),
    password: credentials.password,
  };
  const response = await api.post('/customers/login', payload);
  return response.data;
};

// GET /customers/me
export const getCurrentCustomer = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

// POST /customers/logout
export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

export const getProducts = async ({ search = '', category = '', sort = '' } = {}) => {
  const params = {};
  if (search && search.trim()) params.search = search.trim();
  if (category && category.trim() && category.trim().toLowerCase() !== 'all') {
    params.category = category.trim();
  }
  if (sort && sort.trim()) params.sort = sort.trim();

  const response = await api.get('/products', { params });
  return response.data;
};

// GET /products/:id
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// POST /products
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// PATCH /products/:id (admin only)
export const updateProduct = async (id, productData) => {
  const response = await api.patch(`/products/${id}`, productData);
  return response.data;
};

// PATCH /products/:id/stock (admin only)
export const addProductStock = async (id, amount) => {
  const response = await api.patch(`/products/${id}/stock`, { amount });
  return response.data;
};

// DELETE /products/:id (admin only)
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// GET /wishlist
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};
// POST /wishlist/:productId
export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};
// DELETE /wishlist/:productId
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

// GET /cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// POST /cart/:productId
export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

// PATCH /cart/:productId
export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

// DELETE /cart/:productId
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// POST /orders/create-payment-order
export const createPaymentOrder = async (shippingAddress) => {
  const response = await api.post('/orders/create-payment-order', { shippingAddress });
  return response.data;
};

// POST /orders/verify-payment
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/orders/verify-payment', paymentData);
  return response.data;
};

// GET /orders
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// GET /orders/:id
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export default api;
