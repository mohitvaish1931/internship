import User from '../models/User.js';

// Simple Authentication Middleware (Checks x-user-id header)
export const requireAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required. Missing user session.' });
    }

    // Lookup user in MongoDB
    const user = await User.findById(userId).populate('batch');
    
    if (!user) {
      return res.status(401).json({ message: 'User session not found.' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error during session verification.' });
  }
};

// Admin Only Role Check Middleware
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
  }
  next();
};
