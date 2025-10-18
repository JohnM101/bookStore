// server/models/CmsBanner.js
const mongoose = require('mongoose');

const cmsBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CmsBanner', cmsBannerSchema);
