import { useState, useEffect } from 'react';

// Breakpoint values in pixels (matching Tailwind defaults + custom)
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560,
  '5xl': 3840,
};

// Custom hook for responsive design
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions for breakpoint checks
  const isMobile = windowSize.width < breakpoints.sm;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg && windowSize.width < breakpoints['3xl'];
  const isLargeDesktop = windowSize.width >= breakpoints['3xl'] && windowSize.width < breakpoints['4xl'];
  const isTV = windowSize.width >= breakpoints['4xl'];

  // Specific breakpoint checks
  const isSmUp = windowSize.width >= breakpoints.sm;
  const isMdUp = windowSize.width >= breakpoints.md;
  const isLgUp = windowSize.width >= breakpoints.lg;
  const isXlUp = windowSize.width >= breakpoints.xl;
  const is2XlUp = windowSize.width >= breakpoints['2xl'];
  const is3XlUp = windowSize.width >= breakpoints['3xl'];
  const is4XlUp = windowSize.width >= breakpoints['4xl'];

  // Get current breakpoint name
  const getCurrentBreakpoint = () => {
    if (windowSize.width >= breakpoints['5xl']) return '5xl';
    if (windowSize.width >= breakpoints['4xl']) return '4xl';
    if (windowSize.width >= breakpoints['3xl']) return '3xl';
    if (windowSize.width >= breakpoints['2xl']) return '2xl';
    if (windowSize.width >= breakpoints.xl) return 'xl';
    if (windowSize.width >= breakpoints.lg) return 'lg';
    if (windowSize.width >= breakpoints.md) return 'md';
    if (windowSize.width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  // Get grid columns based on screen size
  const getGridCols = (options = {}) => {
    const {
      mobile = 1,
      tablet = 2,
      desktop = 3,
      large = 4,
      tv = 6,
      ultrawide = 8,
    } = options;

    if (windowSize.width >= breakpoints['5xl']) return ultrawide;
    if (windowSize.width >= breakpoints['4xl']) return tv;
    if (windowSize.width >= breakpoints['3xl']) return large;
    if (windowSize.width >= breakpoints.lg) return desktop;
    if (windowSize.width >= breakpoints.md) return tablet;
    return mobile;
  };

  // Get responsive padding/margin values
  const getSpacing = (type = 'padding') => {
    const baseClass = type === 'padding' ? 'p' : 'm';
    
    if (windowSize.width >= breakpoints['4xl']) return `${baseClass}-12`;
    if (windowSize.width >= breakpoints['3xl']) return `${baseClass}-10`;
    if (windowSize.width >= breakpoints.xl) return `${baseClass}-8`;
    if (windowSize.width >= breakpoints.lg) return `${baseClass}-6`;
    if (windowSize.width >= breakpoints.md) return `${baseClass}-4`;
    return `${baseClass}-3`;
  };

  // Get responsive text size
  const getTextSize = (baseSize = 'text-base') => {
    const sizeMap = {
      'text-xs': ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'],
      'text-sm': ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
      'text-base': ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
      'text-lg': ['text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
      'text-xl': ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
      'text-2xl': ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'],
      'text-3xl': ['text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'],
      'text-4xl': ['text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl'],
    };

    const sizes = sizeMap[baseSize] || sizeMap['text-base'];
    
    if (windowSize.width >= breakpoints['4xl']) return sizes[4];
    if (windowSize.width >= breakpoints['3xl']) return sizes[3];
    if (windowSize.width >= breakpoints.xl) return sizes[2];
    if (windowSize.width >= breakpoints.lg) return sizes[1];
    return sizes[0];
  };

  // Check if device is touch-capable
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // Check device orientation
  const isLandscape = windowSize.width > windowSize.height;
  const isPortrait = windowSize.height > windowSize.width;

  // Get container max width based on screen size
  const getContainerMaxWidth = () => {
    if (windowSize.width >= breakpoints['5xl']) return 'max-w-11xl';
    if (windowSize.width >= breakpoints['4xl']) return 'max-w-10xl';
    if (windowSize.width >= breakpoints['3xl']) return 'max-w-9xl';
    if (windowSize.width >= breakpoints['2xl']) return 'max-w-8xl';
    if (windowSize.width >= breakpoints.xl) return 'max-w-7xl';
    if (windowSize.width >= breakpoints.lg) return 'max-w-6xl';
    return 'max-w-5xl';
  };

  return {
    windowSize,
    // Device type checks
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isTV,
    // Breakpoint checks
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    is2XlUp,
    is3XlUp,
    is4XlUp,
    // Utility functions
    getCurrentBreakpoint,
    getGridCols,
    getSpacing,
    getTextSize,
    getContainerMaxWidth,
    // Device capabilities
    isTouchDevice,
    isLandscape,
    isPortrait,
    // Raw breakpoint values for custom logic
    breakpoints,
  };
};

// Hook for media queries
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }
    
    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
};

// Predefined media query hooks
export const useIsMobile = () => useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
export const useIsTablet = () => useMediaQuery(`(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.lg - 1}px)`);
export const useIsDesktop = () => useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
export const useIsLargeScreen = () => useMediaQuery(`(min-width: ${breakpoints['3xl']}px)`);
export const useIsTouchDevice = () => useMediaQuery('(hover: none) and (pointer: coarse)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

export default useResponsive;
