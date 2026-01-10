const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  // References
  rfq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Pricing
  unitPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number
  },
  // VAT handling
  isVATRegistered: {
    type: Boolean,
    default: false
  },
  vatRate: {
    type: Number,
    default: 18 // 18% VAT in Sri Lanka
  },
  vatAmount: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number
  },
  // Delivery
  deliveryTimeline: {
    type: Number, // Days
    required: true
  },
  deliveryDate: Date,
  // Warranty
  warrantyPeriod: {
    type: Number, // Months
    default: 0
  },
  warrantyTerms: String,
  // Additional info
  remarks: String,
  technicalSpecifications: String,
  // Attachments
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedAt: Date
  }],
  // Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'won', 'lost', 'withdrawn'],
    default: 'pending'
  },
  // Sealed bid visibility
  isRevealed: {
    type: Boolean,
    default: false
  },
  // Score (for evaluation)
  evaluationScore: {
    type: Number,
    default: null
  },
  evaluationNotes: String,
  // Withdrawal
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: Date,
  withdrawalReason: String
}, {
  timestamps: true
});

// Calculate totals before saving
bidSchema.pre('save', function(next) {
  this.subtotal = this.unitPrice * this.quantity;
  
  if (this.isVATRegistered) {
    this.vatAmount = this.subtotal * (this.vatRate / 100);
  } else {
    this.vatAmount = 0;
  }
  
  this.totalPrice = this.subtotal + this.vatAmount;
  next();
});

// Ensure one bid per vendor per RFQ
bidSchema.index({ rfq: 1, vendor: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
