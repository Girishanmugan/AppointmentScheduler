const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing test users
    await User.deleteMany({ email: { $in: ['admin@example.com', 'patient@example.com'] } });

    // Create test users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '1111111111',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        role: 'admin'
      },
      {
        name: 'Test Patient',
        email: 'patient@example.com',
        password: 'password123',
        phone: '2222222222',
        dateOfBirth: '1995-05-15',
        gender: 'female',
        role: 'patient'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created ${userData.role}: ${userData.name}`);
    }

    console.log('✅ Test users created successfully!');
    console.log('You can login with:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Password: password123, Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedUsers();
  process.exit(0);
};

runSeed();
