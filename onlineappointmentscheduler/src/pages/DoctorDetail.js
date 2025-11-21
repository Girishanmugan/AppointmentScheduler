import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DoctorDetail = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, id]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/doctors/${id}`);
      setDoctor(response.data.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await axios.get(`/api/doctors/${id}/availability?date=${selectedDate}`);
      setAvailableSlots(response.data.data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-5 w-5 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }

    return stars;
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
        <Link to="/doctors" className="btn-primary">
          Back to Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/doctors"
        className="inline-flex items-center text-primary-600 hover:text-primary-700"
      >
        ← Back to Doctors
      </Link>

      {/* Doctor Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-600">
              {doctor.user?.name?.charAt(0)}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Dr. {doctor.user?.name}
            </h1>
            <p className="text-xl text-primary-600 font-medium">
              {doctor.specialization}
            </p>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center">
                {renderStars(doctor.rating?.average || 0)}
              </div>
              <span className="text-sm text-gray-600">
                {doctor.rating?.average?.toFixed(1) || 'N/A'} ({doctor.rating?.count || 0} reviews)
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ₹{doctor.consultationFee}
            </div>
            <div className="text-sm text-gray-600">Consultation Fee</div>
            <Link
              to={`/appointments/book/${doctor._id}`}
              className="btn-primary mt-3"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            {doctor.bio ? (
              <p className="text-gray-600">{doctor.bio}</p>
            ) : (
              <p className="text-gray-500 italic">No bio available</p>
            )}
          </div>

          {/* Education & Experience */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Education & Experience</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AcademicCapIcon className="h-5 w-5 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Education</h3>
                  <p className="text-gray-600">{doctor.education}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Experience</h3>
                  <p className="text-gray-600">{doctor.experience} years of experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Clinic Information</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{doctor.clinic?.name}</h3>
                  <p className="text-gray-600">
                    {doctor.clinic?.address?.street && `${doctor.clinic.address.street}, `}
                    {doctor.clinic?.address?.city}, {doctor.clinic?.address?.state}
                    {doctor.clinic?.address?.zipCode && ` ${doctor.clinic.address.zipCode}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-gray-600">{doctor.clinic?.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-gray-600">{doctor.clinic?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="space-y-6">
          {/* Quick Book */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Book Appointment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="input-field"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="form-label">Available Time Slots</label>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner size="small" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => (
                        <Link
                          key={slot}
                          to={`/appointments/book/${doctor._id}?date=${selectedDate}&time=${slot}`}
                          className="text-center py-2 px-3 border border-primary-300 rounded-lg text-primary-700 hover:bg-primary-50 transition-colors"
                        >
                          {formatTime(slot)}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No available slots for this date</p>
                  )}
                </div>
              )}

              <Link
                to={`/appointments/book/${doctor._id}`}
                className="btn-primary w-full text-center"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Availability */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
            {doctor.availability && doctor.availability.length > 0 ? (
              <div className="space-y-2">
                {doctor.availability.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{slot.dayOfWeek}</span>
                    <span className="text-gray-600">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Availability not set</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-primary-600" />
                <span className="text-gray-600">{doctor.user?.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-primary-600" />
                <span className="text-gray-600">{doctor.user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
