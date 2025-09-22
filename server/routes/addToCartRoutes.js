const express = require('express');
const router = express.Router();
const AddToCart = require('../models/addToCart');
const { protect } = require('../middleware/authMiddleware');

// Add to cart
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    // Check if product already exists in cart
    const existingItem = await AddToCart.findOne({ userId: req.user._id, productId });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.status(200).json(existingItem);
    }

    const newCartItem = await AddToCart.create({
      userId: req.user._id,
      productId,
      quantity,
    });

    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user’s cart
router.get('/', protect, async (req, res) => {
  try {
    const cart = await AddToCart.find({ userId: req.user._id })
      .populate('productId');
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/:id', protect, async (req, res) => {
  try {
    const cartItem = await AddToCart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await cartItem.remove();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
