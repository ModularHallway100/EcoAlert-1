"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { getPlatform, type Platform } from '@/lib/platform';
import { cn } from '@/lib/utils';

interface AccessibilityOptions {
  reduceMotion: boolean;
  reduceTransparency: boolean;
  smartInvert: boolean;
  differentiateWithoutColor: boolean;
  voiceOver: boolean;
  switchControl: boolean;
  boldText: boolean;
  largerText: boolean;
  monoAudio: boolean;
  screenReader: boolean;
}

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extraLarge' | 'huge';
  contrast: 'normal' | 'high';
  colorBlindMode: boolean;
  animations: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

interface FocusTrapProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

interface AnnounceProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

interface PlatformAccessibilityProps {
  children: React.ReactNode;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}

export function PlatformAccessibility({ 
  children, 
  className,
  platform = 'auto'
}: PlatformAccessibilityProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');
  const [systemOptions, setSystemOptions] = useState<AccessibilityOptions>({
    reduceMotion: false,
    reduceTransparency: false,
    smartInvert: false,
    differentiateWithoutColor: false,
    voiceOver: false,
    switchControl: false,
    boldText: false,
    largerText: false,
    monoAudio: false,
    screenReader: false,
  });
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    contrast: 'normal',
    colorBlindMode: false,
    animations: true,
    soundEffects: true,
    hapticFeedback: true,
  });

  useEffect(() => {
    const detectedPlatform = platform === 'auto' ? getPlatform() : platform;
    setCurrentPlatform(detectedPlatform);
    
    // In a real app, you would detect system accessibility settings
    // For now, we'll use default values
    const defaultOptions: AccessibilityOptions = {
      reduceMotion: false,
      reduceTransparency: false,
      smartInvert: false,
      differentiateWithoutColor: false,
      voiceOver: false,
      switchControl: false,
      boldText: false,
      largerText: false,
      monoAudio: false,
      screenReader: false,
    };
    
    setSystemOptions(defaultOptions);
  }, [platform]);

  // Apply accessibility settings to the document
  useEffect(() => {
    // Apply reduced motion
    if (systemOptions.reduceMotion || !settings.animations) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Apply high contrast
    if (settings.contrast === 'high') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply font size classes
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl');
    
    switch (settings.fontSize) {
      case 'small':
        document.documentElement.classList.add('text-sm');
        break;
      case 'medium':
        document.documentElement.classList.add('text-base');
        break;
      case 'large':
        document.documentElement.classList.add('text-lg');
        break;
      case 'extraLarge':
        document.documentElement.classList.add('text-xl');
        break;
      case 'huge':
        document.documentElement.classList.add('text-2xl');
        break;
    }
    
    // Apply color blind mode
    if (settings.colorBlindMode) {
      document.documentElement.classList.add('colorblind-mode');
    } else {
      document.documentElement.classList.remove('colorblind-mode');
    }
  }, [systemOptions, settings]);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSystemOption = useCallback((key: keyof AccessibilityOptions, value: boolean) => {
    setSystemOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div 
      className={cn('relative', className)}
      data-platform={currentPlatform}
      data-accessibility-mode={
        systemOptions.voiceOver || systemOptions.screenReader ? 'screen-reader' : 'normal'
      }
    >
      {children}
    </div>
  );
}

export function FocusTrap({ children, className, active = true }: FocusTrapProps) {
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusTrapElement = focusTrapRef.current;
    
    if (!focusTrapElement) return;
    
    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    // Get all focusable elements within the trap
    const focusableElementsList = focusTrapElement.querySelectorAll(focusableElements);
    const firstElement = focusableElementsList[0] as HTMLElement;
    const lastElement = focusableElementsList[focusableElementsList.length - 1] as HTMLElement;
    
    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }
    
    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    // Handle escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Restore focus to the previous element
        previousActiveElement.current?.focus();
        // Remove event listeners
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
      // Restore focus
      previousActiveElement.current = null;
    };
  }, [active]);

  return (
    <div ref={focusTrapRef} className={cn('outline-none', className)}>
      {children}
    </div>
  );
}

