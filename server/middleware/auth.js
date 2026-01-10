// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Please login to access this resource' });
};

// Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({ 
        message: 'You do not have permission to access this resource' 
      });
    }
    
    next();
  };
};

// Check if user is a buyer
const isBuyer = requireRole('buyer', 'admin');

// Check if user is a vendor
const isVendor = requireRole('vendor');

// Check if user is an admin
const isAdmin = requireRole('admin');

// Check if user is approved
const isApproved = async (req, res, next) => {
  const User = require('../models/User');
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.isApproved && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Your account is pending approval' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  isAuthenticated,
  requireRole,
  isBuyer,
  isVendor,
  isAdmin,
  isApproved
};
