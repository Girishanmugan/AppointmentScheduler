const express = require('express');
const { body } = require('express-validator');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  rateAppointment
} = require('../controllers/appointmentController');
const { protect, authorize, isPatient, isDoctor } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const appointmentValidation = [
  body('doctor')
    .isMongoId()
    .withMessage('Please provide a valid doctor ID'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date'),
  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time format (HH:MM)'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Reason must be between 10 and 200 characters'),
  body('symptoms')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Symptoms cannot exceed 500 characters')
];

const rescheduleValidation = [
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date'),
  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time format (HH:MM)')
];

const ratingValidation = [
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating score must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
];

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', protect, getAppointments);

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, getAppointment);

// @route   POST /api/appointments
// @desc    Create appointment
// @access  Private (Patient)
router.post('/', protect, isPatient, appointmentValidation, createAppointment);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, updateAppointment);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private
router.put('/:id/cancel', protect, cancelAppointment);

// @route   PUT /api/appointments/:id/reschedule
// @desc    Reschedule appointment
// @access  Private (Patient)
router.put('/:id/reschedule', protect, isPatient, rescheduleValidation, rescheduleAppointment);

// @route   PUT /api/appointments/:id/rate
// @desc    Rate appointment
// @access  Private (Patient)
router.put('/:id/rate', protect, isPatient, ratingValidation, rateAppointment);

module.exports = router;