export function Announce({ message, priority = 'polite', delay = 0 }: AnnounceProps) {
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncement(message);
      
      // Clear after a delay to ensure screen readers announce it
      setTimeout(() => {
        setAnnouncement('');
      }, 1000);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [message, delay]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

export function PlatformAccessibilityButton({ 
  children, 
  onClick,
  ariaLabel,
  className,
  platform = 'auto'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyPress={handleKeyPress}
      aria-label={ariaLabel}
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      type="button"
      aria-pressed={false}
    >
      {children}
    </button>
  );
}

export function SkipToContent({ 
  href = '#main-content',
  className,
  platform = 'auto'
}: {
  href?: string;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  return (
    <a
      href={href}
      className={cn(
        'absolute',
        '-top-40 left-4',
        'bg-blue-600 text-white',
        'px-4 py-2',
        'rounded',
        'focus:top-4 focus:outline-none focus:ring-2 focus:ring-blue-500',
        'transition-all duration-200',
        'z-50',
        className
      )}
    >
      Skip to main content
    </a>
  );
}

export function HighContrastToggle({ 
  enabled,
  onToggle,
  className,
  platform = 'auto'
}: {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  return (
    <PlatformAccessibilityButton
      onClick={onToggle}
      ariaLabel={enabled ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      className={cn(
        'flex items-center space-x-2',
        'px-3 py-2',
        'rounded-lg',
        'bg-gray-100 dark:bg-gray-800',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        'transition-colors',
        className
      )}
      platform={platform}
    >
      <div 
        className={cn(
          'w-12 h-6',
          'rounded-full',
          'relative',
          'transition-colors duration-200',
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        )}
      >
        <div 
          className={cn(
            'absolute',
            'top-0.5',
            'w-5 h-5',
            'rounded-full',
            'bg-white',
            'transition-transform duration-200',
            enabled ? 'transform translate-x-6' : 'translate-x-0.5'
          )}
        />
      </div>
      <span className="text-sm font-medium">
        {enabled ? 'High Contrast' : 'Normal Contrast'}
      </span>
    </PlatformAccessibilityButton>
  );
}

export function FontSizeControls({ 
  currentSize,
  onChange,
  className,
  platform = 'auto'
}: {
  currentSize: AccessibilitySettings['fontSize'];
  onChange: (size: AccessibilitySettings['fontSize']) => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const fontSizes: Array<{
    size: AccessibilitySettings['fontSize'];
    label: string;
    className: string;
  }> = [
    { size: 'small', label: 'A', className: 'text-sm' },
    { size: 'medium', label: 'A', className: 'text-base' },
    { size: 'large', label: 'A', className: 'text-lg' },
    { size: 'extraLarge', label: 'A', className: 'text-xl' },
    { size: 'huge', label: 'A', className: 'text-2xl' },
  ];

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm text-gray-600 dark:text-gray-400">Text Size:</span>
      {fontSizes.map(({ size, label, className: textClass }) => (
        <PlatformAccessibilityButton
          key={size}
          onClick={() => onChange(size)}
          ariaLabel={`Set text size to ${size}`}
          className={cn(
            'w-8 h-8',
            'flex items-center justify-center',
            'rounded-full',
            'border',
            currentSize === size
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'transition-colors',
            className
          )}
          platform={platform}
        >
          <span className={textClass}>{label}</span>
        </PlatformAccessibilityButton>
      ))}
    </div>
  );
}

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    contrast: 'normal',
    colorBlindMode: false,
    animations: true,
    soundEffects: true,
    hapticFeedback: true,
  });

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const announceError = useCallback((message: string) => {
    announceToScreenReader(message, 'assertive');
  }, [announceToScreenReader]);

  const announceSuccess = useCallback((message: string) => {
    announceToScreenReader(message, 'polite');
  }, [announceToScreenReader]);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    settings,
    updateSetting,
    announceToScreenReader,
    announceError,
    announceSuccess,
  };
};

// High order component for accessibility
export function withAccessibility<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    ariaLabel?: string;
    role?: string;
    tabIndex?: number;
  }
) {
  return function WrappedComponent(props: T) {
    return (
      <Component
        {...props}
        aria-label={options?.ariaLabel}
        role={options?.role}
        tabIndex={options?.tabIndex}
      />
    );
  };
}