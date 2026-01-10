const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Rating = require('../models/Rating');
const { isAuthenticated, isApproved } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/audit');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `kyc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
  }
});

// GET /api/user/profile - Get current user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/user/profile - Update profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedUpdates = [
      'companyName', 'contactPerson', 'phone', 'address',
      'businessCategory', 'vatNumber', 'isVATRegistered'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({ message: 'Profile updated successfully', user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/user/kyc - Upload KYC document
router.post('/kyc', isAuthenticated, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a document' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verificationDocuments.push({
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
      status: 'pending'
    });

    await user.save();

    res.json({ 
      message: 'Document uploaded successfully. Pending admin verification.',
      document: user.verificationDocuments[user.verificationDocuments.length - 1]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/user/vendors - Search vendors (for private tender invites)
router.get('/vendors', isAuthenticated, async (req, res) => {
  try {
    const { search, category, verified } = req.query;

    let query = { role: 'vendor', isActive: true, isApproved: true };

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.businessCategory = category;
    }

    if (verified === 'true') {
      query.verifiedBadge = true;
    }

    const vendors = await User.find(query)
      .select('companyName businessCategory rating verifiedBadge')
      .limit(20);

    res.json({ vendors });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/user/vendor/:id - Get vendor public profile
router.get('/vendor/:id', async (req, res) => {
  try {
    const vendor = await User.findOne({ 
      _id: req.params.id, 
      role: 'vendor' 
    }).select('companyName businessCategory rating verifiedBadge createdAt');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get recent ratings
    const ratings = await Rating.find({ vendor: req.params.id, isPublic: true })
      .populate('buyer', 'companyName')
      .populate('rfq', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ vendor, ratings });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/user/rate/:vendorId - Rate a vendor
router.post('/rate/:vendorId', isAuthenticated, isApproved, async (req, res) => {
  try {
    const {
      rfqId,
      bidId,
      overallRating,
      qualityRating,
      deliveryRating,
      communicationRating,
      valueRating,
      review
    } = req.body;

    // Validate
    if (!rfqId || !bidId || !overallRating) {
      return res.status(400).json({
        message: 'RFQ ID, Bid ID, and overall rating are required'
      });
    }

    if (overallRating < 1 || overallRating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user is a buyer
    if (req.session.userRole !== 'buyer' && req.session.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only buyers can rate vendors' });
    }

    // Create rating
    const rating = new Rating({
      vendor: req.params.vendorId,
      buyer: req.session.userId,
      rfq: rfqId,
      bid: bidId,
      overallRating,
      qualityRating,
      deliveryRating,
      communicationRating,
      valueRating,
      review
    });

    await rating.save();

    res.status(201).json({ message: 'Rating submitted successfully', rating });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already rated this vendor for this tender'
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/user/password - Change password
router.put('/password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.session.userId);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await createAuditLog(
      req,
      'password_change',
      'Password changed',
      'User',
      user._id
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
