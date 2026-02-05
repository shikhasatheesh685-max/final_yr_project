const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auctionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Bid', bidSchema);
