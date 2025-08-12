import React from 'react';
import logoImage from '../../assets/logo.png';

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
      bg-gradient-to-br from-orange-50 via-white to-yellow-50 
      dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 
      rounded-xl flex items-center justify-center shadow-lg 
      dark:shadow-slate-900/50 relative overflow-hidden border-2 border-orange-500/20
      ${variant === 'animated' ? 'hover:scale-105 transition-all duration-500 hover:shadow-orange-500/30 hover:border-orange-500/40' : ''}
      ${className}
    `}>
      {/* Your actual logo image */}
      <img 
        src={logoImage} 
        alt="Jai Bhavani Cement Agency" 
        className={`
          ${variant === 'minimal' ? 'w-full h-full' : 'w-4/5 h-4/5'}
          object-contain relative z-10
          ${variant === 'animated' ? 'transition-transform duration-300' : ''}
        `}
        style={{ 
          filter: variant === 'animated' ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' : 'none' 
        }}
      />
      
      {/* Construction-themed decorative elements around the logo */}
      {variant !== 'minimal' && (
        <>
          {/* Corner construction elements */}
          <div className="absolute top-1 left-1 w-1 h-1 bg-orange-400 rounded-full opacity-60"></div>
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-yellow-500 rounded-full opacity-60"></div>
          <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-orange-300 rounded-full opacity-50"></div>
          <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-yellow-400 rounded-full opacity-50"></div>
          
          {/* Construction frame effect */}
          <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-br from-orange-200/20 via-transparent to-yellow-200/20 rounded-xl pointer-events-none"></div>
        </>
      )}
      
      {/* Animated construction particles for animated variant */}
      {variant === 'animated' && (
        <>
          {/* Dust particles */}
          <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-orange-300 rounded-full opacity-70 animate-ping"></div>
          <div className="absolute bottom-3 right-2 w-0.5 h-0.5 bg-yellow-400 rounded-full opacity-70 animate-ping delay-150"></div>
          <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-orange-400 rounded-full opacity-70 animate-ping delay-300"></div>
          
          {/* Construction activity indicators */}
          <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-500 rounded-full opacity-60 animate-pulse delay-500"></div>
          
          {/* Subtle glow on hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400/10 via-transparent to-yellow-400/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </>
      )}
      
      {/* Professional border glow effect */}
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
