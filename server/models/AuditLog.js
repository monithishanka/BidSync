const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['buyer', 'vendor', 'admin'],
    required: true
  },
  // What action was performed
  action: {
    type: String,
    enum: [
      // Auth actions
      'login',
      'logout',
      'signup',
      'password_change',
      // RFQ actions
      'rfq_create',
      'rfq_update',
      'rfq_delete',
      'rfq_publish',
      'rfq_cancel',
      'rfq_view',
      'rfq_award',
      // Bid actions
      'bid_submit',
      'bid_update',
      'bid_withdraw',
      'bid_view',
      'bids_reveal',
      // Admin actions
      'user_approve',
      'user_reject',
      'user_suspend',
      'kyc_approve',
      'kyc_reject',
      // Report actions
      'report_generate',
      'report_download'
    ],
    required: true
  },
  // Details
  description: {
    type: String,
    required: true
  },
  // Related entities
  targetEntity: {
    type: String,
    enum: ['User', 'RFQ', 'Bid', 'Report', null]
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  // Request metadata
  ipAddress: String,
  userAgent: String,
  // Additional data (JSON)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for faster queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetEntity: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
