// EventLog.js

const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['User Registration', 'User Login', 'User Logout', 'Blog Post Update', 'Blog Post Deletion', 'Password Change', 'Profile Update', 'Failed Login Attempt', 'Error Logging'],
  },
  eventData: {
    type: Object,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const EventLog = mongoose.model('EventLog', eventLogSchema);

module.exports = EventLog;
