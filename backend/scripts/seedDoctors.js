const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
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

const seedDoctors = async () => {
  try {
    // Clear existing data
    await User.deleteMany({ role: 'doctor' });
    await Doctor.deleteMany({});

    // Create test doctors
    const doctors = [
      {
        name: 'Dr. John Smith',
        email: 'john.smith@example.com',
        password: 'password123',
        phone: '1234567890',
        dateOfBirth: '1980-01-15',
        gender: 'male',
        role: 'doctor',
        specialization: 'Cardiology',
        experience: 10,
        education: 'MD in Cardiology, Harvard Medical School',
        licenseNumber: 'DOC123456',
        clinic: {
          name: 'Heart Care Clinic',
          phone: '1234567891',
          email: 'info@heartcare.com',
          address: {
            street: '123 Medical Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        consultationFee: 500,
        availability: [
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
        ]
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: 'password123',
        phone: '1234567892',
        dateOfBirth: '1985-05-20',
        gender: 'female',
        role: 'doctor',
        specialization: 'Neurology',
        experience: 8,
        education: 'MD in Neurology, Stanford Medical School',
        licenseNumber: 'DOC123457',
        clinic: {
          name: 'Brain & Spine Center',
          phone: '1234567893',
          email: 'info@brainspine.com',
          address: {
            street: '456 Neurology Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          }
        },
        consultationFee: 600,
        availability: [
          {
            dayOfWeek: 'monday',
            startTime: '08:00',
            endTime: '16:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'tuesday',
            startTime: '08:00',
            endTime: '16:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'wednesday',
            startTime: '08:00',
            endTime: '16:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'thursday',
            startTime: '08:00',
            endTime: '16:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'friday',
            startTime: '08:00',
            endTime: '16:00',
            isAvailable: true
          }
        ]
      },
      {
        name: 'Dr. Michael Brown',
        email: 'michael.brown@example.com',
        password: 'password123',
        phone: '1234567894',
        dateOfBirth: '1975-12-10',
        gender: 'male',
        role: 'doctor',
        specialization: 'General Medicine',
        experience: 15,
        education: 'MD in General Medicine, Johns Hopkins University',
        licenseNumber: 'DOC123458',
        clinic: {
          name: 'Family Health Center',
          phone: '1234567895',
          email: 'info@familyhealth.com',
          address: {
            street: '789 Health Boulevard',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          }
        },
        consultationFee: 300,
        availability: [
          {
            dayOfWeek: 'monday',
            startTime: '09:00',
            endTime: '18:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'tuesday',
            startTime: '09:00',
            endTime: '18:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'wednesday',
            startTime: '09:00',
            endTime: '18:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'thursday',
            startTime: '09:00',
            endTime: '18:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'friday',
            startTime: '09:00',
            endTime: '18:00',
            isAvailable: true
          },
          {
            dayOfWeek: 'saturday',
            startTime: '10:00',
            endTime: '14:00',
            isAvailable: true
          }
        ]
      }
    ];

    // Create users and doctors
    for (const doctorData of doctors) {
      // Create user
      const user = new User({
        name: doctorData.name,
        email: doctorData.email,
        password: doctorData.password,
        phone: doctorData.phone,
        dateOfBirth: new Date(doctorData.dateOfBirth),
        gender: doctorData.gender,
        role: doctorData.role
      });

      await user.save();

      // Create doctor profile
      const doctor = new Doctor({
        user: user._id,
        specialization: doctorData.specialization,
        experience: doctorData.experience,
        education: doctorData.education,
        licenseNumber: doctorData.licenseNumber,
        clinic: doctorData.clinic,
        consultationFee: doctorData.consultationFee,
        availability: doctorData.availability,
        isVerified: true,
        isActive: true
      });

      await doctor.save();

      console.log(`Created doctor: ${doctorData.name}`);
    }

    console.log('✅ Test doctors created successfully!');
    console.log('You can now login with any of these doctors:');
    doctors.forEach(doctor => {
      console.log(`- Email: ${doctor.email}, Password: password123`);
    });

  } catch (error) {
    console.error('Error seeding doctors:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedDoctors();
  process.exit(0);
};

runSeed();
