const express = require('express');
const router = express.Router();
const Analytics = require('../models/analytics');  // Changed to lowercase 'analytics'
const axios = require('axios');

// ✅ Track page visits with IP & geolocation
router.post('/track-visit', async (req, res) => {
    try {
        const { page, referrer, userAgent, ip } = req.body;

        // Logging the incoming request data for debugging
        console.log(`[TRACK-VISIT] Incoming request data: ${JSON.stringify(req.body)}`);

        // 🔍 Get geolocation data (Using ip-api.com free API)
        let location = {};
        let country = "Unknown";
        if (ip) {
            try {
                const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
                location = geoResponse.data;
                country = location.country || "Unknown"; // Extract country name
            } catch (geoError) {
                console.error(`[TRACK-VISIT] ❌ Error fetching geolocation: ${geoError.message}`);
            }
        }

        // ✅ Identify if user is on Mobile or Desktop
        const isMobile = /Mobi|Android/i.test(userAgent);
        const deviceType = isMobile ? "Mobile" : "Desktop";

        // ✅ Check if this visit already exists (prevents duplicate spam)
        const existingVisit = await Analytics.findOne({ page, ip });
        if (existingVisit) {
            console.log(`[TRACK-VISIT] 🔹 Skipping duplicate visit for ${ip} on ${page}`);
            return res.status(200).json({ message: "Duplicate visit skipped." });
        }

        // ✅ Save visit to database
        const visit = new Analytics({
            page,
            referrer,
            userAgent,
            ip,
            location,
            country,
            deviceType
        });
        await visit.save();

        res.status(201).json({ message: 'Visit tracked successfully' });
    } catch (error) {
        console.error(`[TRACK-VISIT] ❌ Error in tracking visit: ${error.message}`);
        res.status(500).json({ message: 'Error tracking visit' });
    }
});

// ✅ Track time spent on a page
router.post('/track-time', async (req, res) => {
    try {
        const { page, timeSpent } = req.body;

        // Logging the incoming request data for debugging
        console.log(`[TRACK-TIME] Incoming request data: ${JSON.stringify(req.body)}`);

        if (!page || !timeSpent) {
            return res.status(400).json({ message: 'Page and time spent are required' });
        }

        await Analytics.updateOne(
            { page },
            { $inc: { timeSpent } },
            { upsert: true }
        );

        res.status(201).json({ message: 'Time spent tracked' });
    } catch (error) {
        console.error(`[TRACK-TIME] ❌ Error tracking time spent: ${error.message}`);
        res.status(500).json({ message: 'Error tracking time spent' });
    }
});

// ✅ Track clicks on elements
router.post('/track-click', async (req, res) => {
    try {
        const { page, clickedElement } = req.body;

        // Logging the incoming request data for debugging
        console.log(`[TRACK-CLICK] Incoming request data: ${JSON.stringify(req.body)}`);

        if (!page || !clickedElement) {
            return res.status(400).json({ message: 'Page and clicked element are required' });
        }

        await Analytics.updateOne(
            { page },
            { $push: { clickedElements: clickedElement } },
            { upsert: true }
        );

        res.status(201).json({ message: 'Click tracked' });
    } catch (error) {
        console.error(`[TRACK-CLICK] ❌ Error tracking click: ${error.message}`);
        res.status(500).json({ message: 'Error tracking click' });
    }
});

// ✅ Track scroll depth
router.post('/track-scroll', async (req, res) => {
    try {
        const { page, depth } = req.body;  // Changed scrollDepth to depth

        // Logging the incoming request data for debugging
        console.log(`[TRACK-SCROLL] Incoming request data: ${JSON.stringify(req.body)}`);

        if (!page || !depth) {
            return res.status(400).json({ message: 'Page and scroll depth are required' });
        }

        await Analytics.updateOne(
            { page },
            { $max: { scrollDepth: depth } }, // Stores highest scroll depth per page
            { upsert: true }
        );

        res.status(201).json({ message: 'Scroll depth tracked' });
    } catch (error) {
        console.error(`[TRACK-SCROLL] ❌ Error tracking scroll depth: ${error.message}`);
        res.status(500).json({ message: 'Error tracking scroll depth' });
    }
});

// ✅ Fetch analytics summary
router.get('/stats', async (req, res) => {
    try {
        const totalVisits = await Analytics.countDocuments();
        const pages = await Analytics.aggregate([
            { $group: { _id: '$page', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const topClicks = await Analytics.aggregate([
            { $unwind: "$clickedElements" },
            { $group: { _id: "$clickedElements", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const deviceStats = await Analytics.aggregate([
            { $group: { _id: "$deviceType", count: { $sum: 1 } } }
        ]);
        const countryStats = await Analytics.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 } // Limit to top 10 countries
        ]);

        res.json({ totalVisits, pages, topClicks, deviceStats, countryStats });
    } catch (error) {
        console.error(`[STATS] ❌ Error fetching analytics: ${error.message}`);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
