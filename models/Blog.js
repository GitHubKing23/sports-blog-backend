const mongoose = require('mongoose');

// Define the Blog Schema
const blogSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        content: {
            type: String,
            required: [true, 'Please add content'],
        },
        author: {
            type: String,
            default: 'Anonymous',
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
            enum: ['NBA', 'NHL', 'NFL', 'MLB', 'Footy', 'Esport'],
        },
        featured: {
            type: Boolean,
            default: false,
        },
        mainPicture: {
            type: String,
            required: [true, 'Please provide a URL for the main picture'],
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
);

module.exports = mongoose.model('Blog', blogSchema);
