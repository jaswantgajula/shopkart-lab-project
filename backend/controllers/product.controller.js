import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import Customer from '../models/customer.model.js';

const getCleanProductPayload = (body, { partial = false } = {}) => {
  const payload = {};
  const requiredTextFields = ['name', 'description', 'category', 'image'];

  for (const field of requiredTextFields) {
    if (!partial || body[field] !== undefined) {
      const value = String(body[field] ?? '').trim();
      if (!value) return { error: `${field} is required.` };
      payload[field] = value;
    }
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { error: 'Price must be a number greater than 0.' };
    }
    payload.price = Number(price.toFixed(2));
  }

  if (!partial || body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return { error: 'Stock must be a whole number of 0 or more.' };
    }
    payload.stock = stock;
  }

  return { payload };
};

export const createProduct = async (req, res) => {
  try {
    const result = getCleanProductPayload(req.body);
    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    const product = await Product.create(result.payload);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error creating product',
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search?.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    if (category?.trim() && category.trim().toLowerCase() !== 'all') {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };

    const products = await Product.find(query).sort(sortOptions);
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching products',
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching product',
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const allowedFields = ['name', 'description', 'price', 'category', 'image', 'stock'];
    const suppliedFields = allowedFields.filter((field) => req.body[field] !== undefined);
    if (!suppliedFields.length) {
      return res.status(400).json({ success: false, error: 'Provide at least one product field to update.' });
    }

    const result = getCleanProductPayload(req.body, { partial: true });
    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: result.payload },
      { new: true, runValidators: true },
    );
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Unable to update product.' });
  }
};

export const addProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const amount = Number(req.body.amount);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Restock amount must be a positive whole number.' });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: amount } },
      { new: true, runValidators: true },
    );
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: `${amount} unit${amount === 1 ? '' : 's'} added to stock.`,
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Unable to add stock.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await Promise.all([
      Product.deleteOne({ _id: id }),
      Customer.updateMany(
        {},
        {
          $pull: {
            wishlist: product._id,
            cart: { product: product._id },
          },
        },
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      productId: product._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Unable to delete product.' });
  }
};
