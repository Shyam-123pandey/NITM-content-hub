const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['document', 'video', 'image', 'link']
    },
    category: {
        type: String,
        required: true,
        enum: ['academic', 'research', 'project', 'other']
    },
    fileUrl: {
        type: String,
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
contentSchema.index({ type: 1, category: 1 });
contentSchema.index({ author: 1 });
contentSchema.index({ createdAt: -1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content; 