//server/models/Category.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: false },
});

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  subcategories: [subcategorySchema],
});

module.exports = mongoose.model('Category', categorySchema);
