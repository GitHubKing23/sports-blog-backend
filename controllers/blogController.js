const Blog = require("../models/Blog");
const multer = require("multer");

// ✅ Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Category Mapping (Handles Title Case Issues)
const categoryMap = {
  FOOTY: "Footy",
  ESPORTS: "Esport", // Fixing Esport issue
  ESPORT: "Esport",
  NBA: "NBA",
  NHL: "NHL",
  NFL: "NFL",
  MLB: "MLB",
};

// ✅ Get all blogs with pagination and search
const getAllBlogs = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  try {
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const blogs = await Blog.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalBlogs = await Blog.countDocuments(query);

    res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalBlogs / limit),
      totalBlogs,
      blogs,
    });
  } catch (error) {
    console.error("[Error Fetching Blogs]:", error.message);
    res.status(500).json({ message: "Server error fetching blogs." });
  }
};

// ✅ Create a new blog with correct category formatting
const createBlog = async (req, res) => {
  let { title, content, author, category, featured } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ message: "Title, content, and category are required" });
  }

  category = category.toUpperCase(); // ✅ Convert input to uppercase

  if (!categoryMap[category]) {
    return res.status(400).json({ message: `Invalid category: ${category}` });
  }

  try {
    const mainPicture = req.file ? `/uploads/${req.file.filename}` : null;

    const newBlog = await Blog.create({
      title,
      content,
      author,
      category: categoryMap[category], // ✅ Store correct title-case category
      featured: Boolean(featured),
      mainPicture,
    });

    console.log("✅ Blog Created:", newBlog.title);

    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.error("[Error Creating Blog]:", error.message);
    res.status(500).json({ message: "Server error creating blog." });
  }
};

// ✅ Get blogs by category with pagination (Fixes Title Case Issues)
const getBlogsByCategory = async (req, res) => {
  try {
    let { category } = req.params;
    category = category.toUpperCase();

    console.log(`🛠️ [Backend] Fetching blogs for category: ${category}`);

    if (!categoryMap[category]) {
      return res.status(400).json({ message: `Invalid category: ${category}` });
    }

    const formattedCategory = categoryMap[category];
    const { page = 1, limit = 10 } = req.query;

    const blogs = await Blog.find({ category: formattedCategory })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalBlogs = await Blog.countDocuments({ category: formattedCategory });

    console.log(`✅ Blogs Found for ${formattedCategory}: ${totalBlogs}`);

    res.status(200).json({
      category: formattedCategory,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalBlogs / limit),
      totalBlogs,
      blogs,
    });
  } catch (error) {
    console.error("[Error Fetching Blogs By Category]:", error.message);
    res.status(500).json({ message: "Server error fetching blogs by category." });
  }
};

// ✅ Get featured blogs (For Hero Section)
const getFeaturedBlogs = async (req, res) => {
  try {
    console.log("🛠️ [Backend] Fetching featured blogs...");

    const blogs = await Blog.find({ featured: true });

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No featured blogs found." });
    }

    console.log("✅ Featured Blog Fetched:", blogs[0]);

    res.status(200).json(blogs);
  } catch (error) {
    console.error("[Error Fetching Featured Blogs]:", error.message);
    res.status(500).json({ message: "Server error fetching featured blogs." });
  }
};

// ✅ Get a blog by ID
const getBlogById = async (req, res) => {
  try {
    console.log(`🛠️ [Backend] Fetching blog with ID: ${req.params.id}`);

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("✅ Blog Fetched:", blog.title);

    res.status(200).json(blog);
  } catch (error) {
    console.error("[Error Fetching Blog By ID]:", error.message);
    res.status(500).json({ message: "Server error fetching blog by ID." });
  }
};

// ✅ Update a blog
const updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("✅ Blog Updated:", updatedBlog.title);

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("[Error Updating Blog]:", error.message);
    res.status(500).json({ message: "Server error updating blog." });
  }
};

// ✅ Delete a blog
const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("✅ Blog Deleted:", deletedBlog.title);

    res.status(200).json({ message: "Blog deleted" });
  } catch (error) {
    console.error("[Error Deleting Blog]:", error.message);
    res.status(500).json({ message: "Server error deleting blog." });
  }
};

module.exports = {
  upload,
  getAllBlogs,
  createBlog,
  getBlogsByCategory,
  getFeaturedBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
