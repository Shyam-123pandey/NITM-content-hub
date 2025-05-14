const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['internship', 'job', 'workshop', 'competition', 'other'],
        required: true
    },
    program: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    requirements: [{
        type: String,
        required: true
    }],
    location: {
        type: String
    },
    stipend: {
        type: String
    },
    duration: {
        type: String
    },
    maxParticipants: {
        type: Number
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'completed'],
        default: 'open'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['applied', 'selected', 'rejected'],
            default: 'applied'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add indexes for better query performance
opportunitySchema.index({ type: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ program: 1 });
opportunitySchema.index({ branch: 1 });
opportunitySchema.index({ organizer: 1 });
opportunitySchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema); 