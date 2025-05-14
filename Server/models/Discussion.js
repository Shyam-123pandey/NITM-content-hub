const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const discussionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'academic', 'technical', 'other'],
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorRole: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        default: 'student'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String
    }],
    views: {
        type: Number,
        default: 0
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: {
        type: Number,
        default: 0
    },
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
discussionSchema.index({ category: 1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
discussionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion; 