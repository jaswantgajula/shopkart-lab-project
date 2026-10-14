import express from 'express';
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
} from '../controllers/wishlist.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getWishlist);

router.route('/:productId')
    .post(addToWishlist)
    .delete(removeFromWishlist);

export default router;
