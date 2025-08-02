import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

const ResponsiveGrid = ({ 
  children, 
  className = '',
  mobile = 1,
  tablet = 2,
  desktop = 3,
  large = 4,
  tv = 5,
  ultrawide = 6,
  gap = 'responsive',
  ...props 
}) => {
  const { getGridCols, isTV, isMobile } = useResponsive();

  // Get responsive grid columns
  const gridCols = getGridCols({ mobile, tablet, desktop, large, tv, ultrawide });
  
  // Get responsive gap
  const getGapClass = () => {
    if (gap === 'responsive') {
      if (isTV) return 'gap-8 lg:gap-12';
      if (isMobile) return 'gap-3 sm:gap-4';
      return 'gap-4 sm:gap-6 lg:gap-8';
    }
    return gap;
  };

  const gridClasses = [
    'grid',
    getGapClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={gridClasses}
      style={{ 
        gridTemplateColumns: `repeat(${gridCols}, 1fr)` 
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
