import React from 'react';
import Loading from './Loading';

const FullPageLoader = ({ 
  variant = 'building', 
  text = 'Loading...', 
  subtitle = 'Please wait while we prepare everything for you',
  showLogo = true 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Crect width='4' height='4' rx='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <Loading 
          size="xl" 
          variant={variant} 
          text={text} 
          showLogo={showLogo}
          className="mb-6"
        />
        
        {subtitle && (
          <p className="text-gray-600 dark:text-slate-400 text-sm max-w-md mx-auto px-4">
            {subtitle}
          </p>
        )}
        
        {/* Construction elements decoration */}
        <div className="mt-8 flex justify-center space-x-4 opacity-20">
          {/* Hard hat */}
          <div className="w-8 h-6 bg-yellow-400 rounded-t-full border-b-2 border-yellow-600 animate-pulse"></div>
          
          {/* Wrench */}
          <div className="w-1 h-8 bg-gray-600 rounded animate-bounce delay-150"></div>
          
          {/* Hammer */}
          <div className="relative animate-bounce delay-300">
            <div className="w-1 h-6 bg-amber-700 rounded"></div>
            <div className="absolute -top-1 -left-1 w-3 h-2 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPageLoader;
