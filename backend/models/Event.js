const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  skill: {
    type: String, // e.g., 'Environment', 'Education', 'Healthcare'
    required: true
  },
  loc: {
    type: String, // Specific location e.g., 'Ghats Area'
    required: true
  },
  city: {
    type: String,
    default: 'Jabalpur' // Ties into your app's city selector!
  },
  eventDate: {
    type: String,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'Join us to make a difference in our community!'
  },
  volunteersNeeded: {
    type: Number,
    default: 10
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // This links directly to your User model!
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Every event MUST have a creator!
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);