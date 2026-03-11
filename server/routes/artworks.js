const express = require('express');
const Artwork = require('../models/Artwork');
const { protect, authorize, requireApprovedArtist } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/artworks
// @desc    Get all artworks (public - no auth required; only active)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, artist, featured, available } = req.query;

    const filter = { isActive: true };
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

// @route   GET /api/artworks/admin/all
// @desc    Get all artworks including inactive (admin only)
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const artworks = await Artwork.find({})
      .populate('artistID', 'name email')
      .sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/artworks/:id
// @desc    Get single artwork by ID (returns 404 if inactive)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('artistID', 'name email');

    if (!artwork || !artwork.isActive) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/artworks
// @desc    Create new artwork
// @access  Private (Approved Artist or Admin)
router.post('/', protect, authorize('artist', 'admin'), requireApprovedArtist, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, medium, imageURL: imageURLBody } = req.body;

    // Validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide title, description, price, and category' });
    }

    const imageURL = (imageURLBody && typeof imageURLBody === 'string' && imageURLBody.trim().startsWith('http'))
      ? imageURLBody.trim()
      : req.file
        ? `/uploads/${req.file.filename}`
        : null;
    if (!imageURL) {
      return res.status(400).json({ message: 'Please upload an image or provide an image URL' });
    }

    // Create artwork
    const artwork = await Artwork.create({
      title,
      description,
      price: parseFloat(price),
      category,
      medium: medium || '',
      imageURL,
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
// @access  Private (Approved Artist can update own, Admin can update any)
router.put('/:id', protect, requireApprovedArtist, upload.single('image'), async (req, res) => {
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
    const { title, description, price, category, medium, isAvailable, isFeatured } = req.body;
    
    if (title) artwork.title = title;
    if (description) artwork.description = description;
    if (price) artwork.price = parseFloat(price);
    if (category) artwork.category = category;
    if (medium !== undefined) artwork.medium = medium;
    if (isAvailable !== undefined) artwork.isAvailable = isAvailable === 'true' || isAvailable === true;
    // Only admin can set featured and active status
    if (isFeatured !== undefined && req.user.role === 'admin') {
      artwork.isFeatured = isFeatured === 'true' || isFeatured === true;
    }
    if (req.body.isActive !== undefined && req.user.role === 'admin') {
      artwork.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    
    // Update image if new file uploaded or new image URL provided
    const imageURLBody = req.body.imageURL;
    if (req.file) {
      artwork.imageURL = `/uploads/${req.file.filename}`;
    } else if (imageURLBody && typeof imageURLBody === 'string' && imageURLBody.trim().startsWith('http')) {
      artwork.imageURL = imageURLBody.trim();
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
// @access  Private (Approved Artist can delete own, Admin can delete any)
router.delete('/:id', protect, requireApprovedArtist, async (req, res) => {
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
// @desc    Get all artworks by a specific artist (active only)
// @access  Public
router.get('/artist/:artistId', async (req, res) => {
  try {
    const artworks = await Artwork.find({
      artistID: req.params.artistId,
      isActive: true,
    })
      .populate('artistID', 'name email')
      .sort({ createdAt: -1 });

    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/artworks/categories/list
// @desc    Get all unique categories (from active artworks only)
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Artwork.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
