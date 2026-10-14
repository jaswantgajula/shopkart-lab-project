import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopkart';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🛍️ ShopKart Product Catalog & Discovery API (MVC Architecture)',
    database: mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Disconnected',
    endpoints: {
      auth: {
        register: 'POST /customers/register',
        login: 'POST /customers/login',
        getProfile: 'GET /customers/me (Protected)',
        logout: 'POST /customers/logout (Protected)',
      },
      products: {
        createProduct: 'POST /products (Admin only)',
        getAllProducts: 'GET /products (supports ?search=...&category=...&sort=price_asc|price_desc)',
        getSingleProduct: 'GET /products/:id',
        updateProduct: 'PATCH /products/:id (Admin only)',
        addStock: 'PATCH /products/:id/stock (Admin only)',
        deleteProduct: 'DELETE /products/:id (Admin only)',
      },
      orders: {
        createPaymentOrder: 'POST /orders/create-payment-order (Protected)',
        verifyPayment: 'POST /orders/verify-payment (Protected)',
        getMyOrders: 'GET /orders (Protected)',
        getMyOrder: 'GET /orders/:id (Protected)',
      }
    },
  });
});

// Mount Routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`ShopKart Backend running on http://localhost:${PORT}`);
  console.log(`Customer routes mounted at http://localhost:${PORT}/customers`);
  console.log(`Product routes mounted at http://localhost:${PORT}/products`);
});

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((dbErr) => {
    const safeMessage = String(dbErr.message || 'Connection failed').replaceAll(MONGO_URI, '[redacted]');
    console.warn(`MongoDB connection warning: ${safeMessage}`);
  });

export default app;
