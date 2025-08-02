import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { EyeIcon, EyeSlashIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
      // Navigation will be handled by useEffect
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
        <Loading size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-800 flex items-start mobile-md:items-center justify-center py-4 mobile-md:py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-2 mobile-md:space-y-3 sm:space-y-6 mt-4 mobile-md:mt-0">
        {/* Header - Very compact on mobile */}
        <div className="text-center">
          <div className="mx-auto h-10 w-10 mobile-md:h-12 mobile-md:w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 rounded-full flex items-center justify-center mb-2 mobile-md:mb-3 sm:mb-4 shadow-lg dark:shadow-amber-400/30">
            <BuildingStorefrontIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="text-lg mobile-md:text-xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1 mobile-md:mb-2">
            Welcome Back
          </h2>
          <p className="text-xs mobile-md:text-sm sm:text-base text-gray-600 dark:text-slate-300">
            Sign in to <span className="text-red-600 dark:text-orange-400 font-semibold">Jai Bhavani Cement Agency</span>
          </p>
        </div>

        {/* Login Form - Very compact spacing */}
        <div className="bg-white dark:bg-slate-800 rounded-lg mobile-md:rounded-xl sm:rounded-2xl shadow-xl dark:shadow-slate-900/60 p-3 mobile-md:p-4 sm:p-6 border-t-4 border-yellow-400 dark:border-amber-400 transition-colors duration-300">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-2 mobile-md:p-3 mb-2 mobile-md:mb-3 sm:mb-4 rounded-lg">
              <p className="text-xs mobile-md:text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 mobile-md:space-y-3 sm:space-y-4">
            <Input
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="border-gray-300 dark:border-slate-600 focus:border-yellow-400 dark:focus:border-amber-400 focus:ring-yellow-400 dark:focus:ring-amber-400 dark:bg-slate-700 dark:text-slate-100"
            />

            <div className="relative">
              <Input
                id="password"
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="border-gray-300 dark:border-slate-600 focus:border-yellow-400 dark:focus:border-amber-400 focus:ring-yellow-400 dark:focus:ring-amber-400 pr-10 dark:bg-slate-700 dark:text-slate-100"
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
            </div>

            <div className="flex items-center justify-between text-xs mobile-md:text-sm pt-1">
              <label className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3 w-3 mobile-md:h-4 mobile-md:w-4 text-yellow-600 dark:text-amber-500 focus:ring-yellow-500 dark:focus:ring-amber-400 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
                />
                <span className="ml-1 mobile-md:ml-2 text-gray-900 dark:text-slate-300">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-red-600 dark:text-orange-400 hover:text-red-800 dark:hover:text-orange-300 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 hover:from-yellow-500 hover:to-red-600 dark:hover:from-amber-500 dark:hover:to-orange-600 text-white font-bold py-2 mobile-md:py-2.5 sm:py-3 px-4 shadow-lg dark:shadow-amber-400/30 hover:shadow-xl dark:hover:shadow-amber-400/40 transform hover:scale-105 transition-all duration-300 text-sm mobile-md:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center text-white">
                  <Loading size="sm" className="mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-2 mobile-md:mt-3 sm:mt-4 text-center">
            <p className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-300">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-red-600 dark:text-orange-400 hover:text-red-800 dark:hover:text-orange-300 transition-colors duration-200"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Support Link - Very compact on mobile */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Need help?{' '}
            <Link
              to="/contact"
              className="font-medium text-red-600 dark:text-orange-400 hover:text-red-800 dark:hover:text-orange-300 transition-colors duration-200"
            >
              Contact support
            </Link>
          </p>
        </div>
        </div>
      </div>
  );
};

export default LoginPage;
