// server/routes/authRoutes.js
// ============================
// AUTH ROUTES (FINAL VERSION)
// ============================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================
// Helper: Generate JWT Token
// ============================
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, isAdmin: user.role === 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

// ============================
// Register User
// ============================
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
    });

    if (user) {
      const token = generateToken(user);
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
        createdAt: user.createdAt,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  })
);

// ============================
// Login User
// ============================
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('🟢 Login attempt:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ No user found');
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for', email);
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user);
    console.log('✅ Login success:', email);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
      createdAt: user.createdAt,
    });
  })
);

// ============================
// Google Login
// ============================
router.post(
  '/google-login',
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const {
      email,
      given_name: firstName,
      family_name: lastName,
      sub: googleId,
    } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const hashedGooglePassword = await bcrypt.hash(googleId, 10);
      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedGooglePassword,
        role: 'user',
      });
    }

    const jwtToken = generateToken(user);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: jwtToken,
    });
  })
);

// ============================
// Get User Profile
// ============================
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401);
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(user);
  })
);

module.exports = router;

