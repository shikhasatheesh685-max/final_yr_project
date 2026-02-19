const express = require('express');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const { protect, authorize, requireApprovedArtist } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/auctions
// @desc    List auctions (active by default; optional status filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : { status: 'active' };
    const auctions = await Auction.find(filter)
      .populate('artworkID')
      .populate('createdBy', 'name')
      .populate('winningBidID')
      .sort({ endTime: 1 });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auctions/my
// @desc    My auctions (artist/owner) - must be before :id
// @access  Private (Artist or Admin)
router.get('/my', protect, authorize('artist', 'admin'), requireApprovedArtist, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const auctions = await Auction.find(filter)
      .populate('artworkID')
      .populate('winningBidID')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auctions/:id
// @desc    Get single auction with bids
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('artworkID')
      .populate('createdBy', 'name email')
      .populate('winningBidID');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    const bids = await Bid.find({ auctionID: auction._id })
      .populate('userID', 'name email')
      .sort({ amount: -1 });
    res.json({ auction, bids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auctions
// @desc    Create auction (Artist or Admin)
// @access  Private
router.post('/', protect, authorize('artist', 'admin'), requireApprovedArtist, async (req, res) => {
  try {
    const { artworkID, basePrice, durationHours } = req.body;
    if (!artworkID || basePrice == null || !durationHours) {
      return res.status(400).json({ message: 'Provide artworkID, basePrice, and durationHours' });
    }

    const artwork = await Artwork.findById(artworkID);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    if (req.user.role === 'artist' && artwork.artistID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only auction your own artworks' });
    }

    const existing = await Auction.findOne({ artworkID, status: 'active' });
    if (existing) return res.status(400).json({ message: 'This artwork is already in an active auction' });

    const hours = Math.max(1, Math.min(720, Number(durationHours) || 24));
    const endTime = new Date(Date.now() + hours * 60 * 60 * 1000);

    const auction = await Auction.create({
      artworkID: artwork._id,
      basePrice: parseFloat(basePrice),
      endTime,
      createdBy: req.user._id,
    });

    const populated = await Auction.findById(auction._id)
      .populate('artworkID')
      .populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auctions/:id/bids
// @desc    Place a bid
// @access  Private
router.post('/:id/bids', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot place bids.' });
    }

    const auction = await Auction.findById(req.params.id).populate('artworkID');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }
    if (new Date() > new Date(auction.endTime)) {
      return res.status(400).json({ message: 'Auction has ended' });
    }
    // Artwork sold (e.g. direct purchase) — no bidding
    if (auction.artworkID && !auction.artworkID.isAvailable) {
      return res.status(400).json({ message: 'This artwork has been sold; bidding is closed.' });
    }
    if (auction.artworkID.artistID.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own artwork' });
    }

    const { amount } = req.body;
    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount < auction.basePrice) {
      return res.status(400).json({ message: `Bid must be at least ${auction.basePrice}` });
    }

    const highest = await Bid.findOne({ auctionID: auction._id }).sort({ amount: -1 });
    // Prevent same user from placing consecutive highest bids
    if (highest && highest.userID.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot place consecutive bids. Wait for another user to place a bid.' });
    }
    if (highest && bidAmount <= highest.amount) {
      return res.status(400).json({ message: `Bid must be higher than current highest (${highest.amount})` });
    }

    const bid = await Bid.create({
      auctionID: auction._id,
      userID: req.user._id,
      amount: bidAmount,
    });

    const populated = await Bid.findById(bid._id).populate('userID', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auctions/:id/bids
// @desc    List bids for an auction (owner or admin)
// @access  Private (artist who created auction or admin)
router.get('/:id/bids', protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('artworkID');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const isOwner = auction.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the auction owner or admin can view all bids' });
    }

    const bids = await Bid.find({ auctionID: auction._id })
      .populate('userID', 'name email')
      .sort({ amount: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auctions/:id/finalize
// @desc    Finalize auction: set winner, mark artwork sold, create order
// @access  Private (artist who created auction or admin)
router.put('/:id/finalize', protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('artworkID');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is already completed or cancelled' });
    }

    const isOwner = auction.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the auction owner or admin can finalize' });
    }

    const winningBid = await Bid.findOne({ auctionID: auction._id }).sort({ amount: -1 });
    if (!winningBid) {
      auction.status = 'cancelled';
      await auction.save();
      return res.json({ message: 'Auction cancelled (no bids)', auction });
    }

    auction.winningBidID = winningBid._id;
    auction.status = 'completed';
    await auction.save();

    // Mark artwork as sold so it no longer appears available in the gallery
    const artworkId = auction.artworkID._id || auction.artworkID;
    const artwork = await Artwork.findById(artworkId);
    if (artwork) {
      artwork.isAvailable = false;
      await artwork.save();
    }

    const commissionRate = parseFloat(process.env.COMMISSION_RATE) || 0.07;
    const totalAmount = winningBid.amount;
    const adminCommission = Math.round(totalAmount * commissionRate * 100) / 100;
    const artistAmount = Math.round((totalAmount - adminCommission) * 100) / 100;

    await Order.create({
      userID: winningBid.userID,
      artworkID: artwork._id,
      totalAmount,
      adminCommission,
      artistAmount,
      orderStatus: 'Sold',
      paymentType: 'Auction',
      payoutStatus: 'Pending',
    });

    const updated = await Auction.findById(auction._id)
      .populate('artworkID')
      .populate({ path: 'winningBidID', populate: { path: 'userID', select: 'name email' } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
