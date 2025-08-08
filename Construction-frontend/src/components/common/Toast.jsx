import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Toast = ({ 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 4000, 
  onClose,
  isVisible = false
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border
          ${getBackgroundColor()}
        `}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${getTextColor()}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded-md`}
                onClick={() => {
                  setShow(false);
                  setTimeout(() => {
                    if (onClose) onClose();
                  }, 300);
                }}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
