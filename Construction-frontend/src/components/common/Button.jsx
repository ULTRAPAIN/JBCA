import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  loading = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl';

  const variants = {
    primary: 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 text-white hover:from-amber-600 hover:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500 focus:ring-amber-500 dark:focus:ring-amber-400 shadow-amber-500/25 dark:shadow-amber-400/25',
    secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 focus:ring-slate-500 dark:focus:ring-slate-400 shadow-slate-500/25',
    outline: 'border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-500 dark:hover:border-amber-400 focus:ring-amber-500 dark:focus:ring-amber-400 shadow-amber-400/20',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 text-white hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 focus:ring-red-500 dark:focus:ring-red-400 shadow-red-500/25',
    success: 'bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 focus:ring-green-500 dark:focus:ring-green-400 shadow-green-500/25',
    ghost: 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white focus:ring-gray-500 dark:focus:ring-slate-400 shadow-none hover:shadow-md',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm font-semibold',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-base font-bold',
    xl: 'px-10 py-5 text-lg font-bold',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
