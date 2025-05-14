const roleAuth = (allowedRoles) => {
    return (req, res, next) => {
        try {
            console.log('Role auth middleware - User:', req.user);
            console.log('Allowed roles:', allowedRoles);
            
            if (!req.user) {
                console.log('No user found in request');
                return res.status(401).json({ message: 'Authentication required' });
            }

            if (!allowedRoles.includes(req.user.role)) {
                console.log('User role not allowed:', {
                    userRole: req.user.role,
                    allowedRoles: allowedRoles
                });
                return res.status(403).json({ 
                    message: 'Access denied. Insufficient permissions.',
                    requiredRoles: allowedRoles,
                    currentRole: req.user.role
                });
            }

            console.log('Role auth successful for user:', req.user._id);
            next();
        } catch (error) {
            console.error('Role auth middleware error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
};

module.exports = { roleAuth }; 