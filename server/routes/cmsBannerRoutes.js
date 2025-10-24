// server/routes/cmsBannerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getBanners,
  addBanner,
  deleteBanner,
  updateBanner
} = require('../controllers/cmsBannerController');

// GET all banners
router.get('/', getBanners);

// POST new banner
router.post('/', addBanner);

// PUT update banner
router.put('/:id', updateBanner);

// DELETE banner
router.delete('/:id', deleteBanner);

module.exports = router;
