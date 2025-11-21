import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    appointmentDate: searchParams.get('date') || '',
    appointmentTime: searchParams.get('time') || '',
    reason: '',
    symptoms: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.appointmentDate, doctorId]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      console.log('Fetching doctor with ID:', doctorId);
      const response = await axios.get(`/api/doctors/${doctorId}`);
      console.log('Doctor response:', response.data);
      setDoctor(response.data.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load doctor information');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await axios.get(`/api/doctors/${doctorId}/availability?date=${formData.appointmentDate}`);
      setAvailableSlots(response.data.data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Please select a future date';
      }
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Please select a time slot';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for the appointment';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
    }

    if (formData.symptoms && formData.symptoms.length > 500) {
      newErrors.symptoms = 'Symptoms cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const appointmentData = {
        doctor: doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason.trim(),
        symptoms: formData.symptoms.trim()
      };

      const response = await axios.post('/api/appointments', appointmentData);
      
      toast.success('Appointment booked successfully!');
      navigate(`/appointments/${response.data.data._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book appointment';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor not found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="btn-primary"
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600">Schedule your appointment with Dr. {doctor.user?.name || 'the selected doctor'}</p>
      </div>

      {/* Doctor Info Card */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">
              {doctor.user?.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              Dr. {doctor.user?.name || 'Unknown Doctor'}
            </h2>
            <p className="text-primary-600 font-medium">
              {doctor.specialization || 'General Medicine'}
            </p>
            <p className="text-sm text-gray-600">
              {doctor.clinic?.name || 'Clinic information not available'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              ₹{doctor.consultationFee || '0'}
            </div>
            <div className="text-sm text-gray-600">Consultation Fee</div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label htmlFor="appointmentDate" className="form-label">
              <CalendarIcon className="h-5 w-5 inline mr-2" />
              Select Date
            </label>
            <input
              id="appointmentDate"
              name="appointmentDate"
              type="date"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={getMinDate()}
              max={getMaxDate()}
              className={`input-field ${errors.appointmentDate ? 'border-red-500' : ''}`}
            />
            {errors.appointmentDate && (
              <p className="error-message">{errors.appointmentDate}</p>
            )}
          </div>

          {/* Time Selection */}
          {formData.appointmentDate && (
            <div>
              <label className="form-label">
                <ClockIcon className="h-5 w-5 inline mr-2" />
                Select Time Slot
              </label>
              {loadingSlots ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="small" />
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot }))}
                      className={`py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${
                        formData.appointmentTime === slot
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <InformationCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No available slots for this date</p>
                </div>
              )}
              {errors.appointmentTime && (
                <p className="error-message">{errors.appointmentTime}</p>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="form-label">
              <UserIcon className="h-5 w-5 inline mr-2" />
              Reason for Appointment *
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              placeholder="Please describe the reason for your appointment..."
              className={`input-field ${errors.reason ? 'border-red-500' : ''}`}
            />
            {errors.reason && (
              <p className="error-message">{errors.reason}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Minimum 10 characters required
            </p>
          </div>

          {/* Symptoms */}
          <div>
            <label htmlFor="symptoms" className="form-label">
              Symptoms (Optional)
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows="4"
              placeholder="Please describe any symptoms you're experiencing..."
              className={`input-field ${errors.symptoms ? 'border-red-500' : ''}`}
            />
            {errors.symptoms && (
              <p className="error-message">{errors.symptoms}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.symptoms.length}/500 characters
            </p>
          </div>

          {/* Summary */}
          {formData.appointmentDate && formData.appointmentTime && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Appointment Summary</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{formatTime(formData.appointmentTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <span>Dr. {doctor.user?.name || 'Unknown Doctor'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span>₹{doctor.consultationFee || '0'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/doctors')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.appointmentDate || !formData.appointmentTime}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <LoadingSpinner size="small" />
              ) : (
                'Book Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
