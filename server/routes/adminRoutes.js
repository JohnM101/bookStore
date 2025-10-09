const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// ---------------- Cloudinary Config ----------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bookstore-products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 600, height: 900, crop: 'limit' }]
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
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Main image is required' });

      const { name, description, category, subcategory, price, countInStock, seriesTitle, volumeNumber, publisher, format, slug } = req.body;

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
        slug
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
  upload.single('image'),
  async (req, res) => {
    try {
      const body = req.body;
      const updateData = { ...body };

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

module.exports = router;
