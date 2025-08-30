"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { getPlatform, type Platform } from '@/lib/platform';
import { cn } from '@/lib/utils';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  divider: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface ThemeConfig {
  colors: ThemeColors;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

interface PlatformThemeContextType {
  platform: Platform;
  theme: 'light' | 'dark';
  config: ThemeConfig;
  toggleTheme: () => void;
  isMobile: boolean;
  setPlatform: (platform: Platform) => void;
}

const defaultThemeConfig: ThemeConfig = {
  colors: {
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryDark: '#059669',
    secondary: '#3b82f6',
    secondaryLight: '#60a5fa',
    secondaryDark: '#2563eb',
    background: '#ffffff',
    backgroundAlt: '#f9fafb',
    surface: '#ffffff',
    surfaceAlt: '#f3f4f6',
    text: '#111827',
    textSecondary: '#6b7280',
    textDisabled: '#9ca3af',
    border: '#e5e7eb',
    divider: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontFamily: {
    sans: 'system-ui, -apple-system, sans-serif',
    serif: 'ui-serif, Georgia, serif',
    mono: 'ui-monospace, SF Mono, Monaco, monospace',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

const darkThemeColors: Partial<ThemeColors> = {
  primary: '#34d399',
  primaryLight: '#6ee7b7',
  primaryDark: '#10b981',
  secondary: '#60a5fa',
  secondaryLight: '#93c5fd',
  secondaryDark: '#3b82f6',
  background: '#111827',
  backgroundAlt: '#1f2937',
  surface: '#1f2937',
  surfaceAlt: '#374151',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textDisabled: '#9ca3af',
  border: '#374151',
  divider: '#374151',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const iosThemeConfig: Partial<ThemeConfig> = {
  colors: {
    primary: '#007aff',
    primaryLight: '#5ac8fa',
    primaryDark: '#0051d5',
    secondary: '#ff3b30',
    secondaryLight: '#ff6b6b',
    secondaryDark: '#d70015',
    background: '#f2f2f7',
    backgroundAlt: '#ffffff',
    surface: '#ffffff',
    surfaceAlt: '#f2f2f7',
    text: '#000000',
    textSecondary: '#8e8e93',
    textDisabled: '#c7c7cc',
    border: '#c6c6c8',
    divider: '#c6c6c8',
    success: '#34c759',
    warning: '#ff9500',
    error: '#ff3b30',
    info: '#5ac8fa',
  },
  borderRadius: {
    ...defaultThemeConfig.borderRadius,
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  shadows: {
    ...defaultThemeConfig.shadows,
    md: '0 2px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.15)',
  },
};

const androidThemeConfig: Partial<ThemeConfig> = {
  colors: {
    primary: '#3ddc84',
    primaryLight: '#69f0ae',
    primaryDark: '#00c853',
    secondary: '#ff6e40',
    secondaryLight: '#ffab91',
    secondaryDark: '#e64a19',
    background: '#121212',
    backgroundAlt: '#000000',
    surface: '#121212',
    surfaceAlt: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    textDisabled: '#757575',
    border: '#424242',
    divider: '#424242',
    success: '#69f0ae',
    warning: '#ffea00',
    error: '#ff5252',
    info: '#40c4ff',
  },
  borderRadius: {
    ...defaultThemeConfig.borderRadius,
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    ...defaultThemeConfig.shadows,
    md: '0 4px 8px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.3)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.3)',
  },
};

const PlatformThemeContext = createContext<PlatformThemeContextType | undefined>(undefined);

export function PlatformThemeProvider({ 
  children, 
  defaultPlatform = 'auto',
  defaultTheme = 'light'
}: {
  children: React.ReactNode;
  defaultPlatform?: 'web' | 'ios' | 'android' | 'auto';
  defaultTheme?: 'light' | 'dark';
}) {
  const [platform, setPlatform] = useState<Platform>('web');
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme);
  const [config, setConfig] = useState<ThemeConfig>(defaultThemeConfig);

  useEffect(() => {
    const detectedPlatform = defaultPlatform === 'auto' ? getPlatform() : defaultPlatform;
    setPlatform(detectedPlatform);
  }, [defaultPlatform]);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Generate platform-specific theme config
    let baseConfig = { ...defaultThemeConfig };
    
    // Apply platform-specific overrides
    if (platform === 'ios') {
      baseConfig = { ...baseConfig, ...iosThemeConfig };
    } else if (platform === 'android') {
      baseConfig = { ...baseConfig, ...androidThemeConfig };
    }
    
    // Apply dark mode overrides
    if (theme === 'dark') {
      baseConfig.colors = { ...baseConfig.colors, ...darkThemeColors };
    }
    
    setConfig(baseConfig);
  }, [platform, theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: PlatformThemeContextType = {
    platform,
    theme,
    config,
    toggleTheme,
    isMobile: platform === 'ios' || platform === 'android',
    setPlatform,
  };

  return (
    <PlatformThemeContext.Provider value={value}>
      {children}
    </PlatformThemeContext.Provider>
  );
}

export function usePlatformTheme() {
  const context = useContext(PlatformThemeContext);
  if (context === undefined) {
    throw new Error('usePlatformTheme must be used within a PlatformThemeProvider');
  }
  return context;
}

// Theme-aware components
export function Themed({ 
  children, 
  className,
  platform = 'auto'
}: {
  children: React.ReactNode;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) {
  const { platform: currentPlatform } = usePlatformTheme();
  const themePlatform = platform === 'auto' ? currentPlatform : platform;
  
  return (
    <div className={className} data-platform={themePlatform}>
      {children}
    </div>
  );
}

export function PlatformText({ 
  children, 
  className,
  variant = 'body',
  weight = 'normal',
  platform = 'auto'
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) {
  const { platform: currentPlatform } = usePlatformTheme();
  const themePlatform = platform === 'auto' ? currentPlatform : platform;
  
  const getFontSize = () => {
    switch (variant) {
      case 'display': return 'text-4xl';
      case 'heading': return 'text-3xl';
      case 'title': return 'text-2xl';
      case 'subtitle': return 'text-xl';
      case 'body': return 'text-base';
      case 'caption': return 'text-sm';
      default: return 'text-base';
    }
  };
  
  const getFontWeight = () => {
    switch (weight) {
      case 'light': return 'font-light';
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      default: return 'font-normal';
    }
  };
  
  const fontFamily = themePlatform === 'ios' || themePlatform === 'android' 
    ? 'font-sans' 
    : '';
  
  return (
    <span 
      className={cn(
        getFontSize(),
        getFontWeight(),
        fontFamily,
        className
      )}
      data-platform={themePlatform}
    >
      {children}
    </span>
  );
}

export function PlatformButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  className,
  platform = 'auto',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  [key: string]: any;
}) {
  const { platform: currentPlatform, config } = usePlatformTheme();
  const themePlatform = platform === 'auto' ? currentPlatform : platform;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `bg-${config.colors.primary} text-white hover:bg-${config.colors.primaryDark}`;
      case 'secondary':
        return `bg-${config.colors.secondary} text-white hover:bg-${config.colors.secondaryDark}`;
      case 'outline':
        return `border border-${config.colors.border} text-${config.colors.text} hover:bg-${config.colors.backgroundAlt}`;
      case 'ghost':
        return `text-${config.colors.text} hover:bg-${config.colors.backgroundAlt}`;
      case 'link':
        return `text-${config.colors.primary} hover:underline`;
      default:
        return `bg-${config.colors.primary} text-white hover:bg-${config.colors.primaryDark}`;
    }
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'xs': return 'px-2 py-1 text-xs';
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'md': return 'px-4 py-2 text-base';
      case 'lg': return 'px-6 py-3 text-lg';
      case 'xl': return 'px-8 py-4 text-xl';
      default: return 'px-4 py-2 text-base';
    }
  };
  
  const platformStyles = themePlatform === 'ios' || themePlatform === 'android'
    ? 'rounded-lg font-medium active:scale-95 transition-all duration-150'
    : 'rounded-md font-medium shadow-sm transition-colors duration-200';
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        getVariantStyles(),
        getSizeStyles(),
        platformStyles,
        className
      )}
      data-platform={themePlatform}
      {...props}
    >
      {children}
    </button>
  );
}

