const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Doctor = require('../models/Doctor');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const fixDoctors = async () => {
  try {
    // Find all doctors that are not verified or not active
    const doctors = await Doctor.find({
      $or: [
        { isVerified: { $ne: true } },
        { isActive: { $ne: true } }
      ]
    });

    console.log(`Found ${doctors.length} doctors that need to be fixed`);

    // Update all doctors to be verified and active
    const result = await Doctor.updateMany(
      {},
      {
        $set: {
          isVerified: true,
          isActive: true
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} doctors`);

    // Add default availability to doctors that don't have any
    const doctorsWithoutAvailability = await Doctor.find({
      $or: [
        { availability: { $exists: false } },
        { availability: { $size: 0 } }
      ]
    });

    console.log(`Found ${doctorsWithoutAvailability.length} doctors without availability`);

    const defaultAvailability = [
      {
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'tuesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'thursday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'friday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      }
    ];

    const availabilityResult = await Doctor.updateMany(
      {
        $or: [
          { availability: { $exists: false } },
          { availability: { $size: 0 } }
        ]
      },
      {
        $set: {
          availability: defaultAvailability
        }
      }
    );

    console.log(`✅ Added default availability to ${availabilityResult.modifiedCount} doctors`);

    // Show all doctors
    const allDoctors = await Doctor.find({}).populate('user', 'name email');
    console.log('\n📋 All doctors in the system:');
    allDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. Dr. ${doctor.user?.name} - ${doctor.specialization} (Verified: ${doctor.isVerified}, Active: ${doctor.isActive})`);
    });

  } catch (error) {
    console.error('Error fixing doctors:', error);
  }
};

const runFix = async () => {
  await connectDB();
  await fixDoctors();
  process.exit(0);
};

runFix();

