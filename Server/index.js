const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const passport = require('passport')
const session = require('express-session')
const path = require('path')
const fs = require('fs')

// Load environment variables using absolute path
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug: Log environment variables
console.log('\nEnvironment variables loaded:');
console.log('GOOGLE_ID:', process.env.GOOGLE_ID);
console.log('GOOGLE_SECRET:', process.env.GOOGLE_SECRET);

const app = express()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
}

// Session configuration
app.use(session({
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// CORS configuration
app.use(cors({
  origin: 'https://nitm-content-platform.netlify.app' // your Netlify frontend
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    next();
});

// Initialize Passport and restore authentication state from session
app.use(passport.initialize())
app.use(passport.session())

// Only require passport config after session is set up
require('./config/passport')

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// MongoDB Connection with retry logic
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shyampandey2625:QZsczPc9HkVfnvuT@cluster0.rqsoerm.mongodb.net/nit-meghalaya-portal', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log('MongoDB Connected Successfully');
        return conn;
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        // Retry connection after 5 seconds
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

// Routes
const authRoutes = require('./routes/auth')
const contentRoutes = require('./routes/content')
const discussionRoutes = require('./routes/discussion')
const calendarRoutes = require('./routes/calendar')
const opportunityRoutes = require('./routes/opportunity')
const chatRoutes = require('./routes/chat')

// Debug: Log all registered routes
console.log('\nRegistering routes:');
console.log('Auth routes:', authRoutes.stack.map(r => `${Object.keys(r.route.methods)} ${r.route.path}`));

app.use('/api/auth', authRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/discussions', discussionRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/opportunities', opportunityRoutes)
app.use('/api/chats', chatRoutes)

// Add a catch-all route for debugging
app.use((req, res, next) => {
    console.log('Unhandled route:', req.method, req.url);
    next();
});

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to NIT Meghalaya Content Sharing Portal API' })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../Client/DC++/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../Client/DC++/build/index.html'));
    });
}

const PORT = process.env.PORT || 5000

// Start server only after MongoDB connection is established
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    });
}).catch(err => {
    console.error('Failed to start server:', err);
});