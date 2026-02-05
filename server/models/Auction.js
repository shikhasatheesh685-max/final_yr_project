const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  artworkID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  winningBidID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Auction', auctionSchema);
