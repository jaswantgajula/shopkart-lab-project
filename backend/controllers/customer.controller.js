import Customer from '../models/customer.model.js';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';

// POST /customers/register - Register a new Customer
export const registerCustomer = async (req, res) => {
  try {
    const { fullName, name, email, password, phone, phoneNumber } = req.body;

    const customerName = (fullName || name || '').trim();
    const customerEmail = (email || '').trim().toLowerCase();
    const customerPhone = (phone || phoneNumber || '').trim();

    if (!customerName || !customerEmail || !password || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'All fields (fullName, email, password, phone) are mandatory.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain at least 6 characters.',
      });
    }

    const existingCustomer = await Customer.findOne({ email: customerEmail });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists',
      });
    }

    const newCustomer = new Customer({
      fullName: customerName,
      email: customerEmail,
      password: password,
      phone: customerPhone,
    });

    await newCustomer.save();

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        role: newCustomer.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error during customer registration.',
    });
  }
};

// POST /customers/login - Login customer
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    const customerEmail = email.trim().toLowerCase();
    const customer = await Customer.findOne({ email: customerEmail });

    if (!customer) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const isPasswordValid = await customer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    generateTokenAndSetCookie(res, customer);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during customer login.',
    });
  }
};

// GET /customers/me - Fetch authenticated customer profile
export const getMyProfile = async (req, res) => {
  try {
    const customer = req.user;

    if (!customer) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    return res.status(200).json({
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      role: customer.role || 'customer',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        role: customer.role || 'customer',
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving customer profile.',
    });
  }
};

// POST /customers/logout - Logout customer
export const logoutCustomer = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during logout.',
    });
  }
};
