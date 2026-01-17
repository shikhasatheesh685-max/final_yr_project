const express = require('express');
const Artwork = require('../models/Artwork');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/artworks
// @desc    Get all artworks (public - no auth required)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, artist, featured, available } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (artist) filter.artistID = artist;
    if (featured === 'true') filter.isFeatured = true;
    if (available !== undefined) filter.isAvailable = available === 'true';

    const artworks = await Artwork.find(filter)
      .populate('artistID', 'name email')
      .sort({ createdAt: -1 });

    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/artworks/:id
// @desc    Get single artwork by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('artistID', 'name email');

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/artworks
// @desc    Create new artwork
// @access  Private (Artist or Admin)
router.post('/', protect, authorize('artist', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    // Validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide title, description, price, and category' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Create artwork
    const artwork = await Artwork.create({
      title,
      description,
      price: parseFloat(price),
      category,
      imageURL: `/uploads/${req.file.filename}`,
      artistID: req.user._id,
    });

    const populatedArtwork = await Artwork.findById(artwork._id)
      .populate('artistID', 'name email');

    res.status(201).json(populatedArtwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/artworks/:id
// @desc    Update artwork
// @access  Private (Artist can update own, Admin can update any)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check permissions: Artist can only update own artworks, Admin can update any
    if (req.user.role === 'artist' && artwork.artistID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this artwork' });
    }

    // Update fields
    const { title, description, price, category, isAvailable, isFeatured } = req.body;
    
    if (title) artwork.title = title;
    if (description) artwork.description = description;
    if (price) artwork.price = parseFloat(price);
    if (category) artwork.category = category;
    if (isAvailable !== undefined) artwork.isAvailable = isAvailable === 'true' || isAvailable === true;
    // Only admin can set featured status
    if (isFeatured !== undefined && req.user.role === 'admin') {
      artwork.isFeatured = isFeatured === 'true' || isFeatured === true;
    }
    
    // Update image if new one is uploaded
    if (req.file) {
      artwork.imageURL = `/uploads/${req.file.filename}`;
    }

    await artwork.save();

    const updatedArtwork = await Artwork.findById(artwork._id)
      .populate('artistID', 'name email');

    res.json(updatedArtwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/artworks/:id
// @desc    Delete artwork
// @access  Private (Artist can delete own, Admin can delete any)
router.delete('/:id', protect, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check permissions: Artist can only delete own artworks, Admin can delete any
    if (req.user.role === 'artist' && artwork.artistID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this artwork' });
    }

    await artwork.deleteOne();

    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/artworks/artist/:artistId
// @desc    Get all artworks by a specific artist
// @access  Public
router.get('/artist/:artistId', async (req, res) => {
  try {
    const artworks = await Artwork.find({ artistID: req.params.artistId })
      .populate('artistID', 'name email')
      .sort({ createdAt: -1 });

    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/artworks/categories/list
// @desc    Get all unique categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Artwork.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
