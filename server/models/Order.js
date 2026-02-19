const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  artworkID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Sold'],
    default: 'Pending',
  },
  adminCommission: {
    type: Number,
    default: 0,
    min: 0,
  },
  artistAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentType: {
    type: String,
    enum: ['Artwork', 'Auction'],
    default: 'Artwork',
  },
  payoutStatus: {
    type: String,
    enum: ['Pending', 'Transferred'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
