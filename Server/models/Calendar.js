const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['academic', 'fest', 'holiday', 'exam', 'other'],
        required: true
    },
    category: {
        type: String,
        enum: ['all', 'student', 'faculty', 'admin'],
        required: true
    },
    program: {
        type: String
    },
    branch: {
        type: String
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    location: {
        type: String
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    recurrenceEndDate: {
        type: Date
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
calendarSchema.index({ startDate: 1 });
calendarSchema.index({ endDate: 1 });
calendarSchema.index({ type: 1 });
calendarSchema.index({ category: 1 });
calendarSchema.index({ organizer: 1 });

module.exports = mongoose.model('Calendar', calendarSchema); 