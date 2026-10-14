import express from 'express';
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
} from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect); // Protect every cart action

router.route('/')
    .get(getCart);

router.route('/:productId')
    .post(addToCart)
    .patch(updateCartQuantity)
    .delete(removeFromCart);

export default router;