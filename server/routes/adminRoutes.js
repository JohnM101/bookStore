// server/routes/adminRoutes.js
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

// Log the Cloudinary config to verify environment variables are loaded
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// ----------------------------------------------------

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'anime-you-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// Apply middleware to all routes
router.use(protect);

// ...rest of your routes...


// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product with Cloudinary integration (admin only)
router.post('/products', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, subcategory, countInStock } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    const product = new Product({
      name,
      description,
      price,
      category,
      subcategory,
      image: req.file.path,
      countInStock
    });
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product route with Cloudinary (admin only)
router.put('/products/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      subcategory: req.body.subcategory,
      countInStock: req.body.countInStock
    };

    if (req.file) {
      updateData.image = req.file.path;
    } else if (req.body.imageUrl) {
      updateData.image = req.body.imageUrl;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/products/:id', admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Only admins can get all users
router.get('/users', admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    const newUser = new User({
      firstName,
      lastName,
      email,
      role: role || 'user'
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Order management routes
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'firstName lastName email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Stats route (admin only)
router.get('/stats', admin, async (req, res) => {
  // Only admins can see stats
  // ...your code
});

// Delete user
router.delete('/users/:userId', admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Make user admin
router.put('/users/:userId/make-admin', admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove admin privileges
router.put('/users/:userId/remove-admin', admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'user' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
