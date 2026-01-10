const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const RFQ = require('../models/RFQ');
const Notification = require('../models/Notification');
const { isAuthenticated, isVendor, isApproved } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/audit');

// GET /api/bid/my - Get vendor's bids
router.get('/my', isAuthenticated, isVendor, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = new mongoose.Types.ObjectId(req.session.userId);
    
    let query = { vendor: userId };
    if (status && status !== 'all') query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [bids, total] = await Promise.all([
      Bid.find(query)
        .populate('rfq', 'referenceId title category closingDate status organization')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Bid.countDocuments(query)
    ]);

    // Calculate stats - exclude bids for cancelled tenders
    const stats = await Bid.aggregate([
      { $match: { vendor: userId } },
      // Lookup RFQ to check if cancelled
      {
        $lookup: {
          from: 'rfqs',
          localField: 'rfq',
          foreignField: '_id',
          as: 'rfqData'
        }
      },
      { $unwind: '$rfqData' },
      // Exclude bids where RFQ is cancelled
      { $match: { 'rfqData.status': { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const bidStats = {
      total: 0,
      pending: 0,
      won: 0,
      lost: 0
    };

    stats.forEach(s => {
      if (bidStats.hasOwnProperty(s._id)) {
        bidStats[s._id] = s.count;
      }
      bidStats.total += s.count;
    });

    res.json({
      bids,
      stats: bidStats,
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

// GET /api/bid/:id - Get single bid
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('rfq', 'referenceId title category closingDate status organization isSealed')
      .populate('vendor', 'companyName');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check authorization
    const isOwner = bid.vendor._id.toString() === req.session.userId;
    const rfq = await RFQ.findById(bid.rfq._id);
    const isRFQOwner = rfq && rfq.createdBy.toString() === req.session.userId;
    const isAdmin = req.session.userRole === 'admin';

    if (!isOwner && !isRFQOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this bid' });
    }

    // If sealed and still open, hide pricing for RFQ owner
    if (isRFQOwner && rfq.isSealed && rfq.status === 'open' && new Date() < rfq.closingDate) {
      return res.json({
        bid: {
          ...bid.toObject(),
          unitPrice: '***',
          totalPrice: '***',
          vatAmount: '*** (Sealed)',
          isRevealed: false
        }
      });
    }

    await createAuditLog(
      req,
      'bid_view',
      `Viewed bid for RFQ: ${rfq.referenceId}`,
      'Bid',
      bid._id
    );

    res.json({ bid });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bid - Submit a bid
router.post('/', isAuthenticated, isVendor, isApproved, async (req, res) => {
  try {
    const {
      rfqId,
      unitPrice,
      quantity,
      deliveryTimeline,
      warrantyPeriod,
      warrantyTerms,
      remarks,
      technicalSpecifications,
      isVATRegistered
    } = req.body;

    // Validate
    if (!rfqId || !unitPrice || !quantity || !deliveryTimeline) {
      return res.status(400).json({
        message: 'Please provide RFQ ID, unit price, quantity, and delivery timeline'
      });
    }

    // Check RFQ exists and is open
    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    if (rfq.status !== 'open') {
      return res.status(400).json({ message: 'This tender is not accepting bids' });
    }

    if (new Date() > rfq.closingDate) {
      // Auto close the RFQ
      rfq.status = 'closed';
      await rfq.save();
      return res.status(400).json({ message: 'This tender has closed' });
    }

    // Check for private tender
    if (rfq.isPrivate) {
      const isInvited = rfq.invitedVendors.includes(req.session.userId);
      if (!isInvited) {
        return res.status(403).json({ 
          message: 'You were not invited to this private tender' 
        });
      }
    }

    // Check if already bid
    const existingBid = await Bid.findOne({ 
      rfq: rfqId, 
      vendor: req.session.userId 
    });

    if (existingBid) {
      return res.status(400).json({
        message: 'You have already submitted a bid for this tender'
      });
    }

    // Create bid
    const bid = new Bid({
      rfq: rfqId,
      vendor: req.session.userId,
      unitPrice,
      quantity,
      deliveryTimeline,
      warrantyPeriod: warrantyPeriod || 0,
      warrantyTerms,
      remarks,
      technicalSpecifications,
      isVATRegistered: isVATRegistered || false
    });

    await bid.save();

    // Update RFQ bid count
    rfq.bidCount += 1;
    await rfq.save();

    // Notify buyer
    await Notification.create({
      user: rfq.createdBy,
      type: 'bid_received',
      title: 'New Bid Received',
      message: `New bid received for "${rfq.title}"`,
      relatedRFQ: rfq._id,
      relatedBid: bid._id,
      actionUrl: `/buyer/rfq/${rfq._id}/bids`
    });

    await createAuditLog(
      req,
      'bid_submit',
      `Submitted bid for RFQ: ${rfq.referenceId}`,
      'Bid',
      bid._id,
      { rfqId: rfq._id }
    );

    res.status(201).json({
      message: 'Bid submitted successfully',
      bid: {
        id: bid._id,
        totalPrice: bid.totalPrice,
        status: bid.status
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already submitted a bid for this tender'
      });
    }
    console.error('Bid submission error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/bid/:id - Update bid (before deadline)
router.put('/:id', isAuthenticated, isVendor, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.vendor.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check RFQ is still open
    const rfq = await RFQ.findById(bid.rfq);
    if (!rfq || rfq.status !== 'open' || new Date() > rfq.closingDate) {
      return res.status(400).json({ 
        message: 'Cannot update bid - tender is closed' 
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'unitPrice', 'quantity', 'deliveryTimeline', 
      'warrantyPeriod', 'warrantyTerms', 'remarks',
      'technicalSpecifications', 'isVATRegistered'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        bid[field] = req.body[field];
      }
    });

    await bid.save();

    await createAuditLog(
      req,
      'bid_update',
      `Updated bid for RFQ: ${rfq.referenceId}`,
      'Bid',
      bid._id
    );

    res.json({ message: 'Bid updated successfully', bid });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/bid/:id - Cancel/Withdraw bid
// Within 5 minutes of submission: Full cancellation (removes from DB)
// After 5 minutes: Withdraw only (marks as withdrawn)
router.delete('/:id', isAuthenticated, isVendor, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const bid = await Bid.findById(req.params.id);
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.vendor.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check RFQ is still open
    const rfq = await RFQ.findById(bid.rfq);
    if (!rfq || rfq.status !== 'open' || new Date() > rfq.closingDate) {
      return res.status(400).json({ 
        message: 'Cannot cancel bid - tender is closed' 
      });
    }

    // Check if within 5-minute window for full cancellation
    const submissionTime = new Date(bid.createdAt);
    const now = new Date();
    const fiveMinutesMs = 5 * 60 * 1000;
    const timeSinceSubmission = now - submissionTime;
    
    if (timeSinceSubmission <= fiveMinutesMs) {
      // Full cancellation - remove from database
      await Bid.findByIdAndDelete(req.params.id);
      
      // Update RFQ bid count
      rfq.bidCount = Math.max(0, rfq.bidCount - 1);
      await rfq.save();

      await createAuditLog(
        req,
        'bid_cancel',
        `Cancelled bid for RFQ: ${rfq.referenceId} (within 5-min window)`,
        'Bid',
        req.params.id,
        { reason }
      );

      return res.json({ 
        message: 'Bid cancelled successfully',
        cancelled: true
      });
    }

    // After 5 minutes - withdraw only (soft delete)
    bid.isWithdrawn = true;
    bid.withdrawnAt = new Date();
    bid.withdrawalReason = reason;
    bid.status = 'withdrawn';
    await bid.save();

    // Update RFQ bid count
    rfq.bidCount = Math.max(0, rfq.bidCount - 1);
    await rfq.save();

    await createAuditLog(
      req,
      'bid_withdraw',
      `Withdrew bid for RFQ: ${rfq.referenceId}`,
      'Bid',
      bid._id,
      { reason }
    );

    res.json({ 
      message: 'Bid withdrawn successfully',
      withdrawn: true 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
