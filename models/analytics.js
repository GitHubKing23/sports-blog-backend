const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    page: { type: String, required: true },
    referrer: { type: String },
    userAgent: { type: String },
    ip: { type: String },
    location: { type: Object },
    timeSpent: { type: Number, default: 0 },
    clickedElements: { type: [String], default: [] },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
