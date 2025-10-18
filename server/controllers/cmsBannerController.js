// server/controllers/cmsBannerController.js
const CmsBanner = require('../models/CmsBanner');

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await CmsBanner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error });
  }
};

// Add a new banner
exports.addBanner = async (req, res) => {
  try {
    const { title, imageUrl, order } = req.body;
    const banner = new CmsBanner({ title, imageUrl, order });
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Error adding banner', error });
  }
};

// Update a banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CmsBanner.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating banner', error });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await CmsBanner.findByIdAndDelete(id);
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error });
  }
};
