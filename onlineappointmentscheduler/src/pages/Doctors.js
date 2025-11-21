import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, [currentPage, specialization, city]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      if (specialization) params.append('specialization', specialization);
      if (city) params.append('city', city);

      const response = await axios.get(`/api/doctors?${params}`);
      setDoctors(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get('/api/doctors/specializations');
      setSpecializations(response.data.data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDoctors();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialization('');
    setCity('');
    setCurrentPage(1);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.clinic?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
          <p className="text-gray-600">Book appointments with qualified healthcare professionals</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors, specializations, or clinics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="input-field"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-field"
            />

            <div className="flex space-x-2">
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Search</span>
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary flex items-center space-x-2"
              >
                <FunnelIcon className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor._id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="space-y-4">
              {/* Doctor Info */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary-600">
                    {doctor.user?.name?.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {doctor.user?.name}
                </h3>
                <p className="text-primary-600 font-medium">
                  {doctor.specialization}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center space-x-1">
                <div className="flex items-center">
                  {renderStars(doctor.rating?.average || 0)}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  ({doctor.rating?.count || 0} reviews)
                </span>
              </div>

              {/* Clinic Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{doctor.clinic?.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{doctor.clinic?.address?.city}, {doctor.clinic?.address?.state}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  <span>{doctor.clinic?.phone}</span>
                </div>
              </div>

              {/* Experience and Fee */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {doctor.experience} years experience
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{doctor.consultationFee}
                </span>
              </div>

              {/* Availability */}
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-2" />
                <span>
                  {doctor.availability?.length > 0 ? 'Available' : 'Not Available'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Link
                  to={`/doctors/${doctor._id}`}
                  className="flex-1 btn-secondary text-center"
                >
                  View Profile
                </Link>
                <Link
                  to={`/appointments/book/${doctor._id}`}
                  className="flex-1 btn-primary text-center"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Doctors;
