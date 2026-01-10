const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { createAuditLog } = require('../middleware/audit');

// POST /api/auth/signup - Register new user
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role, 
      companyName, 
      contactPerson, 
      phone,
      address,
      businessCategory,
      businessRegistrationNumber,
      vatNumber,
      isVATRegistered
    } = req.body;

    // Validate required fields
    if (!email || !password || !role || !companyName || !contactPerson || !phone) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Validate role
    if (!['buyer', 'vendor'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be buyer or vendor' 
      });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      companyName,
      contactPerson,
      phone,
      address: address || {},
      businessCategory: role === 'vendor' ? businessCategory || [] : [],
      businessRegistrationNumber: role === 'vendor' ? businessRegistrationNumber : undefined,
      vatNumber: role === 'vendor' ? vatNumber : undefined,
      isVATRegistered: role === 'vendor' ? isVATRegistered : false,
      isApproved: false // Requires admin approval
    });

    await user.save();

    // Create audit log
    await createAuditLog(
      req,
      'signup',
      `New ${role} account created: ${companyName}`,
      'User',
      user._id
    );

    res.status(201).json({
      message: 'Account created successfully. Pending admin approval.',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check role if provided
    if (role && user.role !== role) {
      return res.status(401).json({ 
        message: `No ${role} account found with this email` 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been suspended' 
      });
    }

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.companyName = user.companyName;

    // Create audit log
    await createAuditLog(
      req,
      'login',
      `User logged in: ${user.email}`,
      'User',
      user._id
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        isApproved: user.isApproved,
        isVerified: user.verifiedBadge
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/admin/login - Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    req.session.userId = user._id;
    req.session.userRole = 'admin';
    req.session.companyName = user.companyName;

    await createAuditLog(
      req,
      'login',
      `Admin logged in: ${user.email}`,
      'User',
      user._id
    );

    res.json({
      message: 'Admin login successful',
      user: {
        id: user._id,
        email: user.email,
        role: 'admin',
        companyName: user.companyName
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req, res) => {
  try {
    if (req.session.userId) {
      await createAuditLog(
        req,
        'logout',
        'User logged out',
        'User',
        req.session.userId
      );
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/check - Check authentication status
router.get('/check', (req, res) => {
  if (req.session.userId) {
    res.json({
      isAuthenticated: true,
      userId: req.session.userId,
      role: req.session.userRole,
      companyName: req.session.companyName
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

module.exports = router;
