const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please provide specialization'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience'],
    min: [0, 'Experience cannot be negative']
  },
  education: {
    type: String,
    required: [true, 'Please provide education details'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide license number'],
    unique: true,
    trim: true
  },
  clinic: {
    name: {
      type: String,
      required: [true, 'Please provide clinic name'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: {
      type: String,
      required: [true, 'Please provide clinic phone number'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    email: {
      type: String,
      required: [true, 'Please provide clinic email'],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    }
  },
  availability: [{
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  consultationFee: {
    type: Number,
    required: [true, 'Please provide consultation fee'],
    min: [0, 'Consultation fee cannot be negative']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'clinic.city': 1 });
doctorSchema.index({ isActive: 1, isVerified: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
