const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const blogRoutes = require('./routes/blogRoutes');
const trackingRoutes = require('./routes/trackingRoutes'); // ✅ Import tracking routes
const morgan = require('morgan');
const winston = require('winston'); // ✅ Add winston

dotenv.config();

const app = express();

// Setup winston logger
const logger = winston.createLogger({
    level: 'info', // Set the log level
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }), // Console transport
        new winston.transports.File({ filename: 'server.log' }) // File transport
    ],
});

connectDB()
    .then(() => logger.info('Connected to MongoDB')) // Replaced console.log with logger
    .catch((err) => {
        logger.error('[MongoDB Connection Error]:', err.message); // Replaced console.error with logger
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

// Global middleware log with winston
app.use((req, res, next) => {
    logger.info(`[Global Log] Method: ${req.method}, URL: ${req.originalUrl}, Time: ${new Date().toISOString()}`);
    next();
});

// Use morgan for HTTP request logging
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Sports Blog Backend is running!');
});

// ✅ Mount routes
app.use('/api/blogs', blogRoutes);
app.use('/api/analytics', trackingRoutes); // ✅ Analytics routes are now active

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    logger.error(`[Route Error]: ${req.method} ${req.originalUrl} - Not Found`); // Log not found error
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    logger.error(`[Error Handler]: ${req.method} ${req.originalUrl} - ${err.message}`); // Log errors
    if (err.stack) {
        logger.error(`[Stack Trace]: ${err.stack}`); // Log stack trace if available
    }
    res.status(err.status || 500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`)); // Log server startup
