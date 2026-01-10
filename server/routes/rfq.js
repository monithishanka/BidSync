const express = require('express');
const router = express.Router();
const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const { isAuthenticated, isBuyer, isApproved } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/audit');

// GET /api/rfq - Get all open RFQs (public)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      status = 'open', 
      search, 
      minBudget, 
      maxBudget,
      district,
      sort = 'closingDate',
      page = 1,
      limit = 12
    } = req.query;

    // Auto-close expired tenders
    await RFQ.closeExpiredTenders();

    // Build query
    let query = { isPrivate: false };
    
    // Status filter - never show cancelled tenders in public browse
    if (status === 'open') {
      query.status = 'open';
      query.closingDate = { $gt: new Date() };
    } else if (status === 'closed') {
      // Include closed and awarded tenders
      query.status = { $in: ['closed', 'awarded'] };
    } else if (status === 'all' || !status) {
      // 'all' or no status - show open, closed, awarded (exclude cancelled)
      query.status = { $in: ['open', 'closed', 'awarded'] };
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minBudget || maxBudget) {
      query.budgetPrice = {};
      if (minBudget) query.budgetPrice.$gte = Number(minBudget);
      if (maxBudget) query.budgetPrice.$lte = Number(maxBudget);
    }

    if (district) {
      query.deliveryLocation = { $regex: district, $options: 'i' };
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'closingDate':
        sortOption = { closingDate: 1 }; // Closing soonest
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'highValue':
        sortOption = { budgetPrice: -1 };
        break;
      default:
        sortOption = { closingDate: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [rfqs, total] = await Promise.all([
      RFQ.find(query)
        .populate('createdBy', 'companyName')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      RFQ.countDocuments(query)
    ]);

    res.json({
      rfqs,
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

// GET /api/rfq/my - Get buyer's RFQs
router.get('/my', isAuthenticated, isBuyer, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { createdBy: req.session.userId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [rfqs, total] = await Promise.all([
      RFQ.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      RFQ.countDocuments(query)
    ]);

    res.json({
      rfqs,
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

// GET /api/rfq/templates - Get RFQ templates
router.get('/templates', isAuthenticated, isBuyer, async (req, res) => {
  try {
    const templates = await RFQ.find({
      createdBy: req.session.userId,
      isTemplate: true
    }).sort({ createdAt: -1 });

    res.json({ templates });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/rfq/categories - Get all categories
router.get('/categories', (req, res) => {
  const categories = [
    'IT & Electronics',
    'Construction & Raw Materials',
    'Office Stationery',
    'Vehicles & Spare Parts',
    'Furniture',
    'Medical Equipment',
    'Catering & Food',
    'Cleaning & Maintenance',
    'Security Services',
    'Printing & Publishing',
    'Consulting Services',
    'Other'
  ];
  res.json({ categories });
});

// GET /api/rfq/:id - Get single RFQ
router.get('/:id', async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('createdBy', 'companyName email phone')
      .populate('awardedTo', 'companyName');

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    // Check if private tender
    if (rfq.isPrivate && req.session.userId) {
      const isInvited = rfq.invitedVendors.includes(req.session.userId);
      const isCreator = rfq.createdBy._id.toString() === req.session.userId;
      
      if (!isInvited && !isCreator && req.session.userRole !== 'admin') {
        return res.status(403).json({ 
          message: 'This is a private tender' 
        });
      }
    }

    // Log view
    if (req.session.userId) {
      await createAuditLog(
        req,
        'rfq_view',
        `Viewed RFQ: ${rfq.referenceId}`,
        'RFQ',
        rfq._id
      );
    }

    res.json({ rfq });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/rfq - Create new RFQ
router.post('/', isAuthenticated, isBuyer, isApproved, async (req, res) => {
  try {
    const {
      title,
      description,
      items,
      category,
      budgetPrice,
      showBudget,
      closingDate,
      isSealed,
      isPrivate,
      invitedVendors,
      deliveryLocation,
      deliveryDeadline,
      termsAndConditions,
      isTemplate,
      templateName,
      status = 'open'
    } = req.body;

    // Validate
    if (!title || !description || !items || !category || !closingDate) {
      return res.status(400).json({
        message: 'Please provide title, description, items, category, and closing date'
      });
    }

    // Validate closing date is in future
    if (new Date(closingDate) <= new Date()) {
      return res.status(400).json({
        message: 'Closing date must be in the future'
      });
    }

    const rfq = new RFQ({
      title,
      description,
      items,
      category,
      budgetPrice: budgetPrice || null,
      showBudget: showBudget || false,
      closingDate,
      isSealed: isSealed !== false, // Default true
      isPrivate: isPrivate || false,
      invitedVendors: invitedVendors || [],
      deliveryLocation,
      deliveryDeadline,
      termsAndConditions,
      isTemplate: isTemplate || false,
      templateName: isTemplate ? templateName : null,
      status,
      createdBy: req.session.userId,
      organization: req.session.companyName
    });

    await rfq.save();

    await createAuditLog(
      req,
      'rfq_create',
      `Created RFQ: ${rfq.referenceId} - ${title}`,
      'RFQ',
      rfq._id
    );

    // Notify invited vendors for private tenders
    if (isPrivate && invitedVendors && invitedVendors.length > 0) {
      const notifications = invitedVendors.map(vendorId => ({
        user: vendorId,
        type: 'private_invite',
        title: 'Private Tender Invitation',
        message: `You have been invited to bid on: ${title}`,
        relatedRFQ: rfq._id,
        actionUrl: `/tenders/${rfq._id}`
      }));
      
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: 'RFQ created successfully',
      rfq
    });

  } catch (error) {
    console.error('Create RFQ error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/rfq/:id - Update RFQ
router.put('/:id', isAuthenticated, isBuyer, async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    // Check ownership
    if (rfq.createdBy.toString() !== req.session.userId && 
        req.session.userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to update this RFQ' 
      });
    }

    // Cannot edit if already has bids (unless draft)
    if (rfq.bidCount > 0 && rfq.status !== 'draft') {
      return res.status(400).json({
        message: 'Cannot edit RFQ that already has bids'
      });
    }

    // Cannot edit closed/awarded
    if (['closed', 'awarded'].includes(rfq.status)) {
      return res.status(400).json({
        message: 'Cannot edit closed or awarded RFQ'
      });
    }

    // Update fields
    const allowedUpdates = [
      'title', 'description', 'items', 'category', 'budgetPrice',
      'showBudget', 'closingDate', 'isSealed', 'isPrivate',
      'invitedVendors', 'deliveryLocation', 'deliveryDeadline',
      'termsAndConditions', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        rfq[field] = req.body[field];
      }
    });

    await rfq.save();

    await createAuditLog(
      req,
      'rfq_update',
      `Updated RFQ: ${rfq.referenceId}`,
      'RFQ',
      rfq._id
    );

    res.json({ message: 'RFQ updated successfully', rfq });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/rfq/:id - Cancel/Delete RFQ
router.delete('/:id', isAuthenticated, isBuyer, async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    if (rfq.createdBy.toString() !== req.session.userId && 
        req.session.userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to delete this RFQ' 
      });
    }

    // If has bids, cancel instead of delete
    if (rfq.bidCount > 0) {
      rfq.status = 'cancelled';
      await rfq.save();

      await createAuditLog(
        req,
        'rfq_cancel',
        `Cancelled RFQ: ${rfq.referenceId}`,
        'RFQ',
        rfq._id
      );

      return res.json({ message: 'RFQ cancelled (had bids)' });
    }

    await RFQ.findByIdAndDelete(req.params.id);

    await createAuditLog(
      req,
      'rfq_delete',
      `Deleted RFQ: ${rfq.referenceId}`,
      'RFQ',
      rfq._id
    );

    res.json({ message: 'RFQ deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/rfq/:id/bids - Get bids for RFQ (sealed until closed)
router.get('/:id/bids', isAuthenticated, async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    // Check if user is the creator
    const isCreator = rfq.createdBy.toString() === req.session.userId;
    const isAdmin = req.session.userRole === 'admin';
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ 
        message: 'Only RFQ creator can view bids' 
      });
    }

    // Get bids
    let bids = await Bid.find({ rfq: req.params.id })
      .populate('vendor', 'companyName rating verifiedBadge')
      .sort({ totalPrice: 1 });

    // Seal bids if tender still open and sealed
    const isStillOpen = rfq.status === 'open' && new Date() < rfq.closingDate;
    
    if (rfq.isSealed && isStillOpen) {
      bids = bids.map(bid => ({
        _id: bid._id,
        vendor: bid.vendor,
        deliveryTimeline: bid.deliveryTimeline,
        warrantyPeriod: bid.warrantyPeriod,
        status: bid.status,
        createdAt: bid.createdAt,
        // Hide pricing
        unitPrice: '***',
        totalPrice: '***',
        vatAmount: '*** (Sealed)',
        isSealed: true
      }));
    } else {
      // Mark as revealed
      await Bid.updateMany(
        { rfq: req.params.id, isRevealed: false },
        { isRevealed: true }
      );

      await createAuditLog(
        req,
        'bids_reveal',
        `Bids revealed for RFQ: ${rfq.referenceId}`,
        'RFQ',
        rfq._id
      );
    }

    res.json({ 
      bids,
      rfq: {
        referenceId: rfq.referenceId,
        title: rfq.title,
        status: rfq.status,
        closingDate: rfq.closingDate,
        isSealed: rfq.isSealed,
        canReveal: !isStillOpen
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/rfq/:id/award - Award tender to vendor
router.post('/:id/award', isAuthenticated, isBuyer, async (req, res) => {
  try {
    const { bidId, remarks } = req.body;

    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    if (rfq.createdBy.toString() !== req.session.userId && 
        req.session.userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to award this RFQ' 
      });
    }

    // Check if can award
    // Sealed tenders: must wait until deadline passes
    // Non-sealed tenders: can award anytime
    const isPastDeadline = new Date() >= new Date(rfq.closingDate);
    
    if (rfq.isSealed && !isPastDeadline && rfq.status === 'open') {
      return res.status(400).json({
        message: 'Sealed tenders cannot be awarded before the deadline. Wait until: ' + new Date(rfq.closingDate).toLocaleString()
      });
    }

    // Find the winning bid
    const winningBid = await Bid.findById(bidId);
    if (!winningBid || winningBid.rfq.toString() !== req.params.id) {
      return res.status(404).json({ message: 'Invalid bid' });
    }

    // Update RFQ
    rfq.status = 'awarded';
    rfq.awardedTo = winningBid.vendor;
    rfq.awardedBid = winningBid._id;
    rfq.awardedAt = new Date();
    rfq.awardRemarks = remarks;
    await rfq.save();

    // Update winning bid
    winningBid.status = 'won';
    await winningBid.save();

    // Update losing bids
    await Bid.updateMany(
      { rfq: req.params.id, _id: { $ne: bidId } },
      { status: 'lost' }
    );

    // Notify winner
    await Notification.create({
      user: winningBid.vendor,
      type: 'tender_awarded',
      title: 'Congratulations! You Won!',
      message: `Your bid for "${rfq.title}" has been accepted!`,
      relatedRFQ: rfq._id,
      relatedBid: winningBid._id,
      actionUrl: `/vendor/bids`
    });

    // Notify losers
    const losingBids = await Bid.find({ 
      rfq: req.params.id, 
      _id: { $ne: bidId } 
    });
    
    const loserNotifications = losingBids.map(bid => ({
      user: bid.vendor,
      type: 'tender_lost',
      title: 'Tender Update',
      message: `The tender "${rfq.title}" has been awarded to another vendor.`,
      relatedRFQ: rfq._id,
      relatedBid: bid._id
    }));
    
    if (loserNotifications.length > 0) {
      await Notification.insertMany(loserNotifications);
    }

    await createAuditLog(
      req,
      'rfq_award',
      `Awarded RFQ ${rfq.referenceId} to vendor`,
      'RFQ',
      rfq._id,
      { winningBid: bidId, winningVendor: winningBid.vendor }
    );

    res.json({ 
      message: 'Tender awarded successfully',
      rfq 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
