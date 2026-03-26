const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // No two users can have the same email
  },
  password: {
    type: String,
    required: true
  },
  city: {
    type: String,
    default: 'Jabalpur'
  },
  role: {
    type: String,
    default: 'volunteer' // Can be 'volunteer' or 'ngo'
  },
  ngoRegistrationNumber: {
    type: String,
    // This brilliant Mongoose trick makes it REQUIRED only if the role is 'ngo'!
    required: function() { return this.role === 'ngo'; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);