export function PlatformCard({ 
  children, 
  className,
  platform = 'auto',
  elevation = 'md',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  [key: string]: any;
}) {
  const { platform: currentPlatform, config } = usePlatformTheme();
  const themePlatform = platform === 'auto' ? currentPlatform : platform;
  
  const getElevation = () => {
    switch (elevation) {
      case 'none': return 'shadow-none';
      case 'sm': return config.shadows.sm;
      case 'md': return config.shadows.md;
      case 'lg': return config.shadows.lg;
      default: return config.shadows.md;
    }
  };
  
  const borderRadius = themePlatform === 'ios' || themePlatform === 'android'
    ? config.borderRadius.lg
    : config.borderRadius.md;
  
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800',
        'rounded-lg',
        getElevation(),
        className
      )}
      style={{ borderRadius }}
      data-platform={themePlatform}
      {...props}
    >
      {children}
    </div>
  );
}

// CSS custom properties for theme
export const useThemeStyles = () => {
  const { config } = usePlatformTheme();
  
  const generateCSSVariables = () => {
    const variables: Record<string, string> = {};
    
    // Colors
    Object.entries(config.colors).forEach(([key, value]) => {
      variables[`--color-${key}`] = value;
    });
    
    // Spacing
    Object.entries(config.spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value;
    });
    
    // Border radius
    Object.entries(config.borderRadius).forEach(([key, value]) => {
      variables[`--radius-${key}`] = value;
    });
    
    // Font size
    Object.entries(config.fontSize).forEach(([key, value]) => {
      variables[`--font-size-${key}`] = value;
    });
    
    // Shadows
    Object.entries(config.shadows).forEach(([key, value]) => {
      variables[`--shadow-${key}`] = value;
    });
    
    return variables;
  };
  
  return { generateCSSVariables };
};