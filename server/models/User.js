// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

// In your User.js model
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: false, // was true
  },
  lastName: {
    type: String,
    required: false, // was true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {  // Add phone field
    type: String,
    default: ''
  },
  address: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    telephone: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true  // This adds createdAt and updatedAt fields
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
