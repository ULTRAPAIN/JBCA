import React from 'react';

const Loading = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '', 
  variant = 'crane', // 'crane', 'building', 'mixer', 'simple'
  showLogo = false 
}) => {
  const sizes = {
    sm: { container: 'h-8 w-8', text: 'text-xs' },
    md: { container: 'h-12 w-12', text: 'text-sm' },
    lg: { container: 'h-16 w-16', text: 'text-base' },
    xl: { container: 'h-24 w-24', text: 'text-lg' },
  };

  // Construction Crane Animation
  const CraneLoader = () => (
    <div className={`relative ${sizes[size].container}`}>
      {/* Base */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-yellow-600 rounded"></div>
      
      {/* Mast */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-0.5 w-1 h-8 bg-yellow-500 origin-bottom animate-pulse"></div>
      
      {/* Jib (horizontal arm) */}
      <div className="absolute top-2 left-1/2 transform -translate-x-4 w-8 h-0.5 bg-yellow-500 origin-left animate-bounce"></div>
      
      {/* Hook */}
      <div className="absolute top-3 right-1 w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
      
      {/* Load */}
      <div className="absolute top-4 right-0.5 w-1.5 h-1.5 bg-orange-500 rounded animate-bounce delay-150"></div>
    </div>
  );

  // Building Construction Animation
  const BuildingLoader = () => (
    <div className={`relative ${sizes[size].container}`}>
      {/* Foundation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 rounded"></div>
      
      {/* Building layers - animated construction */}
      <div className="absolute bottom-1 left-1 w-3 h-2 bg-yellow-500 rounded-t animate-pulse"></div>
      <div className="absolute bottom-3 left-1 w-3 h-2 bg-yellow-400 rounded-t animate-pulse delay-150"></div>
      <div className="absolute bottom-5 left-1 w-3 h-2 bg-yellow-300 rounded-t animate-pulse delay-300"></div>
      
      {/* Building layers right side */}
      <div className="absolute bottom-1 right-1 w-3 h-3 bg-orange-500 rounded-t animate-pulse delay-75"></div>
      <div className="absolute bottom-4 right-1 w-3 h-2 bg-orange-400 rounded-t animate-pulse delay-225"></div>
      
      {/* Windows - blinking */}
      <div className="absolute bottom-2 left-1.5 w-0.5 h-0.5 bg-blue-300 animate-ping delay-100"></div>
      <div className="absolute bottom-4 right-1.5 w-0.5 h-0.5 bg-blue-300 animate-ping delay-200"></div>
    </div>
  );

  // Cement Mixer Animation
  const MixerLoader = () => (
    <div className={`relative ${sizes[size].container}`}>
      {/* Truck base */}
      <div className="absolute bottom-0 left-0 w-6 h-2 bg-red-600 rounded"></div>
      
      {/* Wheels */}
      <div className="absolute bottom-0 left-1 w-1.5 h-1.5 bg-gray-800 rounded-full animate-spin"></div>
      <div className="absolute bottom-0 right-1 w-1.5 h-1.5 bg-gray-800 rounded-full animate-spin"></div>
      
      {/* Mixer drum */}
      <div className="absolute bottom-2 left-1.5 w-4 h-4 bg-yellow-500 rounded-full animate-spin-slow border-2 border-yellow-600"></div>
      
      {/* Mixer blades inside */}
      <div className="absolute bottom-3 left-2.5 w-2 h-0.5 bg-yellow-700 rounded animate-spin origin-center"></div>
      
      {/* Cement particles */}
      <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="absolute top-0 right-2 w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
      <div className="absolute top-2 left-4 w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
    </div>
  );

  // Simple Spinner with Construction Colors
  const SimpleLoader = () => (
    <div className={`${sizes[size].container} relative`}>
      <svg
        className="animate-spin w-full h-full text-yellow-500"
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
      {/* Hard hat icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-yellow-400 rounded-t-full border-b-2 border-yellow-600"></div>
      </div>
    </div>
  );

  // Company Logo with Animation
  const AnimatedLogo = () => (
    <div className="flex items-center justify-center mb-4">
      <div className="relative">
        {/* Logo background with construction theme */}
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-lg animate-pulse flex items-center justify-center relative overflow-hidden">
          {/* Construction elements background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          
          {/* Main logo content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-white">
            {/* Construction/Building skyline */}
            <div className="flex items-end space-x-1 mb-2">
              <div className="w-1.5 h-4 bg-white rounded-t animate-pulse"></div>
              <div className="w-1.5 h-5 bg-white rounded-t animate-pulse delay-75"></div>
              <div className="w-1.5 h-4 bg-white rounded-t animate-pulse delay-150"></div>
            </div>
            
            {/* Company name */}
            <div className="text-lg font-bold leading-none">JB</div>
            <div className="text-xs leading-none opacity-90">CA</div>
          </div>
        </div>
        
        {/* Construction particles around logo */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping delay-150"></div>
        <div className="absolute top-1 -left-2 w-1 h-1 bg-red-400 rounded-full animate-ping delay-300"></div>
        
        {/* Construction crane on top */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-0.5 h-4 bg-gray-600 rounded animate-bounce delay-100"></div>
          <div className="absolute top-0 -left-2 w-4 h-0.5 bg-gray-600 rounded animate-bounce delay-200"></div>
          <div className="absolute top-1 right-0 w-0.5 h-0.5 bg-red-500 rounded-full animate-ping delay-300"></div>
        </div>
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'crane':
        return <CraneLoader />;
      case 'building':
        return <BuildingLoader />;
      case 'mixer':
        return <MixerLoader />;
      case 'simple':
      default:
        return <SimpleLoader />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {showLogo && <AnimatedLogo />}
      
      {renderLoader()}
      
      {text && (
        <div className="text-center">
          <p className={`text-gray-700 dark:text-slate-300 font-medium ${sizes[size].text}`}>
            {text}
          </p>
          {variant === 'crane' && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Building your experience...
            </p>
          )}
          {variant === 'building' && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Constructing content...
            </p>
          )}
          {variant === 'mixer' && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Mixing things up...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Loading;
