const express = require('express');
const router = express.Router();
const AddToCart = require('../models/addToCart');
const Product = require('../models/Product'); // Make sure to import Product model
const { protect } = require('../middleware/authMiddleware');

// ------------------------
// POST /api/cart
// Add product to cart (increment if exists)
// ------------------------
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity)
      return res.status(400).json({ message: 'Product ID and quantity required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cartItem = await AddToCart.findOne({ userId: req.user._id, productId });

    if (cartItem) {
      // Increment existing quantity, but don't exceed stock
      cartItem.quantity = Math.min(cartItem.quantity + quantity, product.countInStock);
      await cartItem.save();
      return res.status(200).json(cartItem);
    }

    // Create new cart item
    cartItem = await AddToCart.create({
      userId: req.user._id,
      productId,
      quantity: Math.min(quantity, product.countInStock),
    });

    res.status(201).json(cartItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------
// PUT /api/cart/:productId
// Set exact quantity for an existing cart item
// ------------------------
router.put('/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined)
      return res.status(400).json({ message: 'Quantity required' });

    const cartItem = await AddToCart.findOne({
      userId: req.user._id,
      productId: req.params.productId,
    });

    if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Set quantity but do not exceed stock
    cartItem.quantity = Math.min(quantity, product.countInStock);
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------
// GET /api/cart
// Get all cart items for current user
// ------------------------
router.get('/', protect, async (req, res) => {
  try {
    const cart = await AddToCart.find({ userId: req.user._id }).populate('productId');
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------
// DELETE /api/cart/:productId
// Remove cart item
// ------------------------
router.delete('/:productId', protect, async (req, res) => {
  try {
    const cartItem = await AddToCart.findOne({
      userId: req.user._id,
      productId: req.params.productId,
    });
    if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

    await cartItem.remove();
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
