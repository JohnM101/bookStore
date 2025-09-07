// In middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
// We'll use a simplified approach that doesn't need the User model for now
// const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Special case for development - accept admin-token
      if (token === 'admin-token') {
        // Create a mock admin user
        req.user = {
          _id: 'admin-id',
          name: 'Admin User',
          email: 'admin@example.com',
          isAdmin: true
        };
        return next();
      }
      
      // Special case for guest users
      if (token === 'guest-token' || token === 'null' || token === 'undefined') {
        req.user = {
          _id: 'guest-id',
          isGuest: true,
          isAdmin: false
        };
        return next();
      }

      // For regular tokens, verify with JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Instead of looking up the user in the database, just use token data
      req.user = {
        _id: decoded.id,
        isAdmin: decoded.isAdmin || false,
        isGuest: false
      };
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as admin');
  }
};

module.exports = { protect, admin };
