const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Add connection error handling
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    enrollmentNumber: {
        type: String,
        unique: true,
        sparse: true,
        required: false
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        }
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        required: true
    },
    program: {
        type: String,
        required: function() {
            return ['student', 'faculty'].includes(this.role) && !this.googleId;
        }
    },
    branch: {
        type: String,
        required: function() {
            return ['student', 'faculty'].includes(this.role) && !this.googleId;
        }
    },
    semester: {
        type: Number,
        min: 1,
        max: 8,
        required: false
    },
    bio: {
        type: String,
        default: ''
    },
    googleId: {
        type: String,
        sparse: true
    },
    profilePicture: {
        type: String
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    achievements: [{
        title: String,
        description: String,
        date: Date,
        category: {
            type: String,
            enum: ['academic', 'sports', 'cultural', 'technical', 'other']
        },
        certificateUrl: String
    }],
    skills: [{
        name: String,
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert']
        }
    }],
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String
    }
}, {
    timestamps: true
});

// Generate enrollment number before saving
userSchema.pre('save', async function(next) {
    try {
        // Only generate enrollment number for new student users
        if (this.isNew && this.role === 'student') {
            // Get current year
            const year = new Date().getFullYear().toString().slice(-2);
            
            // Get branch code
            const branchCode = this.branch.slice(0, 2).toUpperCase();
            
            // Get program code
            const programCode = this.program === 'B.Tech' ? 'BT' : 
                              this.program === 'M.Tech' ? 'MT' : 'PH';
            
            // Get count of students in this year
            const count = await this.constructor.countDocuments({
                role: 'student',
                enrollmentNumber: new RegExp(`^${year}${programCode}${branchCode}`)
            });
            
            // Generate enrollment number: YYPPBBXXXX
            // YY: Year, PP: Program, BB: Branch, XXXX: Sequential number
            this.enrollmentNumber = `${year}${programCode}${branchCode}${(count + 1).toString().padStart(4, '0')}`;
            console.log('Generated enrollment number:', this.enrollmentNumber);
        }
        next();
    } catch (error) {
        console.error('Error generating enrollment number:', error);
        next(error);
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ enrollmentNumber: 1 });

module.exports = mongoose.model('User', userSchema); 