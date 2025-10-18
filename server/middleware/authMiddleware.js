// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Allow guest access
      if (token === 'guest-token' || token === 'null' || token === 'undefined') {
        req.user = { _id: 'guest-id', isGuest: true, isAdmin: false };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        _id: decoded.id,
        isAdmin: decoded.isAdmin || false,
        isGuest: false,
      };
      return next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  res.status(401);
  throw new Error('Not authorized, no token');
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(401);
  throw new Error('Not authorized as admin');
};

module.exports = { protect, admin };
