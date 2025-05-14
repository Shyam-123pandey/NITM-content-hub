const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Debug middleware for auth routes
router.use((req, res, next) => {
    console.log('Auth Route:', req.method, req.url);
    console.log('Request body:', req.body);
    next();
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('role').optional().isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
    body('program').optional().notEmpty().withMessage('Program cannot be empty'),
    body('branch').optional().notEmpty().withMessage('Branch cannot be empty'),
    body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    body('bio').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, role, program, branch, semester, bio } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (program) updateData.program = program;
        if (branch) updateData.branch = branch;
        if (semester) updateData.semester = semester;
        if (bio !== undefined) updateData.bio = bio;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update password
router.put('/password', auth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has a password (not a Google OAuth user)
        if (!user.password) {
            return res.status(400).json({ message: 'Password change not allowed for Google OAuth users' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register route
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
    body('program').if(body('role').isIn(['student', 'faculty'])).notEmpty().withMessage('Program is required'),
    body('branch').if(body('role').isIn(['student', 'faculty'])).notEmpty().withMessage('Branch is required'),
    body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
], async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);
        
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { 
            name, 
            email, 
            password, 
            role, 
            program, 
            branch, 
            semester 
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role,
            program,
            branch,
            semester: semester ? parseInt(semester) : undefined
        });

        // Save user (this will trigger the pre-save middleware to generate enrollment number)
        await user.save();
        console.log('User created successfully:', user);

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                enrollmentNumber: user.enrollmentNumber,
                program: user.program,
                branch: user.branch,
                semester: user.semester
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error creating user',
            error: error.message
        });
    }
});

// Login route
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Set CORS headers
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                enrollmentNumber: user.enrollmentNumber,
                program: user.program,
                branch: user.branch,
                semester: user.semester
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Google OAuth routes
router.get('/google',
    (req, res, next) => {
        console.log('Initiating Google OAuth login');
        passport.authenticate('google', { 
            scope: ['profile', 'email'],
            session: false
        })(req, res, next);
    }
);

router.get('/google/callback',
    (req, res, next) => {
        console.log('Received Google OAuth callback');
        passport.authenticate('google', { 
            failureRedirect: '/login',
            session: false
        })(req, res, next);
    },
    async (req, res) => {
        try {
            console.log('Processing Google OAuth callback');
            if (!req.user) {
                throw new Error('No user found after Google authentication');
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: req.user._id, 
                    role: req.user.role,
                    email: req.user.email
                },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '24h' }
            );

            // Redirect to frontend with token
            const redirectUrl = `http://localhost:5173/auth/google?token=${token}`;
            console.log('Redirecting to:', redirectUrl);
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`http://localhost:5173/login?error=google_auth_failed`);
        }
    }
);

// Create test user route
router.post('/create-test-user', async (req, res) => {
    try {
        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            return res.json({ message: 'Test user already exists' });
        }

        // Create test user
        const testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'student',
            program: 'B.Tech',
            branch: 'CSE',
            semester: 1
        });

        await testUser.save();
        res.json({ message: 'Test user created successfully' });
    } catch (error) {
        console.error('Create test user error:', error);
        res.status(500).json({ message: 'Error creating test user' });
    }
});

module.exports = router; 