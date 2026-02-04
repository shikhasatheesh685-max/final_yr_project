const express = require('express');
const Setting = require('../models/Setting');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const PUBLIC_KEYS = ['siteName', 'tagline', 'welcomeMessage'];

// @route   GET /api/settings/public
// @desc    Get public site content (no auth)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const settings = await Setting.find({ key: { $in: PUBLIC_KEYS } });
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value || ''; });
    res.json({
      siteName: map.siteName || 'Art Gallery',
      tagline: map.tagline || 'Discover beautiful artworks',
      welcomeMessage: map.welcomeMessage || '',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/settings
// @desc    Get all settings (Admin only)
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await Setting.find();
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value || ''; });
    res.json(map);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/settings
// @desc    Update site content (Admin only). Body: { siteName?, tagline?, welcomeMessage? }
// @access  Private (Admin only)
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { siteName, tagline, welcomeMessage } = req.body;

    const updates = [
      { key: 'siteName', value: siteName != null ? String(siteName) : undefined },
      { key: 'tagline', value: tagline != null ? String(tagline) : undefined },
      { key: 'welcomeMessage', value: welcomeMessage != null ? String(welcomeMessage) : undefined },
    ];

    for (const u of updates) {
      if (u.value === undefined) continue;
      await Setting.findOneAndUpdate(
        { key: u.key },
        { $set: { value: u.value } },
        { upsert: true, new: true }
      );
    }

    const settings = await Setting.find();
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value || ''; });
    res.json(map);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
