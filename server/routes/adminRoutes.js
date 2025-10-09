const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// ---------------- Cloudinary Config ----------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for product images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bookstore-products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 600, height: 900, crop: 'limit' }]
  }
});
const upload = multer({ storage });

// ---------------- Helper Function ----------------
const generateSlug = (name, volumeNumber) => {
  if (!name) return '';
  let base = name.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
  if (volumeNumber) base += `-vol-${volumeNumber}`;
  return base;
};

// ---------------- Product Routes ----------------

// GET all products
router.get('/products', protect, admin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product
router.get('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE product
router.post('/products', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Main image is required' });

    const {
      name,
      description,
      category,
      subcategory,
      price,
      countInStock,
      seriesTitle,
      volumeNumber,
      publisher,
      format,
      slug
    } = req.body;

    const product = new Product({
      name,
      description,
      category,
      subcategory,
      price: parseFloat(price),
      countInStock: parseInt(countInStock),
      image: req.file.path,
      seriesTitle,
      volumeNumber: volumeNumber ? parseInt(volumeNumber) : undefined,
      publisher,
      format,
      slug: slug?.trim() || generateSlug(name, volumeNumber)
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product
router.put('/products/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const body = req.body;

    // Auto-generate slug if not provided
    const slugValue = body.slug?.trim() || generateSlug(body.name, body.volumeNumber);
    const updateData = { ...body, slug: slugValue };

    if (req.file) updateData.image = req.file.path;
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.countInStock) updateData.countInStock = parseInt(updateData.countInStock);
    if (updateData.volumeNumber) updateData.volumeNumber = parseInt(updateData.volumeNumber);

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE product
router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------- User Routes ----------------

// GET all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE new user
router.post('/users', protect, admin, async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    const newUser = new User({ firstName, lastName, email, role: role || 'user' });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE user
router.delete('/users/:userId', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Make user admin
router.put('/users/:userId/make-admin', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove admin privileges
router.put('/users/:userId/remove-admin', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { role: 'user' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------- Order Routes ----------------

// GET all orders
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'firstName lastName email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- Optional Stats Route ----------------
router.get('/stats', protect, admin, async (req, res) => {
  res.json({ message: 'Stats endpoint' });
});

module.exports = router;
