import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

const getPopulatedCart = async (userId) => {
    const user = await Customer.findById(userId).populate('cart.product');
    return (user?.cart || []).filter((item) => item.product !== null);
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, error: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.stock <= 0) {
            return res.status(400).json({ success: false, error: 'Product is out of stock' });
        }

        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (!user.cart) user.cart = [];

        // Check if product already exists in cart
        const cartItemIndex = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (cartItemIndex > -1) {
            const targetItem = user.cart[cartItemIndex];
            if (targetItem.quantity + 1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    error: `Cannot add more. Stock limit of ${product.stock} reached.`,
                });
            }
            targetItem.quantity += 1;
        } else {
            user.cart.push({ product: productId, quantity: 1 });
        }

        await user.save();

        // Populate so the frontend gets full details immediately
        const cart = await getPopulatedCart(userId);

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            cart,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user?._id;
        const user = await Customer.findById(userId).populate('cart.product');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Filter out any cart items if a product was deleted from DB
        const validCart = (user.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            cart: validCart,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = Number(req.body.quantity);
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, error: 'Invalid product ID' });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Quantity must be a whole number of at least 1'
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                error: "Not enough stock"
            });
        }

        const user = await Customer.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const cartItem = user.cart.find(
            item => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                error: "Product not in cart"
            });
        }

        cartItem.quantity = quantity;

        await user.save();
        const cart = await getPopulatedCart(userId);

        return res.status(200).json({
            success: true,
            message: "Quantity updated",
            cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, error: 'Invalid product ID' });
        }

        const user = await Customer.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const itemExists = user.cart.some(
            item => item.product.toString() === productId
        );
        if (!itemExists) {
            return res.status(404).json({ success: false, error: 'Product not in cart' });
        }

        user.cart = user.cart.filter(
            item => item.product.toString() !== productId
        );

        await user.save();
        const cart = await getPopulatedCart(userId);

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
