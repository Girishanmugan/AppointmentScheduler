const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const testAppointments = async () => {
  try {
    // Get all users, doctors, and appointments
    const users = await User.find({}).populate('role');
    const doctors = await Doctor.find({}).populate('user', 'name email');
    const appointments = await Appointment.find({})
      .populate('patient', 'name email')
      .populate('doctor', 'specialization')
      .populate('doctor.user', 'name');

    console.log('\n📊 Database Summary:');
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Doctors: ${doctors.length}`);
    console.log(`Total Appointments: ${appointments.length}`);

    console.log('\n👥 Users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n👨‍⚕️ Doctors:');
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. Dr. ${doctor.user?.name} - ${doctor.specialization} (Verified: ${doctor.isVerified}, Active: ${doctor.isActive})`);
    });

    console.log('\n📅 Appointments:');
    if (appointments.length === 0) {
      console.log('No appointments found');
    } else {
      appointments.forEach((appointment, index) => {
        console.log(`${index + 1}. ${appointment.patient?.name} → Dr. ${appointment.doctor?.user?.name} on ${appointment.appointmentDate} at ${appointment.appointmentTime} (Status: ${appointment.status})`);
      });
    }

    // Test doctor-appointment relationship
    console.log('\n🔍 Testing Doctor-Appointment Relationships:');
    for (const doctor of doctors) {
      const doctorAppointments = await Appointment.find({ doctor: doctor._id })
        .populate('patient', 'name email');
      
      console.log(`Dr. ${doctor.user?.name} has ${doctorAppointments.length} appointments:`);
      doctorAppointments.forEach(apt => {
        console.log(`  - ${apt.patient?.name} on ${apt.appointmentDate} (${apt.status})`);
      });
    }

  } catch (error) {
    console.error('Error testing appointments:', error);
  }
};

const runTest = async () => {
  await connectDB();
  await testAppointments();
  process.exit(0);
};

runTest();

