const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
};

const requireSeller = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Seller access required' });
    }

    next();
};

const requireBuyer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'buyer') {
        return res.status(403).json({ message: 'Buyer access required' });
    }

    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};

module.exports = {
    requireRole,
    requireSeller,
    requireBuyer,
    requireAdmin
};
