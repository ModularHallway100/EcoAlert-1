/**
 * Responsive design utilities for EcoAlert
 */

import React, { useState, useEffect } from 'react';

// Breakpoint definitions (matches Tailwind config)
export const breakpoints = {
  xs: 475,   // Extra small phones
  sm: 640,   // Small phones
  md: 768,   // Tablets
  lg: 1024,  // Small laptops
  xl: 1280,  // Desktops
  '2xl': 1536, // Large desktops
  '3xl': 1600, // Extra large desktops
  '4xl': 1920, // Ultra wide desktops
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Responsive value classes
export const responsive = {
  // Container classes
  container: {
    sm: 'sm:max-w-sm',
    md: 'md:max-w-md',
    lg: 'lg:max-w-lg',
    xl: 'xl:max-w-xl',
    '2xl': '2xl:max-w-2xl',
    '3xl': '3xl:max-w-3xl',
    '4xl': '4xl:max-w-4xl',
    '5xl': '5xl:max-w-5xl',
    '6xl': '6xl:max-w-6xl',
    '7xl': '7xl:max-w-7xl',
    '8xl': '8xl:max-w-8xl',
    '9xl': '9xl:max-w-9xl',
  },

  // Grid classes
  grid: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    },
    gap: {
      2: 'gap-2 sm:gap-4',
      3: 'gap-3 sm:gap-6',
      4: 'gap-4 sm:gap-6 lg:gap-8',
      6: 'gap-6 sm:gap-8 lg:gap-12',
    },
  },

  // Flex classes
  flex: {
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
      'sm-row': 'flex-col sm:flex-row',
      'sm-row-reverse': 'flex-col sm:flex-row-reverse',
      'sm-col': 'flex-row sm:flex-col',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
      'sm-between': 'justify-start sm:justify-between',
      'lg-center': 'justify-start lg:justify-center',
    },
    items: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
      'sm-center': 'items-start sm:items-center',
      'lg-center': 'items-start lg:items-center',
    },
  },

  // Spacing classes
  spacing: {
    padding: {
      xs: 'px-2 py-1',
      sm: 'px-3 py-2 sm:px-4 sm:py-3',
      md: 'px-4 py-3 sm:px-6 sm:py-4',
      lg: 'px-6 py-4 sm:px-8 sm:py-6',
      xl: 'px-8 py-6 sm:px-12 sm:py-8',
    },
    margin: {
      xs: 'mx-2 my-1',
      sm: 'mx-3 my-2 sm:mx-4 sm:my-3',
      md: 'mx-4 my-3 sm:mx-6 sm:my-4',
      lg: 'mx-6 my-4 sm:mx-8 sm:my-6',
      xl: 'mx-8 my-6 sm:px-12 sm:my-8',
    },
  },

  // Text size classes
  text: {
    size: {
      xs: 'text-xs sm:text-sm',
      sm: 'text-sm sm:text-base',
      base: 'text-base sm:text-lg',
      lg: 'text-lg sm:text-xl',
      xl: 'text-xl sm:text-2xl',
      '2xl': 'text-2xl sm:text-3xl',
      '3xl': 'text-3xl sm:text-4xl',
      '4xl': 'text-4xl sm:text-5xl',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      'sm-normal': 'font-light sm:font-normal',
      'lg-bold': 'font-normal sm:font-bold',
    },
  },

  // Width classes
  width: {
    auto: 'w-auto',
    full: 'w-full',
    sm: 'w-full sm:w-auto',
    md: 'w-full sm:w-1/2 md:w-2/3',
    lg: 'w-full sm:w-2/3 lg:w-3/4',
    xl: 'w-full sm:w-3/4 lg:w-4/5',
    '1/2': 'w-full sm:w-1/2',
    '1/3': 'w-full sm:w-1/3 lg:w-2/5',
    '2/3': 'w-full sm:w-2/3 lg:w-3/5',
    '1/4': 'w-full sm:w-1/4 lg:w-1/5',
    '3/4': 'w-full sm:w-3/4 lg:w-4/5',
    '1/5': 'w-full sm:w-1/5',
    '2/5': 'w-full sm:w-2/5',
    '3/5': 'w-full sm:w-3/5',
    '4/5': 'w-full sm:w-4/5',
  },

  // Height classes
  height: {
    auto: 'h-auto',
    full: 'h-full',
    screen: 'h-screen',
    sm: 'h-full sm:h-auto',
    md: 'h-64 sm:h-96 md:h-128',
    lg: 'h-96 sm:h-128 lg:h-144',
  },

  // Display classes
  display: {
    none: 'hidden',
    block: 'block',
    inline: 'inline',
    flex: 'flex',
    grid: 'grid',
    'sm-none': 'hidden sm:block',
    'sm-block': 'block sm:hidden',
    'md-none': 'hidden md:block',
    'lg-none': 'hidden lg:block',
    'xl-none': 'hidden xl:block',
  },
};

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      let currentBreakpoint: Breakpoint = 'xs';
      
      for (const [key, value] of Object.entries(breakpoints)) {
        if (width >= value) {
          currentBreakpoint = key as Breakpoint;
        }
      }
      
      setBreakpoint(currentBreakpoint);
    };
    
    // Set initial breakpoint
    updateBreakpoint();
    
    // Add event listener
    window.addEventListener('resize', updateBreakpoint);
    
    // Clean up
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
}

/**
 * Hook to check if current breakpoint matches a specific condition
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    
    return () => media.removeListener(listener);
  }, [query]);
  
  return matches;
}

/**
 * Hook for common responsive queries
 */
export function useResponsive() {
  const isXs = useMediaQuery('(max-width: 474px)');
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const is2xl = useMediaQuery('(min-width: 1536px)');
  const is3xl = useMediaQuery('(min-width: 1600px)');
  const is4xl = useMediaQuery('(min-width: 1920px)');
  
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    is3xl,
    is4xl,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Get responsive class based on current breakpoint
 */
export function getResponsiveClass(
  baseClass: string,
  responsiveClasses: Record<Breakpoint, string>
): string {
  const breakpoint = useBreakpoint();
  return `${baseClass} ${responsiveClasses[breakpoint]}`;
}

/**
 * Check if current breakpoint is mobile
 */
export function isMobileBreakpoint(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Check if current breakpoint is tablet
 */
export function isTabletBreakpoint(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Check if current breakpoint is desktop
 */
export function isDesktopBreakpoint(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Get container class based on current breakpoint
 */
export function getContainerClass(size: keyof typeof responsive.container = 'lg'): string {
  return responsive.container[size];
}

/**
 * Get grid classes based on current breakpoint
 */
export function getGridClasses(
  cols: keyof typeof responsive.grid.cols = 3,
  gap: keyof typeof responsive.grid.gap = 4
): string {
  return `${responsive.grid.cols[cols]} ${responsive.grid.gap[gap]}`;
}

/**
 * Get flex classes based on current breakpoint
 */
export function getFlexClasses(
  direction: keyof typeof responsive.flex.direction = 'col',
  justify: keyof typeof responsive.flex.justify = 'between',
  items: keyof typeof responsive.flex.items = 'start',
  wrap: keyof typeof responsive.flex.wrap = 'nowrap'
): string {
  return `
    ${responsive.flex.direction[direction]}
    ${responsive.flex.justify[justify]}
    ${responsive.flex.items[items]}
    ${responsive.flex.wrap[wrap]}
  `.trim();
}

export default responsive;