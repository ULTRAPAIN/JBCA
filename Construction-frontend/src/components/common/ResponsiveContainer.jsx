import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

const ResponsiveContainer = ({ 
  children, 
  className = '',
  maxWidth = 'auto',
  padding = 'responsive',
  ...props 
}) => {
  const { getContainerMaxWidth, getSpacing } = useResponsive();

  // Get responsive max width
  const responsiveMaxWidth = maxWidth === 'auto' ? getContainerMaxWidth() : maxWidth;
  
  // Get responsive padding
  const responsivePadding = padding === 'responsive' ? getSpacing('padding') : padding;

  const containerClasses = [
    'mx-auto',
    responsiveMaxWidth,
    responsivePadding,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
