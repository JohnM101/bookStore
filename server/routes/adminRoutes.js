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
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});
const upload = multer({ storage });

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
router.post(
  '/products',
  protect,
  admin,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const body = req.body;
      if (!req.files || !req.files['image'])
        return res.status(400).json({ message: 'Main image is required' });

      const product = new Product({
        name: body.name,
        subtitle: body.subtitle,
        description: body.description,
        price: parseFloat(body.price),
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : undefined,
        discountStart: body.discountStart || undefined,
        discountEnd: body.discountEnd || undefined,
        category: body.category,
        subcategory: body.subcategory,
        image: req.files['image'][0].path,
        images: req.files['images'] ? req.files['images'].map(f => f.path) : [],
        author: body.author,
        publisher: body.publisher,
        isbn: body.isbn,
        publishedDate: body.publishedDate,
        language: body.language,
        pages: body.pages ? parseInt(body.pages) : undefined,
        format: body.format,
        edition: body.edition,
        sku: body.sku,
        supplier: body.supplier,
        reorderLevel: body.reorderLevel ? parseInt(body.reorderLevel) : undefined,
        countInStock: body.countInStock ? parseInt(body.countInStock) : 0,
        slug: body.slug,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription
      });

      const savedProduct = await product.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// UPDATE product
router.put(
  '/products/:id',
  protect,
  admin,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const body = req.body;
      const updateData = { ...body };

      if (req.files['image']) updateData.image = req.files['image'][0].path;
      if (req.files['images']) updateData.images = req.files['images'].map(f => f.path);

      ['price', 'discountPrice', 'pages', 'reorderLevel', 'countInStock'].forEach(f => {
        if (updateData[f] !== undefined) updateData[f] = parseFloat(updateData[f]);
      });

      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

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
  // Implement admin stats logic here
  res.json({ message: 'Stats endpoint' });
});

module.exports = router;
