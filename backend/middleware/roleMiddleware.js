/**
 * Role-based access control middleware.
 * Usage: requireRole('admin') or requireRole('researcher', 'admin')
 * @param {...string} roles
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
        next();
    };
}

module.exports = requireRole;
