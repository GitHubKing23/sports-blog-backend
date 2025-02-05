const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const blogRoutes = require('./routes/blogRoutes');
const trackingRoutes = require('./routes/trackingRoutes'); // ✅ Import tracking routes
const morgan = require('morgan');

dotenv.config();

const app = express();

connectDB()
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('[MongoDB Connection Error]:', err.message);
        process.exit(1);
    });

app.use(express.json());

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
    console.log(`[Global Log] Method: ${req.method}, URL: ${req.originalUrl}, Time: ${new Date().toISOString()}`);
    next();
});

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Sports Blog Backend is running!');
});

// ✅ Mount routes
app.use('/api/blogs', blogRoutes);
app.use('/api/analytics', trackingRoutes); // ✅ Analytics routes are now active

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    console.error(`[Route Error]: ${req.method} ${req.originalUrl} - Not Found`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    console.error(`[Error Handler]: ${req.method} ${req.originalUrl} - ${err.message}`);
    if (err.stack) {
        console.error(`[Stack Trace]: ${err.stack}`);
    }
    res.status(err.status || 500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
