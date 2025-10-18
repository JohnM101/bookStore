// server/models/Product.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Helper: normalize to slug-safe format
const toSlug = (str) =>
  str?.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, default: 0 },
    image: { type: String, required: true },
    albumImages: [{ type: String }],

    // 📚 Extended details
    seriesTitle: { type: String, default: "" },
    volumeNumber: { type: Number, default: null },
    publisher: { type: String, default: "" },
    format: { type: String, default: "" },

    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate slugs on save
productSchema.pre("save", function (next) {
  if (this.name) this.slug = toSlug(this.name);
  if (this.category) this.category = toSlug(this.category);
  if (this.subcategory) this.subcategory = toSlug(this.subcategory);
  next();
});

// Auto-update slugs on edit
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) update.slug = toSlug(update.name);
  if (update.category) update.category = toSlug(update.category);
  if (update.subcategory) update.subcategory = toSlug(update.subcategory);
  next();
});

module.exports = mongoose.model("Product", productSchema);
