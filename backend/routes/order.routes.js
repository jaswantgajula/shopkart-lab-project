import express from 'express';
import {
  createPaymentOrder,
  getMyOrderById,
  getMyOrders,
  verifyPayment,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getMyOrders);
router.get('/:id', getMyOrderById);

export default router;
