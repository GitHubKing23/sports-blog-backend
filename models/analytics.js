const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    page: { type: String, required: true },
    referrer: { type: String },
    userAgent: { type: String },
    ip: { type: String },
    location: { type: Object }, // Stores geolocation data
    timeSpent: { type: Number, default: 0 }, // In seconds
    clickedElements: { type: [String], default: [] }, // Tracks clicked elements
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
