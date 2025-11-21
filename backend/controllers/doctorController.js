const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { specialization, city, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true, isVerified: true };
    
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    
    if (city) {
      query['clinic.city'] = new RegExp(city, 'i');
    }

    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone')
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'rating.average': -1, createdAt: -1 });

    const total = await Doctor.countDocuments(query);

    res.json({
      success: true,
      count: doctors.length,
      total,
      data: doctors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone dateOfBirth gender')
      .select('-__v');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private (Doctor)
const createDoctor = async (req, res) => {
  try {
    const doctorData = {
      user: req.user.id,
      ...req.body
    };

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: req.user.id });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile already exists'
      });
    }

    const doctor = await Doctor.create(doctorData);

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: doctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (Doctor/Admin)
const updateDoctor = async (req, res) => {
  try {
    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if user is authorized to update
    if (req.user.role !== 'admin' && doctor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile'
      });
    }

    doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: doctor
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check for existing appointments
    const existingAppointments = await Appointment.find({
      doctor: req.params.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete doctor with pending or confirmed appointments'
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/doctors/:id/appointments
// @access  Private (Doctor/Admin)
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { doctor: req.params.id };
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: 1, appointmentTime: 1 });

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
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get doctor's availability
// @route   GET /api/doctors/:id/availability
// @access  Public
const getDoctorAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    // Calculate available time slots
    const availableSlots = [];
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const dayAvailability = doctor.availability.find(
      avail => avail.dayOfWeek === dayOfWeek && avail.isAvailable
    );

    if (dayAvailability) {
      const startTime = dayAvailability.startTime;
      const endTime = dayAvailability.endTime;
      const slotDuration = 30; // 30 minutes per slot

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
        const hour = Math.floor(minutes / 60);
        const min = minutes % 60;
        const timeSlot = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

        // Check if slot is already booked
        const isBooked = existingAppointments.some(
          apt => apt.appointmentTime === timeSlot
        );

        if (!isBooked) {
          availableSlots.push(timeSlot);
        }
      }
    }

    res.json({
      success: true,
      data: {
        doctor: doctor._id,
        date: date,
        availableSlots,
        availability: dayAvailability
      }
    });
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get specializations
// @route   GET /api/doctors/specializations
// @access  Public
const getSpecializations = async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization', {
      isActive: true,
      isVerified: true
    });

    res.json({
      success: true,
      data: specializations
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments,
  getDoctorAvailability,
  getSpecializations
};
