const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');
const Calendar = require('../models/Calendar');

// Get all events
router.get('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, type, category } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate) };
            query.endDate = { $lte: new Date(endDate) };
        }

        if (type) query.type = type;
        if (category) query.category = category;

        const events = await Calendar.find(query)
            .populate('organizer', 'name email')
            .sort({ startDate: 1 });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get event by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const event = await Calendar.findById(req.params.id)
            .populate('organizer', 'name email');
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create event
router.post('/', auth, roleAuth(['admin', 'faculty']), [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('type').isIn(['academic', 'fest', 'holiday', 'exam', 'other']).withMessage('Invalid event type'),
    body('category').isIn(['all', 'student', 'faculty', 'admin']).withMessage('Invalid category')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            description,
            startDate,
            endDate,
            type,
            category,
            program,
            branch,
            semester,
            location,
            isRecurring,
            recurrencePattern,
            recurrenceEndDate
        } = req.body;

        const event = new Calendar({
            title,
            description,
            startDate,
            endDate,
            type,
            category,
            program,
            branch,
            semester,
            location,
            isRecurring,
            recurrencePattern,
            recurrenceEndDate,
            organizer: req.user._id
        });

        await event.save();
        await event.populate('organizer', 'name email');

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update event
router.put('/:id', auth, roleAuth(['admin', 'faculty']), [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('type').optional().isIn(['academic', 'fest', 'holiday', 'exam', 'other']).withMessage('Invalid event type'),
    body('category').optional().isIn(['all', 'student', 'faculty', 'admin']).withMessage('Invalid category')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const event = await Calendar.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is admin or organizer
        if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const {
            title,
            description,
            startDate,
            endDate,
            type,
            category,
            program,
            branch,
            semester,
            location,
            isRecurring,
            recurrencePattern,
            recurrenceEndDate
        } = req.body;

        const updateData = {};

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (startDate) updateData.startDate = startDate;
        if (endDate) updateData.endDate = endDate;
        if (type) updateData.type = type;
        if (category) updateData.category = category;
        if (program) updateData.program = program;
        if (branch) updateData.branch = branch;
        if (semester) updateData.semester = semester;
        if (location) updateData.location = location;
        if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
        if (recurrencePattern) updateData.recurrencePattern = recurrencePattern;
        if (recurrenceEndDate) updateData.recurrenceEndDate = recurrenceEndDate;

        const updatedEvent = await Calendar.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('organizer', 'name email');

        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete event
router.delete('/:id', auth, roleAuth(['admin', 'faculty']), async (req, res) => {
    try {
        const event = await Calendar.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is admin or organizer
        if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 