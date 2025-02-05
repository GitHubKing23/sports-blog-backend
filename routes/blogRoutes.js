const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getAllBlogs,
    createBlog,
    getBlogById,
    updateBlog,
    deleteBlog,
    getBlogsByCategory,
    getFeaturedBlogs,
} = require('../controllers/blogController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

const upload = multer({ storage });

// Public routes
router.get('/featured', getFeaturedBlogs); // Fetch featured blogs
router.get('/category/:category', getBlogsByCategory); // Fetch blogs by category
router.get('/', getAllBlogs); // Fetch all blogs
router.get('/:id', getBlogById); // Fetch a specific blog by ID

// Admin-only routes for managing blogs
router.post(
    '/',
    upload.single('mainPicture'),
    (req, res, next) => {
        console.log('[Debug] Request Body:', req.body);
        console.log('[Debug] Uploaded File:', req.file);
        next();
    },
    createBlog
); // Create a new blog with image upload
router.put('/:id', upload.single('mainPicture'), updateBlog); // Update a blog with image upload
router.delete('/:id', deleteBlog); // Delete a blog

module.exports = router;
