import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token and stores it in an HttpOnly cookie
 * @param {Object} res - Express response object
 * @param {Object|string} customer - Customer instance or ID
 * @returns {string} token
 */
export const generateTokenAndSetCookie = (res, customer) => {
  const secret = process.env.JWT_SECRET || 'shopkart_jwt_secret_key_2026';
  
  const payload = typeof customer === 'object' 
    ? {
        id: customer._id || customer.id,
        email: customer.email,
        fullName: customer.fullName,
        phone: customer.phone,
        role: customer.role,
      }
    : { id: customer };

  const token = jwt.sign(payload, secret, {
    expiresIn: '24h',
  });

  res.cookie('token', token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });

  return token;
};

export default generateTokenAndSetCookie;
