const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@artgallery.com' });
    
    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@artgallery.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@artgallery.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
