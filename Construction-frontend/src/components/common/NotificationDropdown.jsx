import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = forwardRef((props, ref) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refreshUnreadCount: loadUnreadCount
  }));

  // Load unread count on mount and poll for updates
  useEffect(() => {
    loadUnreadCount();
    
    // Listen for notification refresh events
    const handleRefresh = () => {
      loadUnreadCount();
    };
    
    window.addEventListener('refreshNotifications', handleRefresh);
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response?.data?.unreadCount || response?.unreadCount || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <button
      onClick={handleNotificationClick}
      className="relative p-2 text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 cursor-pointer"
      title="View notifications"
    >
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-400 text-white dark:text-slate-900 text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg font-bold border border-white dark:border-slate-900">
          <span className="text-xs leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      )}
    </button>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown';

export default NotificationDropdown;
