// ============================================================
// ✅ cmsBannerController.js — Full CRUD Controller
// ============================================================
const CmsBanner = require("../models/CmsBanner");

// GET all banners (public)
exports.getBanners = async (req, res) => {
  try {
    const query = req.query.active ? { isActive: true } : {};
    const banners = await CmsBanner.find(query).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch banners" });
  }
};

// CREATE banner
exports.addBanner = async (req, res) => {
  try {
    const body = req.body;
    const files = req.files || {};

    const newBanner = new CmsBanner({
      title: body.title,
      subtitle: body.subtitle,
      ctaText: body.ctaText,
      ctaLink: body.ctaLink,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      animationType: body.animationType,
      order: body.order || 0,
      isActive: body.isActive !== "false",
      imageDesktop: files.imageDesktop?.[0]?.path,
      imageMobile: files.imageMobile?.[0]?.path || null,
    });

    const saved = await newBanner.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Add banner error:", err);
    res.status(500).json({ message: "Failed to add banner" });
  }
};

// UPDATE banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const files = req.files || {};

    const updatedData = {
      title: body.title,
      subtitle: body.subtitle,
      ctaText: body.ctaText,
      ctaLink: body.ctaLink,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      animationType: body.animationType,
      order: body.order,
      isActive: body.isActive !== "false",
    };

    if (files.imageDesktop?.[0]) updatedData.imageDesktop = files.imageDesktop[0].path;
    if (files.imageMobile?.[0]) updatedData.imageMobile = files.imageMobile[0].path;

    const updated = await CmsBanner.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ Update banner error:", err);
    res.status(500).json({ message: "Failed to update banner" });
  }
};

// DELETE banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await CmsBanner.findByIdAndDelete(id);
    res.json({ message: "Banner deleted" });
  } catch (err) {
    console.error("❌ Delete banner error:", err);
    res.status(500).json({ message: "Failed to delete banner" });
  }
};
