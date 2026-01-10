const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/audit');

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalUsers,
      pendingApprovals,
      totalTenders,
      activeTenders,
      closingToday,
      awardedToday,
      totalBids
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ isApproved: false, role: { $ne: 'admin' } }),
      RFQ.countDocuments(),
      RFQ.countDocuments({ status: 'open' }),
      RFQ.countDocuments({ 
        status: 'open',
        closingDate: { $gte: today, $lt: tomorrow }
      }),
      RFQ.countDocuments({ 
        status: 'awarded',
        awardedAt: { $gte: today, $lt: tomorrow }
      }),
      Bid.countDocuments()
    ]);

    // Get users by role
    const usersByRole = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get tenders by status
    const tendersByStatus = await RFQ.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get recent activity
    const recentActivity = await AuditLog.find()
      .populate('user', 'email companyName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        pendingApprovals,
        totalTenders,
        activeTenders,
        closingToday,
        awardedToday,
        totalBids
      },
      usersByRole: usersByRole.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
      tendersByStatus: tendersByStatus.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
      recentActivity
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    let query = { role: { $ne: 'admin' } };

    if (role) query.role = role;
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (status === 'suspended') query.isActive = false;

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/approve - Approve user
router.put('/users/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    await user.save();

    // Notify user
    await Notification.create({
      user: user._id,
      type: 'account_approved',
      title: 'Account Approved',
      message: 'Your account has been approved. You can now use all features.',
      actionUrl: '/dashboard'
    });

    await createAuditLog(
      req,
      'user_approve',
      `Approved user: ${user.email}`,
      'User',
      user._id
    );

    res.json({ message: 'User approved successfully', user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/reject - Reject user
router.put('/users/:id/reject', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = false;
    user.isActive = false;
    await user.save();

    await createAuditLog(
      req,
      'user_reject',
      `Rejected user: ${user.email}. Reason: ${reason}`,
      'User',
      user._id
    );

    res.json({ message: 'User rejected', user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/suspend - Suspend user
router.put('/users/:id/suspend', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    await createAuditLog(
      req,
      'user_suspend',
      `Suspended user: ${user.email}. Reason: ${reason}`,
      'User',
      user._id
    );

    res.json({ message: 'User suspended', user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/activate - Reactivate user
router.put('/users/:id/activate', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: 'User activated', user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/kyc - Get pending KYC verifications
router.get('/kyc', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find({
      'verificationDocuments.status': 'pending'
    }).select('companyName email verificationDocuments');

    res.json({ users });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/kyc/:userId/:docIndex/approve - Approve KYC document
router.put('/kyc/:userId/:docIndex/approve', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const docIndex = Number(req.params.docIndex);
    if (!user.verificationDocuments[docIndex]) {
      return res.status(404).json({ message: 'Document not found' });
    }

    user.verificationDocuments[docIndex].status = 'approved';
    user.verifiedBadge = true;
    user.isVerified = true;
    await user.save();

    // Notify user
    await Notification.create({
      user: user._id,
      type: 'kyc_approved',
      title: 'Verification Approved',
      message: 'Your business has been verified. You now have a Verified Supplier badge!',
      actionUrl: '/profile'
    });

    await createAuditLog(
      req,
      'kyc_approve',
      `Approved KYC for: ${user.email}`,
      'User',
      user._id
    );

    res.json({ message: 'KYC approved', user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/kyc/:userId/:docIndex/reject - Reject KYC document
router.put('/kyc/:userId/:docIndex/reject', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const docIndex = Number(req.params.docIndex);
    if (!user.verificationDocuments[docIndex]) {
      return res.status(404).json({ message: 'Document not found' });
    }

    user.verificationDocuments[docIndex].status = 'rejected';
    await user.save();

    // Notify user
    await Notification.create({
      user: user._id,
      type: 'kyc_rejected',
      title: 'Verification Rejected',
      message: `Your document was rejected. Reason: ${reason}. Please upload a new document.`,
      actionUrl: '/profile'
    });

    await createAuditLog(
      req,
      'kyc_reject',
      `Rejected KYC for: ${user.email}. Reason: ${reason}`,
      'User',
      user._id
    );

    res.json({ message: 'KYC rejected', user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/audit-logs - Get audit logs
router.get('/audit-logs', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { action, userId, page = 1, limit = 50 } = req.query;

    let query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'email companyName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      logs,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/create - Create admin user (protected - first run only)
router.post('/create', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin already exists. Use admin login.' 
      });
    }

    const { email, password, companyName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password required' 
      });
    }

    const admin = new User({
      email,
      password,
      role: 'admin',
      companyName: companyName || 'BidSync Admin',
      contactPerson: 'System Admin',
      phone: '0000000000',
      isApproved: true,
      isActive: true,
      verifiedBadge: true
    });

    await admin.save();

    res.status(201).json({ 
      message: 'Admin created successfully',
      email: admin.email
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
