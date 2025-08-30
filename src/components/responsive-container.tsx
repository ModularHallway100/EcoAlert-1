"use client";

import { useState, useEffect } from 'react';
import { getPlatform, breakpoints, type Platform } from '@/lib/platform';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centerContent?: boolean;
  safeArea?: boolean;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  platform?: 'web' | 'ios' | 'android' | 'auto';
  responsive?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export function ResponsiveContainer({ 
  children, 
  className, 
  style, 
  maxWidth = 'xl',
  centerContent = true,
  safeArea = false,
  platform = 'auto'
}: ResponsiveContainerProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectedPlatform = platform === 'auto' ? getPlatform() : platform;
    setCurrentPlatform(detectedPlatform);
    setIsMobile(detectedPlatform === 'ios' || detectedPlatform === 'android');
  }, [platform]);

  const maxWidthClass = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full'
  }[maxWidth];

  const safeAreaClass = safeArea ? 
    (currentPlatform === 'ios' ? 'pt-11 pb-8' : 
     currentPlatform === 'android' ? 'pt-6 pb-10' : '') : '';

  return (
    <div 
      className={cn(
        'w-full',
        maxWidthClass,
        centerContent && 'mx-auto',
        safeAreaClass,
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function ResponsiveLayout({ 
  children, 
  className, 
  direction = 'col',
  gap = 'md',
  alignItems = 'start',
  justifyContent = 'start',
  wrap = false
}: ResponsiveLayoutProps) {
  const gapClass = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }[gap];

  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';

  const alignItemsClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }[alignItems];

  const justifyContentClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }[justifyContent];

  return (
    <div 
      className={cn(
        'flex',
        directionClass,
        gapClass,
        alignItemsClass,
        justifyContentClass,
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1 },
  gap = 'md'
}: ResponsiveGridProps) {
  const generateGridClasses = () => {
    const classes = ['grid'];
    
    // Add gap classes
    const gapClass = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    }[gap];
    
    classes.push(gapClass);
    
    // Add column classes
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.xs) classes.push(`xs:grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn(generateGridClasses(), className)}>
      {children}
    </div>
  );
}

export function ResponsiveText({ 
  children, 
  className, 
  size = 'base',
  weight = 'normal',
  align = 'left',
  platform = 'auto',
  responsive
}: ResponsiveTextProps) {
  const [currentPlatform, setCurrentPlatform] = useState('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }[size];

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  }[weight];

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }[align];

  // Platform-specific adjustments
  const platformClasses = currentPlatform === 'ios' ? 
    'font-sans' : 
    currentPlatform === 'android' ? 
    'font-sans' : 
    '';

  // Responsive text sizes
  const responsiveClasses = responsive ? 
    cn(
      responsive.sm && `sm:text-${responsive.sm.replace('text-', '')}`,
      responsive.md && `md:text-${responsive.md.replace('text-', '')}`,
      responsive.lg && `lg:text-${responsive.lg.replace('text-', '')}`,
      responsive.xl && `xl:text-${responsive.xl.replace('text-', '')}`
    ) : '';

  return (
    <span 
      className={cn(
        sizeClasses,
        weightClasses,
        alignClasses,
        platformClasses,
        responsiveClasses,
        className
      )}
    >
      {children}
    </span>
  );
}

// Hook for responsive design
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < parseInt(breakpoints.mobile as string);
  const isTablet = windowSize.width >= parseInt(breakpoints.mobile as string) && windowSize.width < parseInt(breakpoints.tablet as string);
  const isDesktop = windowSize.width >= parseInt(breakpoints.tablet as string);

  const getBreakpoint = () => {
    if (windowSize.width < parseInt(breakpoints.sm as string)) return 'xs';
    if (windowSize.width < parseInt(breakpoints.md as string)) return 'sm';
    if (windowSize.width < parseInt(breakpoints.lg as string)) return 'md';
    if (windowSize.width < parseInt(breakpoints.xl as string)) return 'lg';
    if (windowSize.width < parseInt(breakpoints['2xl'] as string)) return 'xl';
    return '2xl';
  };

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: getBreakpoint(),
    width: windowSize.width,
    height: windowSize.height,
  };
};

// Platform-specific components
export const PlatformSafeArea = ({ children }: { children: React.ReactNode }) => {
  const platform = getPlatform();
  
  if (platform === 'ios') {
    return (
      <div className="pt-11 pb-8">
        {children}
      </div>
    );
  }
  
  if (platform === 'android') {
    return (
      <div className="pt-6 pb-10">
        {children}
      </div>
    );
  }
  
  return <>{children}</>;
};

export const PlatformStatusBar = ({ backgroundColor }: { backgroundColor?: string }) => {
  const platform = getPlatform();
  
  if (platform === 'ios') {
    return (
      <div 
        className="h-11 w-full"
        style={{ backgroundColor: backgroundColor || '#10b981' }}
      />
    );
  }
  
  if (platform === 'android') {
    return (
      <div 
        className="h-24 w-full"
        style={{ backgroundColor: backgroundColor || '#10b981' }}
      />
    );
  }
  
  return null;
};