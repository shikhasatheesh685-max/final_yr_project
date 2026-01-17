const express = require('express');
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order (purchase artwork)
// @access  Private (Visitor/Artist/Admin - anyone logged in can purchase)
router.post('/', protect, async (req, res) => {
  try {
    const { artworkID } = req.body;

    // Validation
    if (!artworkID) {
      return res.status(400).json({ message: 'Please provide artwork ID' });
    }

    // Check if artwork exists and is available
    const artwork = await Artwork.findById(artworkID);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    if (!artwork.isAvailable) {
      return res.status(400).json({ message: 'Artwork is not available for purchase' });
    }

    // Check if user is trying to buy their own artwork
    if (artwork.artistID.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot purchase your own artwork' });
    }

    // Create order
    const order = await Order.create({
      userID: req.user._id,
      artworkID: artwork._id,
      totalAmount: artwork.price,
      orderStatus: 'Pending',
    });

    // Mark artwork as unavailable
    artwork.isAvailable = false;
    await artwork.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('userID', 'name email')
      .populate('artworkID');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only) or user's own orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let orders;

    // Admin can see all orders, others see only their own
    if (req.user.role === 'admin') {
      orders = await Order.find()
        .populate('userID', 'name email')
        .populate('artworkID')
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ userID: req.user._id })
        .populate('userID', 'name email')
        .populate('artworkID')
        .sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private (User can see own, Admin can see any)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userID', 'name email')
      .populate('artworkID');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions: User can only see own orders, Admin can see any
    if (req.user.role !== 'admin' && order.userID._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin only)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { orderStatus } = req.body;

    // Validation
    if (!orderStatus || !['Pending', 'Confirmed', 'Sold'].includes(orderStatus)) {
      return res.status(400).json({ message: 'Please provide valid order status (Pending, Confirmed, or Sold)' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    order.orderStatus = orderStatus;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('userID', 'name email')
      .populate('artworkID');

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/artist/sales
// @desc    Get sales for artist's artworks
// @access  Private (Artist only)
router.get('/artist/sales', protect, authorize('artist'), async (req, res) => {
  try {
    // Get all artworks by this artist
    const artworks = await Artwork.find({ artistID: req.user._id });
    const artworkIds = artworks.map(art => art._id);

    // Get all orders for these artworks
    const orders = await Order.find({ artworkID: { $in: artworkIds } })
      .populate('userID', 'name email')
      .populate('artworkID')
      .sort({ createdAt: -1 });

    // Calculate sales stats
    const totalSales = orders.length;
    const totalRevenue = orders
      .filter(order => order.orderStatus === 'Sold')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const soldCount = orders.filter(order => order.orderStatus === 'Sold').length;
    const pendingCount = orders.filter(order => order.orderStatus === 'Pending').length;
    const confirmedCount = orders.filter(order => order.orderStatus === 'Confirmed').length;

    res.json({
      orders,
      stats: {
        totalSales,
        soldCount,
        pendingCount,
        confirmedCount,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/admin/sales-report
// @desc    Get sales report (Admin only)
// @access  Private (Admin only)
router.get('/admin/sales-report', protect, authorize('admin'), async (req, res) => {
  try {
    const allOrders = await Order.find()
      .populate('userID', 'name email')
      .populate('artworkID')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter(order => order.orderStatus === 'Sold')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const soldCount = allOrders.filter(order => order.orderStatus === 'Sold').length;
    const pendingCount = allOrders.filter(order => order.orderStatus === 'Pending').length;
    const confirmedCount = allOrders.filter(order => order.orderStatus === 'Confirmed').length;

    // Revenue by status
    const pendingRevenue = allOrders
      .filter(order => order.orderStatus === 'Pending')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const confirmedRevenue = allOrders
      .filter(order => order.orderStatus === 'Confirmed')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      orders: allOrders,
      stats: {
        totalOrders,
        totalRevenue,
        soldCount,
        pendingCount,
        confirmedCount,
        pendingRevenue,
        confirmedRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
