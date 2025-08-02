import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { 
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    businessType: user?.businessType || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Handle URL tab parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['profile', 'password', 'logout'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Logout function

  const getNotificationIcon = (type, priority) => {
    if (priority === 'high') {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
    
    switch (type) {
      case 'order':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <UserIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Logout function
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setLogoutLoading(true);
      try {
        // Get the current user role before clearing
        const currentUserRole = user?.role;
        
        // Use AuthContext logout function for immediate state update
        logout();
        
        // Clear any additional session data
        sessionStorage.clear();
        
        // Clear cart and other contexts
        localStorage.removeItem('cart');
        localStorage.removeItem('userRole');
        
        // Small delay to show loading state, then navigate
        setTimeout(() => {
          if (currentUserRole === 'admin') {
            navigate('/admin/login', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        }, 100);
        
        console.log('User logged out successfully');
      } catch (error) {
        console.error('Error during logout:', error);
        setLogoutLoading(false);
        // Even if there's an error, still redirect to login
        const currentUserRole = user?.role;
        if (currentUserRole === 'admin') {
          navigate('/admin/login', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(profileData);
      await updateUser(response.data.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'bg-red-100 text-red-800', description: 'Full system access' };
      case 'primary':
        return { label: 'Primary Customer', color: 'bg-yellow-100 text-yellow-800', description: 'Best pricing tier (10-15% discount)' };
      case 'secondary':
        return { label: 'Secondary Customer', color: 'bg-amber-100 text-amber-800', description: 'Regular customer pricing (5-10% discount)' };
      case 'registered':
        return { label: 'Registered Customer', color: 'bg-gray-100 text-gray-800', description: 'Standard pricing' };
      default:
        return { label: 'Customer', color: 'bg-gray-100 text-gray-800', description: 'Standard pricing' };
    }
  };

  const roleInfo = getRoleInfo(user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-300">
      <div className="max-w-md xs:max-w-lg sm:max-w-2xl lg:max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-6">
        
        {/* Compact User Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-slate-900/60 border border-white/20 dark:border-slate-700/50 p-4 xs:p-6 mb-4 xs:mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-3">
              <UserIcon className="h-8 w-8 xs:h-10 xs:w-10 text-white" />
            </div>
            <h2 className="text-lg xs:text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">{user?.name}</h2>
            <p className="text-gray-600 dark:text-slate-300 text-sm mb-2 break-all px-2">{user?.email}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleInfo.color} shadow-sm`}>
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Compact Tab Navigation */}
        <div className="flex bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-1 mb-4 xs:mb-6 shadow-lg border border-white/20 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 xs:py-3 px-2 xs:px-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span className="text-xs">Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 xs:py-3 px-2 xs:px-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <KeyIcon className="h-4 w-4" />
            <span className="text-xs">Password</span>
          </button>
          <button
            onClick={() => setActiveTab('logout')}
            disabled={logoutLoading}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 xs:py-3 px-2 xs:px-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'logout'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20'
            } ${logoutLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {logoutLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Logging out...</span>
              </>
            ) : (
              <>
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="text-xs">Logout</span>
              </>
            )}
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl xs:rounded-2xl shadow-xl dark:shadow-slate-900/60 border border-white/20 dark:border-slate-700/50 overflow-hidden">
          <div className="p-4 xs:p-6">
            {/* Success/Error Messages */}
            {message.text && (
              <div className={`mb-4 p-3 rounded-xl border-l-4 backdrop-blur-sm ${
                message.type === 'success' 
                  ? 'bg-green-50/80 dark:bg-green-900/30 border-green-400 dark:border-green-500' 
                  : 'bg-red-50/80 dark:bg-red-900/30 border-red-400 dark:border-red-500'
              } transition-all duration-300 shadow-lg`}>
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                  ) : (
                    <KeyIcon className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-semibold ${
                    message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {message.text}
                  </span>
                </div>
              </div>
            )}

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Profile Information
                </h3>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      icon={UserIcon}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      value={user?.email}
                      disabled
                      icon={EnvelopeIcon}
                      helpText="Email cannot be changed. Contact support if needed."
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      icon={PhoneIcon}
                      placeholder="Enter your phone number"
                    />

                    <Input
                      label="Business Type"
                      type="text"
                      name="businessType"
                      value={profileData.businessType}
                      onChange={handleProfileChange}
                      placeholder="e.g., Construction, Contractor"
                    />
                  </div>

                  <Input
                    label="Address"
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    icon={MapPinIcon}
                    placeholder="Enter your complete address"
                  />

                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {loading ? <Loading size="sm" /> : '✓ Update Profile'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Tab - Modern Design */}
            {activeTab === 'password' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center">
                  <KeyIcon className="h-6 w-6 mr-2 text-indigo-500" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={KeyIcon}
                    placeholder="Enter your current password"
                  />

                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={KeyIcon}
                    placeholder="Enter new password (min. 6 characters)"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={KeyIcon}
                    placeholder="Confirm your new password"
                  />

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-600 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-start">
                      <KeyIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-amber-800 dark:text-amber-200 font-semibold mb-2">Password Requirements:</p>
                        <ul className="text-amber-700 dark:text-amber-300 space-y-1 text-sm">
                          <li className="flex items-center"><span className="mr-2">•</span>At least 6 characters long</li>
                          <li className="flex items-center"><span className="mr-2">•</span>Use a strong, unique password</li>
                          <li className="flex items-center"><span className="mr-2">•</span>Don't reuse old passwords</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {loading ? <Loading size="sm" /> : '🔒 Change Password'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Logout Tab */}
            {activeTab === 'logout' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-red-500" />
                  Logout
                </h3>
                
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-xl mb-4">
                    <ArrowRightOnRectangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
                  </div>
                  
                  <h4 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-2">
                    Ready to logout?
                  </h4>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                    You'll be signed out and redirected to the login page.
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {logoutLoading ? (
                        <>
                          <Loading size="sm" />
                          <span className="ml-2">Logging out...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Logout Now
                        </>
                      )}
                    </Button>
                    
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      <p>{user?.email}</p>
                      <p className="mt-1">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Upgrade Info */}
        {user?.role === 'registered' && (
          <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-amber-200 dark:border-amber-700/50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg mb-3">
                <span className="text-lg">🏆</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-2">
                Upgrade Your Account
              </h3>
              <p className="text-gray-700 dark:text-slate-300 mb-3 text-sm leading-relaxed">
                Contact us for Primary or Secondary customer status and enjoy exclusive discounts.
              </p>
              <Button 
                variant="outline" 
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
              >
                📞 Contact for Upgrade
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
