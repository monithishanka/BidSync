const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
  // Reference number
  referenceId: {
    type: String,
    unique: true
  },
  // Basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // Item details
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: 'units'
    },
    specifications: String
  }],
  // Category
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  // Budget
  budgetPrice: {
    type: Number,
    default: null
  },
  showBudget: {
    type: Boolean,
    default: false
  },
  // Timing
  closingDate: {
    type: Date,
    required: true
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'open', 'closed', 'awarded', 'cancelled'],
    default: 'draft'
  },
  // Sealed bidding
  isSealed: {
    type: Boolean,
    default: true
  },
  // Private/Public tender
  isPrivate: {
    type: Boolean,
    default: false
  },
  invitedVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Creator (Buyer)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: String,
  // Award info
  awardedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  awardedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null
  },
  awardedAt: Date,
  awardRemarks: String,
  // Delivery requirements
  deliveryLocation: String,
  deliveryDeadline: Date,
  // Terms
  termsAndConditions: String,
  // Template
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: String,
  // Bid count (for quick access)
  bidCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate reference ID before saving
rfqSchema.pre('save', async function(next) {
  if (!this.referenceId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('RFQ').countDocuments();
    this.referenceId = `RFQ-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual to check if deadline has passed
rfqSchema.virtual('isExpired').get(function() {
  return new Date() > this.closingDate;
});

// Virtual to check if can accept bids
rfqSchema.virtual('canAcceptBids').get(function() {
  return this.status === 'open' && !this.isExpired;
});

// Auto-close expired tenders
rfqSchema.statics.closeExpiredTenders = async function() {
  const now = new Date();
  return await this.updateMany(
    { status: 'open', closingDate: { $lt: now } },
    { status: 'closed' }
  );
};

rfqSchema.set('toJSON', { virtuals: true });
rfqSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RFQ', rfqSchema);
