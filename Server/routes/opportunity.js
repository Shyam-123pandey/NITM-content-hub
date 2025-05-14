const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');
const Opportunity = require('../models/Opportunity');
const { body, validationResult } = require('express-validator');

// Get all opportunities
router.get('/', auth, async (req, res) => {
    try {
        const { type, status, program, branch } = req.query;
        const query = {};

        if (type) query.type = type;
        if (status) query.status = status;
        if (program) query.program = program;
        if (branch) query.branch = branch;

        const opportunities = await Opportunity.find(query)
            .populate('organizer', 'name email')
            .populate('participants.user', 'name email')
            .sort({ createdAt: -1 });
        res.json(opportunities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get opportunity by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('participants.user', 'name email');
        
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }
        
        res.json(opportunity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create opportunity
router.post('/', auth, roleAuth(['admin', 'faculty']), [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn(['internship', 'job', 'workshop', 'competition', 'other']).withMessage('Invalid opportunity type'),
    body('program').notEmpty().withMessage('Program is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('deadline').isISO8601().withMessage('Valid deadline is required'),
    body('requirements').isArray().withMessage('Requirements must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            description,
            type,
            program,
            branch,
            deadline,
            requirements,
            location,
            stipend,
            duration,
            maxParticipants
        } = req.body;

        const opportunity = new Opportunity({
            title,
            description,
            type,
            program,
            branch,
            deadline,
            requirements,
            location,
            stipend,
            duration,
            maxParticipants,
            organizer: req.user._id,
            status: 'open'
        });

        await opportunity.save();
        await opportunity.populate('organizer', 'name email');

        res.status(201).json(opportunity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Apply for opportunity
router.post('/:id/apply', auth, async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        if (opportunity.status !== 'open') {
            return res.status(400).json({ message: 'Opportunity is not open for applications' });
        }

        // Check if user has already applied
        const hasApplied = opportunity.participants.some(
            p => p.user.toString() === req.user._id.toString()
        );

        if (hasApplied) {
            return res.status(400).json({ message: 'You have already applied for this opportunity' });
        }

        // Check if maximum participants reached
        if (opportunity.maxParticipants && 
            opportunity.participants.length >= opportunity.maxParticipants) {
            return res.status(400).json({ message: 'Maximum number of participants reached' });
        }

        opportunity.participants.push({
            user: req.user._id,
            status: 'applied',
            appliedAt: new Date()
        });

        await opportunity.save();
        await opportunity.populate('participants.user', 'name email');

        res.json(opportunity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update opportunity
router.put('/:id', auth, roleAuth(['admin', 'faculty']), [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('type').optional().isIn(['internship', 'job', 'workshop', 'competition', 'other']).withMessage('Invalid opportunity type'),
    body('program').optional().notEmpty().withMessage('Program cannot be empty'),
    body('branch').optional().notEmpty().withMessage('Branch cannot be empty'),
    body('deadline').optional().isISO8601().withMessage('Valid deadline is required'),
    body('requirements').optional().isArray().withMessage('Requirements must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const opportunity = await Opportunity.findById(req.params.id);
        
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        // Check if user is admin or organizer
        if (req.user.role !== 'admin' && opportunity.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const {
            title,
            description,
            type,
            program,
            branch,
            deadline,
            requirements,
            location,
            stipend,
            duration,
            maxParticipants,
            status
        } = req.body;

        const updateData = {};

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (type) updateData.type = type;
        if (program) updateData.program = program;
        if (branch) updateData.branch = branch;
        if (deadline) updateData.deadline = deadline;
        if (requirements) updateData.requirements = requirements;
        if (location) updateData.location = location;
        if (stipend) updateData.stipend = stipend;
        if (duration) updateData.duration = duration;
        if (maxParticipants) updateData.maxParticipants = maxParticipants;
        if (status) updateData.status = status;

        const updatedOpportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('organizer', 'name email')
         .populate('participants.user', 'name email');

        res.json(updatedOpportunity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update participant status
router.patch('/:id/participants/:userId', auth, roleAuth(['admin', 'faculty']), [
    body('status').isIn(['applied', 'selected', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const opportunity = await Opportunity.findById(req.params.id);
        
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        // Check if user is admin or organizer
        if (req.user.role !== 'admin' && opportunity.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const participant = opportunity.participants.find(
            p => p.user.toString() === req.params.userId
        );

        if (!participant) {
            return res.status(404).json({ message: 'Participant not found' });
        }

        participant.status = req.body.status;
        await opportunity.save();

        res.json(opportunity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete opportunity
router.delete('/:id', auth, roleAuth(['admin', 'faculty']), async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        // Check if user is admin or organizer
        if (req.user.role !== 'admin' && opportunity.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await opportunity.deleteOne();
        res.json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 