const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'bid_received',      // Buyer: New bid on their RFQ
      'bid_submitted',     // Vendor: Confirmation of bid submission
      'tender_awarded',    // Vendor: Won a tender
      'tender_lost',       // Vendor: Lost a tender
      'tender_closed',     // Both: Tender deadline passed
      'new_rfq',           // Vendor: New RFQ in their category
      'kyc_approved',      // Vendor: KYC verification approved
      'kyc_rejected',      // Vendor: KYC verification rejected
      'account_approved',  // Both: Account approved by admin
      'rating_received',   // Vendor: Received a rating
      'private_invite',    // Vendor: Invited to private tender
      'system'             // System notifications
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // Related entities
  relatedRFQ: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ'
  },
  relatedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // Link to action
  actionUrl: String
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
