import crypto from 'crypto';
import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

const requiredShippingFields = [
  'fullName',
  'phone',
  'addressLine1',
  'city',
  'state',
  'pincode',
];

const validateShippingAddress = (shippingAddress) => {
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return { error: 'Shipping address is required.' };
  }

  const cleaned = {};
  for (const field of requiredShippingFields) {
    cleaned[field] = String(shippingAddress[field] ?? '').trim();
    if (!cleaned[field]) {
      return { error: `${field} is required.` };
    }
  }

  if (!/^\+?\d{10,15}$/.test(cleaned.phone)) {
    return { error: 'Phone must contain 10 to 15 digits.' };
  }

  if (!/^\d{6}$/.test(cleaned.pincode)) {
    return { error: 'Pincode must contain 6 digits.' };
  }

  return { value: cleaned };
};

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error('Razorpay test credentials are not configured on the server.');
  }

  if (!keyId.startsWith('rzp_test_')) {
    throw new Error('Only Razorpay Test Mode credentials are allowed.');
  }

  return { keyId, keySecret };
};

const createRazorpayOrder = async ({ amount, receipt, userId }) => {
  const { keyId, keySecret } = getRazorpayCredentials();
  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt,
      notes: { shopkartUserId: String(userId) },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.description || 'Razorpay could not create a payment order.');
  }

  return { data, keyId };
};

export const createPaymentOrder = async (req, res) => {
  try {
    const shippingResult = validateShippingAddress(req.body?.shippingAddress);
    if (shippingResult.error) {
      return res.status(400).json({ success: false, error: shippingResult.error });
    }

    const customer = await Customer.findById(req.user._id).select('cart');
    if (!customer) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (!customer.cart?.length) {
      return res.status(400).json({ success: false, error: 'Your cart is empty.' });
    }

    const productIds = customer.cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = productMap.get(String(cartItem.product));
      const quantity = Number(cartItem.quantity);

      if (!product) {
        return res.status(400).json({
          success: false,
          error: 'A product in your cart is no longer available. Remove it and try again.',
        });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          error: `Invalid quantity for ${product.name}.`,
        });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      });
      totalAmount += product.price * quantity;
    }

    totalAmount = Number(totalAmount.toFixed(2));
    const amountInPaise = Math.round(totalAmount * 100);
    const order = new Order({
      user: customer._id,
      items,
      shippingAddress: shippingResult.value,
      totalAmount,
    });

    const razorpayResult = await createRazorpayOrder({
      amount: amountInPaise,
      receipt: `shopkart_${String(order._id)}`,
      userId: customer._id,
    });

    order.razorpayOrderId = razorpayResult.data.id;
    await order.save();

    return res.status(201).json({
      success: true,
      shopkartOrderId: order._id,
      keyId: razorpayResult.keyId,
      razorpayOrder: {
        id: razorpayResult.data.id,
        amount: razorpayResult.data.amount,
        currency: razorpayResult.data.currency,
      },
    });
  } catch (error) {
    console.error('createPaymentOrder error:', error);
    const isConfigurationError = error.message.includes('credentials') || error.message.includes('Test Mode');
    return res.status(isConfigurationError ? 503 : 500).json({
      success: false,
      error: error.message || 'Unable to start payment.',
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const shopkartOrderId = req.body?.shopkartOrderId;
    const razorpayOrderId = req.body?.razorpay_order_id;
    const razorpayPaymentId = req.body?.razorpay_payment_id;
    const razorpaySignature = req.body?.razorpay_signature;

    if (!mongoose.Types.ObjectId.isValid(shopkartOrderId)) {
      return res.status(400).json({ success: false, error: 'Invalid ShopKart order ID.' });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, error: 'Complete payment details are required.' });
    }

    const order = await Order.findOne({ _id: shopkartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ success: false, error: 'Payment order does not match.' });
    }

    const { keySecret } = getRazorpayCredentials();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const supplied = Buffer.from(String(razorpaySignature));
    const expected = Buffer.from(expectedSignature);
    const signatureIsValid = supplied.length === expected.length
      && crypto.timingSafeEqual(supplied, expected);

    if (!signatureIsValid) {
      if (order.paymentStatus !== 'PAID') {
        order.paymentStatus = 'FAILED';
        await order.save();
      }
      return res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
    }

    const session = await mongoose.startSession();
    let verifiedOrder;
    let alreadyProcessed = false;

    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({
          _id: shopkartOrderId,
          user: req.user._id,
        }).session(session);

        if (!currentOrder) {
          const notFoundError = new Error('Order not found.');
          notFoundError.statusCode = 404;
          throw notFoundError;
        }

        if (currentOrder.paymentStatus === 'PAID' && currentOrder.stockAdjusted) {
          alreadyProcessed = true;
          verifiedOrder = currentOrder;
          return;
        }

        // A conditional update prevents stock from becoming negative if it changed
        for (const item of currentOrder.items) {
          const stockUpdate = await Product.updateOne(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session },
          );

          if (stockUpdate.modifiedCount !== 1) {
            const inventoryError = new Error(
              `Stock changed during payment for ${item.name}. Please contact support with order ${currentOrder._id}.`,
            );
            inventoryError.statusCode = 409;
            throw inventoryError;
          }
        }

        if (currentOrder.paymentStatus !== 'PAID') {
          const customer = await Customer.findById(req.user._id).session(session);
          if (!customer) {
            const userError = new Error('User not found.');
            userError.statusCode = 404;
            throw userError;
          }
          customer.cart = [];
          await customer.save({ session });
        }

        currentOrder.paymentStatus = 'PAID';
        currentOrder.status = 'PLACED';
        currentOrder.razorpayPaymentId = razorpayPaymentId;
        currentOrder.stockAdjusted = true;
        await currentOrder.save({ session });
        verifiedOrder = currentOrder;
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: alreadyProcessed
        ? 'Payment was already verified.'
        : 'Payment verified, stock updated, and order placed.',
      order: verifiedOrder,
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Unable to verify payment.',
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Unable to load orders.' });
  }
};

export const getMyOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid order ID.' });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Unable to load order.' });
  }
};
