//addToCartROutes.js
const express = require('express');
const router = express.Router();
const AddToCart = require('../models/addToCart');
const { protect } = require('../middleware/authMiddleware');

// Add or update quantity
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) return res.status(400).json({ message: 'Product ID and quantity required' });

    let cartItem = await AddToCart.findOne({ userId: req.user._id, productId });

    if (cartItem) {
      cartItem.quantity = quantity;
      await cartItem.save();
      return res.status(200).json(cartItem);
    }

    cartItem = await AddToCart.create({ userId: req.user._id, productId, quantity });
    res.status(201).json(cartItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart
router.get('/', protect, async (req, res) => {
  try {
    const cart = await AddToCart.find({ userId: req.user._id }).populate('productId');
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:productId', protect, async (req, res) => {
  try {
    const cartItem = await AddToCart.findOne({ userId: req.user._id, productId: req.params.productId });
    if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });
    await cartItem.remove();
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
