import express from 'express';
import {
  addProductStock,
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from '../controllers/product.controller.js';
import { adminOnly, protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /products 
router.get('/', getAllProducts);

// GET /products/:id 
router.get('/:id', getProductById);

// Product management routes are intentionally admin-only.
router.post('/', protect, adminOnly, createProduct);
router.patch('/:id/stock', protect, adminOnly, addProductStock);
router.patch('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
