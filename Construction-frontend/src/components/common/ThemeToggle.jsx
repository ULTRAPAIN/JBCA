import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`
        relative inline-flex items-center justify-center w-10 h-10 
        rounded-xl transition-all duration-300 ease-in-out
        ${isDarkMode 
          ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-amber-400/30 shadow-lg shadow-slate-900/20' 
          : 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 hover:border-yellow-300 shadow-md'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDarkMode 
          ? 'focus:ring-amber-400/50 focus:ring-offset-slate-900' 
          : 'focus:ring-yellow-400 focus:ring-offset-white'
        }
        transform hover:scale-105 active:scale-95
        ${className}
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon for Light Mode */}
        <SunIcon 
          className={`
            absolute inset-0 h-6 w-6 transition-all duration-500 ease-in-out transform
            ${!isDarkMode 
              ? 'opacity-100 rotate-0 scale-100 text-yellow-600' 
              : 'opacity-0 rotate-180 scale-0 text-yellow-400'
            }
          `}
        />
        {/* Moon Icon for Dark Mode */}
        <MoonIcon 
          className={`
            absolute inset-0 h-6 w-6 transition-all duration-500 ease-in-out transform
            ${isDarkMode 
              ? 'opacity-100 rotate-0 scale-100 text-amber-400 drop-shadow-sm' 
              : 'opacity-0 -rotate-180 scale-0 text-gray-600'
            }
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
