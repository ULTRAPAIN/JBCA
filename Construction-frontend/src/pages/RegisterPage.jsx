import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    businessType: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    feedback: 'Password strength will appear here'
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      hasLength: password.length >= 6,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    let feedback = '';
    let strengthLevel = '';
    
    if (score === 0) {
      feedback = 'Enter a password to see strength';
      strengthLevel = '';
    } else if (score < 3) {
      feedback = 'Weak password';
      strengthLevel = 'weak';
    } else if (score < 4) {
      feedback = 'Fair password';
      strengthLevel = 'fair';
    } else if (score < 5) {
      feedback = 'Good password';
      strengthLevel = 'good';
    } else {
      feedback = 'Strong password';
      strengthLevel = 'strong';
    }

    return { ...checks, score, feedback, strengthLevel };
  };

  const validateForm = () => {
    const errors = {};

    // Name validation - No numbers allowed
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (/\d/.test(formData.name)) {
      errors.name = 'Name cannot contain numbers';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Enhanced Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const strength = checkPasswordStrength(formData.password);
      if (!strength.hasLength) {
        errors.password = 'Password must be at least 6 characters';
      } else if (!strength.hasLower) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!strength.hasUpper) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!strength.hasNumber) {
        errors.password = 'Password must contain at least one number';
      } else if (!strength.hasSpecial) {
        errors.password = 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation - now required
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent numbers and special characters in name field
    if (name === 'name') {
      // Only allow letters and spaces
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({
        ...formData,
        [name]: filteredValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Update password strength when password changes
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError('');
    setValidationErrors({});

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        businessType: formData.businessType,
      };

      await register(userData);
      // Navigation will be handled by useEffect
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.password && 
                     formData.confirmPassword && formData.password === formData.confirmPassword &&
                     formData.phone && // Phone is now required
                     passwordStrength.score === 5; // All password requirements must be met

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
        <Loading size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start mobile-md:items-center justify-center bg-gray-50 dark:bg-slate-900 py-4 mobile-md:py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-lg w-full space-y-2 mobile-md:space-y-3 sm:space-y-6 mt-4 mobile-md:mt-0">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 mobile-md:h-12 mobile-md:w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 rounded-full flex items-center justify-center shadow-lg dark:shadow-amber-400/30">
            <span className="text-white font-bold text-xs mobile-md:text-sm sm:text-xl">JB</span>
          </div>
          <h2 className="mt-1 mobile-md:mt-2 sm:mt-4 text-center text-lg mobile-md:text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-slate-100">
            Create your account
          </h2>
          <p className="mt-1 mobile-md:mt-2 text-center text-xs mobile-md:text-sm text-gray-600 dark:text-slate-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-red-600 dark:text-orange-400 hover:text-red-800 dark:hover:text-orange-300"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <form className="bg-white dark:bg-slate-800 p-3 mobile-md:p-4 sm:p-6 rounded-lg mobile-md:rounded-xl sm:rounded-2xl shadow-xl dark:shadow-slate-900/60 border-t-4 border-yellow-400 dark:border-amber-400 transition-colors duration-300" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500 rounded-md p-2 mobile-md:p-3 mb-2 mobile-md:mb-3 sm:mb-4">
              <div className="text-xs mobile-md:text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          )}

          <div className="space-y-2 mobile-md:space-y-3 sm:space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Enter your full name"
              error={validationErrors.name}
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Enter your email"
              error={validationErrors.email}
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              autoComplete="tel"
              placeholder="Enter your phone number"
              error={validationErrors.phone}
            />

            <Input
              label="Business Type"
              type="text"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              placeholder="Construction, Contractor, etc."
            />

            <Input
              label="Address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address (optional)"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Create password (min. 6 chars)"
                error={validationErrors.password}
              />
              <button
                type="button"
                className="absolute top-8 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300" />
                ) : (
                  <EyeIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300" />
                )}
              </button>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Password Strength</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.strengthLevel === 'weak' ? 'text-red-500' :
                      passwordStrength.strengthLevel === 'fair' ? 'text-orange-500' :
                      passwordStrength.strengthLevel === 'good' ? 'text-yellow-500' :
                      passwordStrength.strengthLevel === 'strong' ? 'text-green-500' :
                      'text-gray-400'
                    }`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score === 0 ? 'w-0 bg-gray-300' :
                        passwordStrength.score === 1 ? 'w-1/5 bg-red-500' :
                        passwordStrength.score === 2 ? 'w-2/5 bg-red-400' :
                        passwordStrength.score === 3 ? 'w-3/5 bg-orange-500' :
                        passwordStrength.score === 4 ? 'w-4/5 bg-yellow-500' :
                        'w-full bg-green-500'
                      }`}
                    ></div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      {passwordStrength.hasLength ? (
                        <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XMarkIcon className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.hasLength ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.hasLower ? (
                        <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XMarkIcon className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.hasLower ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.hasUpper ? (
                        <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XMarkIcon className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.hasUpper ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.hasNumber ? (
                        <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XMarkIcon className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.hasNumber ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.hasSpecial ? (
                        <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XMarkIcon className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.hasSpecial ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        One special character (!@#$%^&*...)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
                error={validationErrors.confirmPassword}
              />
              <button
                type="button"
                className="absolute top-8 right-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300" />
                ) : (
                  <EyeIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Terms and Conditions with better spacing */}
          <div className="flex items-start mt-4 mobile-md:mt-5 sm:mt-6 mb-4 mobile-md:mb-5 sm:mb-6">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-3 w-3 mobile-md:h-4 mobile-md:w-4 mt-1 text-yellow-600 dark:text-amber-500 focus:ring-yellow-500 dark:focus:ring-amber-400 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 flex-shrink-0"
            />
            <label htmlFor="terms" className="ml-3 block text-xs mobile-md:text-sm text-gray-900 dark:text-slate-300 leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" className="text-red-600 dark:text-orange-400 hover:text-red-800 dark:hover:text-orange-300 font-medium underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-red-600 dark:text-orange-400 hover:text-red-800 dark:hover:text-orange-300 font-medium underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 hover:from-yellow-500 hover:to-red-600 dark:hover:from-amber-500 dark:hover:to-orange-600 text-white font-bold py-2 mobile-md:py-2.5 sm:py-3 px-4 shadow-lg dark:shadow-amber-400/30 hover:shadow-xl dark:hover:shadow-amber-400/40 transform hover:scale-105 transition-all duration-300 text-sm mobile-md:text-base"
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <Loading size="sm" text="Creating account..." />
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Need help?{' '}
            <Link
              to="/contact"
              className="font-medium text-red-600 dark:text-orange-400 hover:text-red-800 dark:hover:text-orange-300"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
