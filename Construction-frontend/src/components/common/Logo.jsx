import React from 'react';

const Logo = ({ 
  size = 'md', 
  variant = 'default', // 'default', 'minimal', 'animated'
  showText = false,
  className = '' 
}) => {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const LogoIcon = () => (
    <div className={`
      ${sizes[size]} 
      bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 
      dark:from-amber-400 dark:via-orange-500 dark:to-red-500 
      rounded-2xl flex items-center justify-center shadow-lg 
      dark:shadow-amber-400/30 relative overflow-hidden
      ${variant === 'animated' ? 'animate-pulse' : ''}
      ${className}
    `}>
      {/* Construction elements background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
        <div className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-white rounded-full"></div>
      </div>
      
      {/* Main logo content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white">
        {/* Construction/Building skyline */}
        <div className="flex items-end space-x-0.5 mb-0.5">
          <div className={`
            w-0.5 h-2 bg-white rounded-t
            ${size === 'xs' ? 'w-0.5 h-1' : ''}
            ${size === 'sm' ? 'w-0.5 h-1.5' : ''}
            ${size === 'lg' ? 'w-1 h-3' : ''}
            ${size === 'xl' ? 'w-1.5 h-4' : ''}
            ${variant === 'animated' ? 'animate-pulse' : ''}
          `}></div>
          <div className={`
            w-0.5 h-2.5 bg-white rounded-t
            ${size === 'xs' ? 'w-0.5 h-1.5' : ''}
            ${size === 'sm' ? 'w-0.5 h-2' : ''}
            ${size === 'lg' ? 'w-1 h-4' : ''}
            ${size === 'xl' ? 'w-1.5 h-5' : ''}
            ${variant === 'animated' ? 'animate-pulse delay-75' : ''}
          `}></div>
          <div className={`
            w-0.5 h-2 bg-white rounded-t
            ${size === 'xs' ? 'w-0.5 h-1' : ''}
            ${size === 'sm' ? 'w-0.5 h-1.5' : ''}
            ${size === 'lg' ? 'w-1 h-3' : ''}
            ${size === 'xl' ? 'w-1.5 h-4' : ''}
            ${variant === 'animated' ? 'animate-pulse delay-150' : ''}
          `}></div>
        </div>
        
        {/* Company initials */}
        <div className={`
          font-bold leading-none
          ${size === 'xs' ? 'text-xs' : ''}
          ${size === 'sm' ? 'text-xs' : ''}
          ${size === 'md' ? 'text-sm' : ''}
          ${size === 'lg' ? 'text-lg' : ''}
          ${size === 'xl' ? 'text-xl' : ''}
        `}>
          {variant === 'minimal' ? 'J' : 'JB'}
        </div>
        
        {/* Cement Agency abbreviation for larger sizes */}
        {(size === 'lg' || size === 'xl') && variant !== 'minimal' && (
          <div className={`
            leading-none opacity-90 mt-0.5
            ${size === 'lg' ? 'text-xs' : 'text-sm'}
          `}>
            CA
          </div>
        )}
      </div>
      
      {/* Animated particles for animated variant */}
      {variant === 'animated' && (
        <>
          <div className="absolute top-0 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-white rounded-full opacity-60 animate-pulse delay-150"></div>
          <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-white rounded-full opacity-60 animate-pulse delay-300"></div>
        </>
      )}
    </div>
  );

  if (!showText) {
    return <LogoIcon />;
  }

  return (
    <div className="flex items-center space-x-3">
      <LogoIcon />
      <div className="flex flex-col">
        <h1 className={`font-bold text-gray-900 dark:text-slate-100 leading-none ${textSizes[size]}`}>
          Jai Bhavani Cement Agency
        </h1>
        <p className={`text-gray-600 dark:text-slate-400 leading-none mt-0.5 ${
          size === 'xs' ? 'text-xs' : 
          size === 'sm' ? 'text-xs' : 
          size === 'md' ? 'text-sm' : 
          size === 'lg' ? 'text-base' : 'text-lg'
        }`}>
          Building Strong Foundations
        </p>
      </div>
    </div>
  );
};

export default Logo;
