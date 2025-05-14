const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Discussion = require('../models/Discussion');

// Get all discussions
router.get('/', auth, async (req, res) => {
    try {
        const { category } = req.query;
        const query = {};

        if (category) query.category = category;

        const discussions = await Discussion.find(query)
            .populate('author', 'name email')
            .populate('comments.author', 'name email')
            .sort({ createdAt: -1 });
        res.json(discussions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get discussion by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id)
            .populate('author', 'name email')
            .populate('comments.author', 'name email');
        
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        // Increment views
        discussion.views += 1;
        await discussion.save();
        
        res.json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create discussion
router.post('/', auth, [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').isIn(['general', 'academic', 'technical', 'other']).withMessage('Invalid category')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content, category } = req.body;

        const discussion = new Discussion({
            title,
            content,
            category,
            author: req.user._id
        });

        await discussion.save();
        await discussion.populate('author', 'name email');

        res.status(201).json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add comment to discussion
router.post('/:id/comments', auth, [
    body('content').notEmpty().withMessage('Comment content is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const discussion = await Discussion.findById(req.params.id);
        
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        discussion.comments.push({
            content: req.body.content,
            author: req.user._id
        });

        await discussion.save();
        await discussion.populate('comments.author', 'name email');

        res.json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update discussion
router.put('/:id', auth, [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('category').optional().isIn(['general', 'academic', 'technical', 'other']).withMessage('Invalid category')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const discussion = await Discussion.findById(req.params.id);
        
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        // Check if user is author
        if (discussion.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, content, category } = req.body;

        const updateData = {};

        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (category) updateData.category = category;

        const updatedDiscussion = await Discussion.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('author', 'name email')
         .populate('comments.author', 'name email');

        res.json(updatedDiscussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update comment
router.put('/:id/comments/:commentId', auth, [
    body('content').notEmpty().withMessage('Comment content is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const discussion = await Discussion.findById(req.params.id);
        
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        const comment = discussion.comments.id(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is comment author
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        comment.content = req.body.content;
        await discussion.save();
        await discussion.populate('comments.author', 'name email');

        res.json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete discussion
router.delete('/:id', auth, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        // Check if user is author
        if (discussion.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await discussion.deleteOne();
        res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete comment
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        const comment = discussion.comments.id(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is comment author
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        comment.deleteOne();
        await discussion.save();
        await discussion.populate('comments.author', 'name email');

        res.json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 