const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // Who is being rated
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Who is rating
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Related to which tender
  rfq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: true
  },
  // Rating scores (1-5)
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  qualityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryRating: {
    type: Number,
    min: 1,
    max: 5
  },
  communicationRating: {
    type: Number,
    min: 1,
    max: 5
  },
  valueRating: {
    type: Number,
    min: 1,
    max: 5
  },
  // Review
  review: String,
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// One rating per buyer per RFQ
ratingSchema.index({ buyer: 1, rfq: 1 }, { unique: true });

// Update vendor's average rating after save
ratingSchema.post('save', async function() {
  const Rating = mongoose.model('Rating');
  const User = mongoose.model('User');
  
  const stats = await Rating.aggregate([
    { $match: { vendor: this.vendor } },
    {
      $group: {
        _id: '$vendor',
        averageRating: { $avg: '$overallRating' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.vendor, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].count
    });
  }
});

module.exports = mongoose.model('Rating', ratingSchema);
