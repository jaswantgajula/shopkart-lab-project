import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';


export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?._id;

        // Validate Product ID format 
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID format',
            });
        }

        // Check if product exists in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        // Find user
        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Initialize wishlist array if not present
        if (!user.wishlist) {
            user.wishlist = [];
        }

        // Duplicate Check
        const isAlreadyInWishlist = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isAlreadyInWishlist) {
            return res.status(409).json({
                success: false,
                error: 'Product is already in your wishlist',
            });
        }

        // Add product reference and persist
        user.wishlist.push(productId);
        await user.save();
        const updatedUser = await Customer.findById(userId).populate({
            path: 'wishlist',
            select: 'name price category image stock description',
        });

        return res.status(201).json({
            success: true,
            message: 'Product added to wishlist',
            wishlist: (updatedUser?.wishlist || []).filter(Boolean),
        });
    } catch (error) {
        console.error('addToWishlist error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error while adding product to wishlist',
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const userId = req.user?._id;

        const user = await Customer.findById(userId).populate({
            path: 'wishlist',
            select: 'name price category image stock description',
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        const validWishlist = (user.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist,
        });
    } catch (error) {
        console.error('getWishlist error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching wishlist',
        });
    }
};


export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?._id;

        // Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID format',
            });
        }

        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Check if product is actually in the user's wishlist
        const exists = user.wishlist.some((id) => id.toString() === productId);
        if (!exists) {
            return res.status(404).json({
                success: false,
                error: 'Product not in wishlist',
            });
        }

        // Filter out the product reference
        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
        await user.save();
        const updatedUser = await Customer.findById(userId).populate({
            path: 'wishlist',
            select: 'name price category image stock description',
        });

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            wishlist: (updatedUser?.wishlist || []).filter(Boolean),
        });
    } catch (error) {
        console.error('removeFromWishlist error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error while removing product from wishlist',
        });
    }
};
