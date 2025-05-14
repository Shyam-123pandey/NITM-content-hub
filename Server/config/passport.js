const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Check if required environment variables are set
if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
    console.error('Google OAuth credentials are missing. Please set GOOGLE_ID and GOOGLE_SECRET in your .env file');
    process.exit(1);
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: 'https://nitm-content-hub-1.onrender.com/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('Google profile:', profile);

                // Check if user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    console.log('Existing user found:', user.email);
                    return done(null, user);
                }

                // Check if user exists with the same email
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Update existing user with Google ID
                    console.log('Updating existing user with Google ID:', user.email);
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                console.log('Creating new user:', profile.emails[0].value);
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    role: 'student', // Default role for Google sign-in
                    profilePicture: profile.photos[0].value,
                    // These fields are optional for Google OAuth users
                    program: 'Not Specified',
                    branch: 'Not Specified'
                });

                await user.save();
                return done(null, user);
            } catch (error) {
                console.error('Google OAuth error:', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport; 