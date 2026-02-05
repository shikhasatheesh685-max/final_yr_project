const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/items', require('./routes/artworks')); // Spec alias: items = artworks
app.use('/api/orders', require('./routes/orders'));
// Mount auctions router (ensure it's loaded)
let auctionsRouter;
try {
  auctionsRouter = require('./routes/auctions');
  app.use('/api/auctions', auctionsRouter);
} catch (err) {
  console.error('Failed to load auctions route:', err.message);
}
app.use('/api/categories', require('./routes/categories'));
app.use('/api/settings', require('./routes/settings'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// 404 handler – log so we can see what path was requested
app.use((req, res) => {
  console.warn('[404]', req.method, req.originalUrl);
  res.status(404).json({ error: 'Not found', path: req.originalUrl, method: req.method });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
