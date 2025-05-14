const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Test route
router.get('/', (req, res) => {
    res.json({ message: 'Test route is working' });
});

// Test database connection
router.get('/db', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        res.json({ 
            message: 'Database connection test',
            state: states[dbState],
            readyState: dbState
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Database connection error',
            error: error.message
        });
    }
});

module.exports = router; 