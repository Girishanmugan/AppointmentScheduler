const express = require('express');
const { body } = require('express-validator');
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments,
  getDoctorAvailability,
  getSpecializations
} = require('../controllers/doctorController');
const { protect, authorize, isAdmin, isDoctor } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const doctorValidation = [
  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required'),
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative integer'),
  body('education')
    .trim()
    .notEmpty()
    .withMessage('Education is required'),
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),
  body('clinic.name')
    .trim()
    .notEmpty()
    .withMessage('Clinic name is required'),
  body('clinic.phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit clinic phone number'),
  body('clinic.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid clinic email'),
  body('consultationFee')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a non-negative number')
];

const availabilityValidation = [
  body('availability')
    .isArray({ min: 1 })
    .withMessage('At least one availability slot is required'),
  body('availability.*.dayOfWeek')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('availability.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('availability.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)')
];

// @route   GET /api/doctors/specializations
// @desc    Get all specializations
// @access  Public
router.get('/specializations', getSpecializations);

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public
router.get('/', getDoctors);

// @route   GET /api/doctors/:id
// @desc    Get single doctor
// @access  Public
router.get('/:id', getDoctor);

// @route   GET /api/doctors/:id/availability
// @desc    Get doctor availability for a specific date
// @access  Public
router.get('/:id/availability', getDoctorAvailability);

// @route   POST /api/doctors
// @desc    Create doctor profile
// @access  Private (Doctor)
router.post('/', protect, isDoctor, doctorValidation, availabilityValidation, createDoctor);

// @route   PUT /api/doctors/:id
// @desc    Update doctor profile
// @access  Private (Doctor/Admin)
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctor);

// @route   DELETE /api/doctors/:id
// @desc    Delete doctor
// @access  Private (Admin)
router.delete('/:id', protect, isAdmin, deleteDoctor);

// @route   GET /api/doctors/:id/appointments
// @desc    Get doctor's appointments
// @access  Private (Doctor/Admin)
router.get('/:id/appointments', protect, authorize('doctor', 'admin'), getDoctorAppointments);

module.exports = router;
