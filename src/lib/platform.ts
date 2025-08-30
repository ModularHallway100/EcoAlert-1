export type Platform = 'web' | 'ios' | 'android' | 'unknown';

// Detect the current platform
export const getPlatform = (): Platform => {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Windows Phone must be checked first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return 'unknown';
  }

  if (/android/i.test(userAgent)) {
    return 'android';
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'ios';
  }

  return 'web';
};

// Check if the current platform is mobile
export const isMobile = (): boolean => {
  const platform = getPlatform();
  return platform === 'ios' || platform === 'android';
};

// Check if the current platform is desktop
export const isDesktop = (): boolean => {
  return !isMobile();
};

// Get device-specific styles
export const getPlatformStyles = () => {
  const platform = getPlatform();
  
  return {
    platform,
    isMobile: isMobile(),
    isDesktop: isDesktop(),
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
};

// Platform-specific breakpoints for responsive design
export const breakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1400px',
  mobile: '768px', // Max width for mobile devices
  tablet: '1024px', // Max width for tablets
  desktop: '1200px' // Min width for desktop
};

// Platform-specific safe area insets
export const safeAreaInsets = {
  ios: { top: 44, bottom: 34 }, // Typical iPhone safe area
  android: { top: 24, bottom: 42 }, // Typical Android safe area
  web: { top: 0, bottom: 0 } // Web doesn't have safe areas
};

// Platform-specific animations
export const platformAnimations = {
  ios: {
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  android: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  },
  web: {
    duration: 200,
    easing: 'ease-in-out'
  }
};

// Platform-specific fonts
export const platformFonts = {
  ios: ['San Francisco', 'Helvetica Neue', 'Arial', 'sans-serif'],
  android: ['Roboto', 'Arial', 'sans-serif'],
  web: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
};

// Platform-specific gestures
export const platformGestures = {
  ios: {
    tapDistance: 20,
    longPressDuration: 500
  },
  android: {
    tapDistance: 16,
    longPressDuration: 500
  },
  web: {
    tapDistance: 5,
    longPressDuration: 500
  }
};

// Platform-specific UI patterns
export const uiPatterns = {
  navigation: {
    ios: 'bottom-tabs',
    android: 'bottom-tabs',
    web: 'top-tabs'
  },
  actionSheet: {
    ios: 'action-sheet',
    android: 'bottom-sheet',
    web: 'modal'
  },
  sharing: {
    ios: 'ui-activity-view',
    android: 'intent',
    web: 'web-share'
  }
};