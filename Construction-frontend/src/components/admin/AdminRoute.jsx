import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminAuthService from '../../services/adminAuthService';
import Loading from '../common/Loading';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Enhanced debugging
  const debugInfo = {
    user,
    isAuthenticated,
    isLoading,
    userExists: !!user,
    userEmail: user?.email,
    userRole: user?.role,
    localStorageToken: localStorage.getItem('token'),
    localStorageUser: localStorage.getItem('user')
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Simple admin check - just check if role is admin
  const isAdmin = user.role === 'admin';

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. This area is restricted to administrators only.
          </p>
          <div className="text-sm text-gray-500 mb-4 text-left bg-gray-50 p-3 rounded">
            <div><strong>Debug Info:</strong></div>
            <div>User: {user?.email || 'Unknown'}</div>
            <div>Role: {user?.role || 'Not set'}</div>
            <div>ID: {user?._id || user?.id || 'None'}</div>
            <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
            <a
              href="/"
              className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
