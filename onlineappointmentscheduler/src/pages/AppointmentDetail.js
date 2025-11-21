import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckCircleIcon,
  PencilIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/appointments/${id}`);
      setAppointment(response.data.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (action, data = {}) => {
    try {
      setActionLoading(true);
      
      if (action === 'confirm') {
        await axios.put(`/api/appointments/${id}`, { status: 'confirmed' });
        toast.success('Appointment confirmed successfully');
      } else if (action === 'cancel') {
        await axios.put(`/api/appointments/${id}/cancel`, { 
          cancellationReason: data.reason || 'Cancelled by user' 
        });
        toast.success('Appointment cancelled successfully');
      } else if (action === 'complete') {
        await axios.put(`/api/appointments/${id}`, { 
          status: 'completed',
          notes: data.notes,
          prescription: data.prescription,
          diagnosis: data.diagnosis
        });
        toast.success('Appointment marked as completed');
      } else if (action === 'reschedule') {
        await axios.put(`/api/appointments/${id}/reschedule`, {
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime
        });
        toast.success('Appointment rescheduled successfully');
      }
      
      fetchAppointment();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update appointment';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRating = async () => {
    try {
      setActionLoading(true);
      await axios.put(`/api/appointments/${id}/rate`, {
        score: rating,
        review: review
      });
      toast.success('Rating submitted successfully');
      setShowRatingModal(false);
      fetchAppointment();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit rating';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`h-6 w-6 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        >
          <StarIcon />
        </button>
      );
    }
    return stars;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment not found</h2>
        <Link to="/appointments" className="btn-primary">
          Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link
          to="/appointments"
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          ← Back to Appointments
        </Link>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      {/* Appointment Info */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.patient?.name}</p>
                  <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-600">{appointment.patient?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">Dr. {appointment.doctor?.user?.name}</p>
                  <p className="text-sm text-gray-600">{appointment.doctor?.specialization}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-600">Consultation Fee: ₹{appointment.consultationFee}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-600">{formatDate(appointment.appointmentDate)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Time</p>
                <p className="text-sm text-gray-600">{formatTime(appointment.appointmentTime)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">Reason</p>
              <p className="text-sm text-gray-600">{appointment.reason}</p>
            </div>
            {appointment.symptoms && (
              <div>
                <p className="font-medium text-gray-900">Symptoms</p>
                <p className="text-sm text-gray-600">{appointment.symptoms}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical Information (for completed appointments) */}
      {appointment.status === 'completed' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
          <div className="space-y-4">
            {appointment.diagnosis && (
              <div>
                <p className="font-medium text-gray-900">Diagnosis</p>
                <p className="text-sm text-gray-600">{appointment.diagnosis}</p>
              </div>
            )}
            {appointment.prescription && (
              <div>
                <p className="font-medium text-gray-900">Prescription</p>
                <p className="text-sm text-gray-600">{appointment.prescription}</p>
              </div>
            )}
            {appointment.notes && (
              <div>
                <p className="font-medium text-gray-900">Notes</p>
                <p className="text-sm text-gray-600">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating (for completed appointments) */}
      {appointment.status === 'completed' && user?.role === 'patient' && !appointment.rating?.score && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h2>
          <button
            onClick={() => setShowRatingModal(true)}
            className="btn-primary"
          >
            Rate Appointment
          </button>
        </div>
      )}

      {/* Existing Rating */}
      {appointment.rating?.score && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating & Review</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < appointment.rating.score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {appointment.rating.score}/5
              </span>
            </div>
            {appointment.rating.review && (
              <p className="text-sm text-gray-600">{appointment.rating.review}</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {/* Doctor Actions */}
          {user?.role === 'doctor' && appointment.status === 'pending' && (
            <>
              <button
                onClick={() => handleAppointmentAction('confirm')}
                disabled={actionLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Confirm</span>
              </button>
              <button
                onClick={() => handleAppointmentAction('cancel', { reason: 'Cancelled by doctor' })}
                disabled={actionLoading}
                className="btn-danger flex items-center space-x-2"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </>
          )}

          {/* Patient Actions */}
          {user?.role === 'patient' && appointment.status === 'confirmed' && appointment.canBeCancelled && (
            <button
              onClick={() => handleAppointmentAction('cancel', { reason: 'Cancelled by patient' })}
              disabled={actionLoading}
              className="btn-danger flex items-center space-x-2"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Cancel Appointment</span>
            </button>
          )}

          {/* Reschedule (for patients) */}
          {user?.role === 'patient' && (appointment.status === 'confirmed' || appointment.status === 'pending') && (
            <Link
              to={`/appointments/${id}/reschedule`}
              className="btn-secondary flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Reschedule</span>
            </Link>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Rating</label>
                <div className="flex space-x-1">
                  {renderStars(rating)}
                </div>
              </div>
              
              <div>
                <label className="form-label">Review (Optional)</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows="3"
                  className="input-field"
                  placeholder="Share your experience..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRating}
                disabled={actionLoading || rating === 0}
                className="btn-primary flex-1"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetail;
