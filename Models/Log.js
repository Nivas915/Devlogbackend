const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  logDescription: {
    type: String,
    required: true
  },
  submittedStatus: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timeSpent: {
    type: Number
  },
  mood: {
    type: String
  },
  submittedAt: {
    type: Date
  },
  reviewedStatus: {
    type: Boolean,
    default: false
  },
  blockers: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Log', logSchema);
