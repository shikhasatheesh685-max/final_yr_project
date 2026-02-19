const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const router = express.Router();

// @route GET /api/transactions/my
// @desc  Get transactions relevant to the current user (incoming)
// @access Private (Artist or Admin)
router.get('/my', protect, async (req, res) => {
  try {
    // Artists should see transactions where they are the recipient.
    // Admin can optionally see all transactions for oversight.
    let transactions;
    if (req.user.role === 'admin') {
      transactions = await Transaction.find()
        .populate('orderID', 'totalAmount')
        .populate('fromUser', 'name email')
        .populate('toUser', 'name email')
        .sort({ createdAt: -1 });
    } else {
      transactions = await Transaction.find({ toUser: req.user._id })
        .populate('orderID', 'totalAmount')
        .populate('fromUser', 'name email')
        .populate('toUser', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

