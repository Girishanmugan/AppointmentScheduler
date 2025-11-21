const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, patient, doctor } = req.query;
    
    let query = {};
    
    // Filter by role
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      // Find the doctor profile for this user
      const Doctor = require('../models/Doctor');
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (doctorProfile) {
        query.doctor = doctorProfile._id;
      } else {
        // If no doctor profile found, return empty results
        return res.json({
          success: true,
          count: 0,
          total: 0,
          data: [],
          pagination: {
            current: parseInt(page),
            pages: 0,
            limit: parseInt(limit)
          }
        });
      }
    } else if (req.user.role === 'admin') {
      // Admin can see all appointments
      if (patient) query.patient = patient;
      if (doctor) query.doctor = doctor;
    }
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'specialization consultationFee')
      .populate('doctor.user', 'name')
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      count: appointments.length,
      total,
      data: appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth gender')
      .populate('doctor', 'specialization consultationFee')
      .populate('doctor.user', 'name')
      .select('-__v');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    if (req.user.role === 'doctor') {
      // Find the doctor profile for this user
      const Doctor = require('../models/Doctor');
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (!doctorProfile || appointment.doctor._id.toString() !== doctorProfile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this appointment'
        });
      }
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, appointmentTime, reason, symptoms } = req.body;

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if doctor is available
    if (!doctorExists.isActive || !doctorExists.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available for appointments'
      });
    }

    // Check if appointment date is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check if time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      symptoms,
      consultationFee: doctorExists.consultationFee
    });

    await appointment.populate('doctor', 'specialization consultationFee');
    await appointment.populate('doctor.user', 'name');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    if (req.user.role === 'doctor') {
      // Find the doctor profile for this user
      const Doctor = require('../models/Doctor');
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this appointment'
        });
      }
    }

    // Update appointment
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('patient', 'name email phone')
    .populate('doctor', 'specialization consultationFee')
    .populate('doctor.user', 'name');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    if (req.user.role === 'doctor') {
      // Find the doctor profile for this user
      const Doctor = require('../models/Doctor');
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this appointment'
        });
      }
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed appointment'
      });
    }

    // Check if patient is trying to cancel within 24 hours
    if (req.user.role === 'patient') {
      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.appointmentTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);
      if (hoursUntilAppointment < 24) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel appointment within 24 hours'
        });
      }
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = req.user.id;
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Patient)
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment'
      });
    }

    // Check if appointment can be rescheduled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule cancelled appointment'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule completed appointment'
      });
    }

    // Check if new time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: req.params.id }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Create rescheduled appointment
    const rescheduledAppointment = await Appointment.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason: appointment.reason,
      symptoms: appointment.symptoms,
      consultationFee: appointment.consultationFee,
      rescheduledFrom: appointment._id
    });

    // Update original appointment
    appointment.status = 'rescheduled';
    await appointment.save();

    await rescheduledAppointment.populate('doctor', 'specialization consultationFee');
    await rescheduledAppointment.populate('doctor.user', 'name');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: rescheduledAppointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Rate appointment
// @route   PUT /api/appointments/:id/rate
// @access  Private (Patient)
const rateAppointment = async (req, res) => {
  try {
    const { score, review } = req.body;
    
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this appointment'
      });
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed appointments'
      });
    }

    // Check if already rated
    if (appointment.rating.score) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already rated'
      });
    }

    appointment.rating = {
      score,
      review,
      ratedAt: new Date()
    };

    await appointment.save();

    // Update doctor's rating
    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      const totalRating = doctor.rating.average * doctor.rating.count + score;
      doctor.rating.count += 1;
      doctor.rating.average = totalRating / doctor.rating.count;
      await doctor.save();
    }

    res.json({
      success: true,
      message: 'Appointment rated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Rate appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  rateAppointment
};
