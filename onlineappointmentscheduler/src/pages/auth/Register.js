import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    role: 'patient',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    // Doctor-specific fields
    specialization: '',
    experience: '',
    education: '',
    licenseNumber: '',
    clinic: {
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    consultationFee: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.includes('clinic.address.')) {
      const field = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        clinic: {
          ...prev.clinic,
          address: {
            ...prev.clinic.address,
            [field]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Doctor-specific validation
    if (formData.role === 'doctor') {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!formData.experience) {
        newErrors.experience = 'Experience is required';
      }
      if (!formData.education.trim()) {
        newErrors.education = 'Education is required';
      }
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
      if (!formData.clinic.name.trim()) {
        newErrors['clinic.name'] = 'Clinic name is required';
      }
      if (!formData.clinic.phone) {
        newErrors['clinic.phone'] = 'Clinic phone is required';
      }
      if (!formData.clinic.email) {
        newErrors['clinic.email'] = 'Clinic email is required';
      }
      if (!formData.consultationFee) {
        newErrors.consultationFee = 'Consultation fee is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      role: formData.role,
      address: formData.address
    };

    // Add doctor-specific fields if role is doctor
    if (formData.role === 'doctor') {
      submitData.specialization = formData.specialization;
      submitData.experience = parseInt(formData.experience);
      submitData.education = formData.education;
      submitData.licenseNumber = formData.licenseNumber;
      submitData.clinic = formData.clinic;
      submitData.consultationFee = parseFloat(formData.consultationFee);
    }

    console.log('Submitting registration data:', submitData);
    const result = await register(submitData);
    console.log('Registration result:', result);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="error-message">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth *
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`input-field ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                />
                {errors.dateOfBirth && <p className="error-message">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="form-label">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`input-field ${errors.gender ? 'border-red-500' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="error-message">{errors.gender}</p>}
              </div>

              <div>
                <label htmlFor="role" className="form-label">
                  Account Type *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
              
              <div>
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
              </div>

              {/* Address Section */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900">Address</h4>
                
                <div>
                  <label htmlFor="address.street" className="form-label">
                    Street Address
                  </label>
                  <input
                    id="address.street"
                    name="address.street"
                    type="text"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="address.city" className="form-label">
                      City
                    </label>
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label htmlFor="address.state" className="form-label">
                      State
                    </label>
                    <input
                      id="address.state"
                      name="address.state"
                      type="text"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="address.zipCode" className="form-label">
                      ZIP Code
                    </label>
                    <input
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <label htmlFor="address.country" className="form-label">
                      Country
                    </label>
                    <input
                      id="address.country"
                      name="address.country"
                      type="text"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor-specific fields */}
          {formData.role === 'doctor' && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Doctor Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="specialization" className="form-label">
                      Specialization *
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      value={formData.specialization}
                      onChange={handleChange}
                      className={`input-field ${errors.specialization ? 'border-red-500' : ''}`}
                      placeholder="e.g., Cardiology, Neurology"
                    />
                    {errors.specialization && <p className="error-message">{errors.specialization}</p>}
                  </div>

                  <div>
                    <label htmlFor="experience" className="form-label">
                      Years of Experience *
                    </label>
                    <input
                      id="experience"
                      name="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`input-field ${errors.experience ? 'border-red-500' : ''}`}
                      placeholder="Years of experience"
                    />
                    {errors.experience && <p className="error-message">{errors.experience}</p>}
                  </div>

                  <div>
                    <label htmlFor="education" className="form-label">
                      Education *
                    </label>
                    <textarea
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className={`input-field ${errors.education ? 'border-red-500' : ''}`}
                      placeholder="Medical degree and qualifications"
                      rows="3"
                    />
                    {errors.education && <p className="error-message">{errors.education}</p>}
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="form-label">
                      License Number *
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={`input-field ${errors.licenseNumber ? 'border-red-500' : ''}`}
                      placeholder="Medical license number"
                    />
                    {errors.licenseNumber && <p className="error-message">{errors.licenseNumber}</p>}
                  </div>

                  <div>
                    <label htmlFor="consultationFee" className="form-label">
                      Consultation Fee (₹) *
                    </label>
                    <input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      className={`input-field ${errors.consultationFee ? 'border-red-500' : ''}`}
                      placeholder="Consultation fee"
                    />
                    {errors.consultationFee && <p className="error-message">{errors.consultationFee}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Clinic Information</h4>
                  
                  <div>
                    <label htmlFor="clinic.name" className="form-label">
                      Clinic/Hospital Name *
                    </label>
                    <input
                      id="clinic.name"
                      name="clinic.name"
                      type="text"
                      value={formData.clinic.name}
                      onChange={handleChange}
                      className={`input-field ${errors['clinic.name'] ? 'border-red-500' : ''}`}
                      placeholder="Clinic or hospital name"
                    />
                    {errors['clinic.name'] && <p className="error-message">{errors['clinic.name']}</p>}
                  </div>

                  <div>
                    <label htmlFor="clinic.phone" className="form-label">
                      Clinic Phone *
                    </label>
                    <input
                      id="clinic.phone"
                      name="clinic.phone"
                      type="tel"
                      value={formData.clinic.phone}
                      onChange={handleChange}
                      className={`input-field ${errors['clinic.phone'] ? 'border-red-500' : ''}`}
                      placeholder="Clinic phone number"
                    />
                    {errors['clinic.phone'] && <p className="error-message">{errors['clinic.phone']}</p>}
                  </div>

                  <div>
                    <label htmlFor="clinic.email" className="form-label">
                      Clinic Email *
                    </label>
                    <input
                      id="clinic.email"
                      name="clinic.email"
                      type="email"
                      value={formData.clinic.email}
                      onChange={handleChange}
                      className={`input-field ${errors['clinic.email'] ? 'border-red-500' : ''}`}
                      placeholder="Clinic email address"
                    />
                    {errors['clinic.email'] && <p className="error-message">{errors['clinic.email']}</p>}
                  </div>

                  <div>
                    <label htmlFor="clinic.address.street" className="form-label">
                      Clinic Address
                    </label>
                    <input
                      id="clinic.address.street"
                      name="clinic.address.street"
                      type="text"
                      value={formData.clinic.address.street}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Clinic street address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="clinic.address.city" className="form-label">
                        City
                      </label>
                      <input
                        id="clinic.address.city"
                        name="clinic.address.city"
                        type="text"
                        value={formData.clinic.address.city}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label htmlFor="clinic.address.state" className="form-label">
                        State
                      </label>
                      <input
                        id="clinic.address.state"
                        name="clinic.address.state"
                        type="text"
                        value={formData.clinic.address.state}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="State"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
