const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Create a new chat room
router.post('/', auth, [
    body('name').notEmpty().withMessage('Chat name is required'),
    body('type').isIn(['general', 'academic', 'project', 'achievement', 'resource', 'mentorship'])
        .withMessage('Invalid chat type'),
    body('category').isIn(['all', 'program', 'branch', 'semester', 'faculty'])
        .withMessage('Invalid category'),
    body('description').optional(),
    body('rules').optional().isArray(),
    body('rules.*.title').optional().notEmpty(),
    body('rules.*.description').optional().notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, type, category, description, rules, program, branch, semester } = req.body;

        // Create chat room
        const chat = new Chat({
            name,
            type,
            category,
            description,
            rules,
            program,
            branch,
            semester,
            members: [{ user: req.user._id, role: 'admin' }]
        });

        await chat.save();
        await chat.populate('members.user', 'name email role');

        res.status(201).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all chat rooms for a user
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const query = { isActive: true };

        // Filter based on user's program, branch, and semester
        if (user.role === 'student') {
            query.$or = [
                { category: 'all' },
                { 
                    category: 'program',
                    program: user.program
                },
                {
                    category: 'branch',
                    program: user.program,
                    branch: user.branch
                },
                {
                    category: 'semester',
                    program: user.program,
                    branch: user.branch,
                    semester: user.semester
                }
            ];
        }

        const chats = await Chat.find(query)
            .populate('members.user', 'name email role')
            .sort('-createdAt');

        res.json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a specific chat room
router.get('/:id', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate('members.user', 'name email role')
            .populate('messages.sender', 'name email role');

        if (!chat) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Check if user is a member
        const isMember = chat.members.some(m => m.user._id.toString() === req.user._id);
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized to access this chat room' });
        }

        res.json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/:id/messages', auth, [
    body('content').notEmpty().withMessage('Message content is required'),
    body('type').isIn(['text', 'image', 'file', 'achievement', 'resource'])
        .withMessage('Invalid message type'),
    body('tags').optional().isArray(),
    body('isAnnouncement').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Check if user is a member
        const member = chat.members.find(m => m.user.toString() === req.user._id);
        if (!member) {
            return res.status(403).json({ message: 'Not authorized to send messages in this chat room' });
        }

        // Check if user can make announcements
        if (req.body.isAnnouncement && !['admin', 'moderator'].includes(member.role)) {
            return res.status(403).json({ message: 'Not authorized to make announcements' });
        }

        const message = {
            sender: req.user._id,
            content: req.body.content,
            type: req.body.type,
            fileUrl: req.body.fileUrl,
            tags: req.body.tags || [],
            isAnnouncement: req.body.isAnnouncement || false
        };

        chat.messages.push(message);
        await chat.save();

        // Populate sender info
        const populatedMessage = chat.messages[chat.messages.length - 1];
        await populatedMessage.populate('sender', 'name email role');

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// React to a message
router.post('/:id/messages/:messageId/reactions', auth, [
    body('type').isIn(['like', 'insightful', 'helpful', 'motivating'])
        .withMessage('Invalid reaction type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        const message = chat.messages.id(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Remove existing reaction from the same user
        message.reactions = message.reactions.filter(
            r => r.user.toString() !== req.user._id
        );

        // Add new reaction
        message.reactions.push({
            user: req.user._id,
            type: req.body.type
        });

        await chat.save();
        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Pin/Unpin a message
router.patch('/:id/messages/:messageId/pin', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Check if user is admin or moderator
        const member = chat.members.find(m => m.user.toString() === req.user._id);
        if (!member || !['admin', 'moderator'].includes(member.role)) {
            return res.status(403).json({ message: 'Not authorized to pin messages' });
        }

        const message = chat.messages.id(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.isPinned = !message.isPinned;
        if (message.isPinned) {
            await chat.pinMessage(message._id);
        } else {
            await chat.unpinMessage(message._id);
        }

        await chat.save();
        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Join a chat room
router.post('/:id/join', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        await chat.addMember(req.user._id);
        await chat.populate('members.user', 'name email role');

        res.json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Leave a chat room
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Check if user is the last admin
        const isLastAdmin = chat.members.filter(m => m.role === 'admin').length === 1 &&
            chat.members.find(m => m.user.toString() === req.user._id)?.role === 'admin';

        if (isLastAdmin) {
            return res.status(400).json({ message: 'Cannot leave as the last admin. Transfer admin role first.' });
        }

        await chat.removeMember(req.user._id);
        res.json({ message: 'Successfully left the chat room' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 