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
      bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 
      dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 
      rounded-xl flex items-center justify-center shadow-xl 
      dark:shadow-slate-900/50 relative overflow-hidden border-2 border-orange-500/20
      ${variant === 'animated' ? 'hover:scale-105 transition-all duration-500 hover:shadow-orange-500/30' : ''}
      ${className}
    `}>
      {/* Background construction pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-2 w-1 h-1 bg-orange-400 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-1 h-1 bg-orange-400 rounded-full"></div>
        <div className="absolute top-3 right-3 w-0.5 h-0.5 bg-orange-300 rounded-full"></div>
      </div>
      
      {/* Modern construction site layout */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Main construction crane - Tower */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          {/* Crane mast (vertical tower) */}
          <div className={`
            bg-gradient-to-b from-orange-400 to-orange-600
            ${size === 'xs' ? 'w-1 h-4' : ''}
            ${size === 'sm' ? 'w-1 h-5' : ''}
            ${size === 'md' ? 'w-1.5 h-6' : ''}
            ${size === 'lg' ? 'w-2 h-8' : ''}
            ${size === 'xl' ? 'w-2.5 h-10' : ''}
            rounded-t-sm shadow-lg relative
            ${variant === 'animated' ? 'animate-pulse' : ''}
          `}>
            {/* Crane jib (horizontal arm) */}
            <div className={`
              absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-400
              ${size === 'xs' ? 'w-3 h-0.5 -translate-x-1' : ''}
              ${size === 'sm' ? 'w-4 h-0.5 -translate-x-1.5' : ''}
              ${size === 'md' ? 'w-5 h-1 -translate-x-2' : ''}
              ${size === 'lg' ? 'w-6 h-1 -translate-x-2.5' : ''}
              ${size === 'xl' ? 'w-8 h-1.5 -translate-x-3.5' : ''}
              rounded shadow-md
            `}>
              {/* Counter jib */}
              <div className={`
                absolute top-0 right-full bg-orange-600
                ${size === 'xs' ? 'w-1 h-0.5' : ''}
                ${size === 'sm' ? 'w-1.5 h-0.5' : ''}
                ${size === 'md' ? 'w-2 h-1' : ''}
                ${size === 'lg' ? 'w-2.5 h-1' : ''}
                ${size === 'xl' ? 'w-3 h-1.5' : ''}
                rounded
              `}></div>
            </div>
            
            {/* Trolley and hook */}
            <div className={`
              absolute top-1 right-0 bg-yellow-500
              ${size === 'xs' ? 'w-0.5 h-1.5' : ''}
              ${size === 'sm' ? 'w-0.5 h-2' : ''}
              ${size === 'md' ? 'w-1 h-2.5' : ''}
              ${size === 'lg' ? 'w-1 h-3' : ''}
              ${size === 'xl' ? 'w-1.5 h-4' : ''}
              rounded-b shadow-sm
              ${variant === 'animated' ? 'animate-bounce' : ''}
            `}>
              {/* Hook detail */}
              <div className={`
                absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-yellow-600
                ${size === 'xs' ? 'w-1 h-0.5' : ''}
                ${size === 'sm' ? 'w-1.5 h-0.5' : ''}
                ${size === 'md' ? 'w-2 h-1' : ''}
                ${size === 'lg' ? 'w-2.5 h-1' : ''}
                ${size === 'xl' ? 'w-3 h-1' : ''}
                rounded-full
              `}></div>
            </div>
          </div>
        </div>

        {/* Building structures */}
        <div className="absolute bottom-1/4 left-1/4 flex items-end space-x-0.5">
          {/* Building 1 - Completed */}
          <div className={`
            bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-sm shadow-lg
            ${size === 'xs' ? 'w-1 h-2' : ''}
            ${size === 'sm' ? 'w-1.5 h-2.5' : ''}
            ${size === 'md' ? 'w-2 h-3' : ''}
            ${size === 'lg' ? 'w-2.5 h-4' : ''}
            ${size === 'xl' ? 'w-3 h-5' : ''}
            ${variant === 'animated' ? 'animate-pulse delay-100' : ''}
          `}>
            {/* Windows */}
            <div className={`
              absolute top-1 left-1/2 transform -translate-x-1/2 bg-yellow-300
              ${size === 'xs' ? 'w-0.5 h-0.5' : ''}
              ${size === 'sm' ? 'w-0.5 h-1' : ''}
              ${size === 'md' ? 'w-1 h-1' : ''}
              ${size === 'lg' ? 'w-1 h-1.5' : ''}
              ${size === 'xl' ? 'w-1.5 h-2' : ''}
              rounded-sm
            `}></div>
          </div>
          
          {/* Building 2 - Under construction */}
          <div className={`
            bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-sm shadow-lg
            ${size === 'xs' ? 'w-1.5 h-1.5' : ''}
            ${size === 'sm' ? 'w-2 h-2' : ''}
            ${size === 'md' ? 'w-2.5 h-2.5' : ''}
            ${size === 'lg' ? 'w-3 h-3' : ''}
            ${size === 'xl' ? 'w-4 h-4' : ''}
            ${variant === 'animated' ? 'animate-pulse delay-200' : ''}
          `}>
            {/* Construction scaffolding */}
            <div className={`
              absolute inset-0 border border-orange-300 rounded-t-sm opacity-60
            `}></div>
          </div>
        </div>

        {/* Right side development */}
        <div className="absolute bottom-1/4 right-1/4">
          {/* Modern building */}
          <div className={`
            bg-gradient-to-t from-blue-600 to-blue-500 rounded-t shadow-lg
            ${size === 'xs' ? 'w-1.5 h-2.5' : ''}
            ${size === 'sm' ? 'w-2 h-3' : ''}
            ${size === 'md' ? 'w-2.5 h-4' : ''}
            ${size === 'lg' ? 'w-3 h-5' : ''}
            ${size === 'xl' ? 'w-4 h-6' : ''}
            ${variant === 'animated' ? 'animate-pulse delay-300' : ''}
          `}>
            {/* Glass windows pattern */}
            <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
              <div className="bg-cyan-300 rounded-sm opacity-80"></div>
              <div className="bg-cyan-200 rounded-sm opacity-60"></div>
            </div>
          </div>
        </div>

        {/* Foundation and ground work */}
        <div className={`
          absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600
          ${size === 'xs' ? 'h-0.5' : ''}
          ${size === 'sm' ? 'h-1' : ''}
          ${size === 'md' ? 'h-1' : ''}
          ${size === 'lg' ? 'h-1.5' : ''}
          ${size === 'xl' ? 'h-2' : ''}
          rounded-b shadow-inner
        `}>
          {/* Foundation details */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-orange-400 opacity-60"></div>
        </div>

        {/* Construction materials (cement bags representation) */}
        <div className="absolute bottom-1 left-1">
          <div className={`
            bg-gray-400 rounded-sm
            ${size === 'xs' ? 'w-1 h-0.5' : ''}
            ${size === 'sm' ? 'w-1.5 h-1' : ''}
            ${size === 'md' ? 'w-2 h-1' : ''}
            ${size === 'lg' ? 'w-2.5 h-1.5' : ''}
            ${size === 'xl' ? 'w-3 h-2' : ''}
            shadow-sm
          `}>
            <div className="absolute inset-0 bg-orange-500 opacity-30 rounded-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Animated construction particles and effects */}
      {variant === 'animated' && (
        <>
          {/* Dust particles */}
          <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-orange-300 rounded-full opacity-70 animate-ping"></div>
          <div className="absolute bottom-3 right-2 w-0.5 h-0.5 bg-yellow-400 rounded-full opacity-70 animate-ping delay-150"></div>
          <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-orange-400 rounded-full opacity-70 animate-ping delay-300"></div>
          
          {/* Construction activity indicators */}
          <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-500 rounded-full opacity-60 animate-pulse delay-500"></div>
        </>
      )}
      
      {/* Subtle border glow effect */}
      <div className="absolute inset-0 rounded-xl border border-orange-500/30 pointer-events-none"></div>
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
