import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';


export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.cookies?.jwt;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided',
      });
    }

    const secret = process.env.JWT_SECRET || 'shopkart_jwt_secret_key_2026';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired token',
      });
    }

    let customer = null;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      customer = await Customer.findById(decoded.id).select('-password');
    }

    if (!customer) {
      customer = {
        _id: decoded.id,
        fullName: decoded.fullName || 'Customer',
        email: decoded.email,
        phone: decoded.phone,
        role: decoded.role || 'customer',
      };
    }

    req.user = customer;
    req.customer = customer;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication failed',
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Administrator access is required',
    });
  }

  next();
};

export default protect;
