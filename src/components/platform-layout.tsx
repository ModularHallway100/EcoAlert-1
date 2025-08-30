"use client";

import { useState, useEffect } from 'react';
import { getPlatform, type Platform } from '@/lib/platform';
import { cn } from '@/lib/utils';
import { PlatformStatusBar } from './responsive-container';

interface PlatformLayoutProps {
  children: React.ReactNode;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  safeArea?: boolean;
  statusBar?: boolean;
  navigation?: {
    type: 'bottom' | 'top' | 'drawer' | 'none';
    items: Array<{
      id: string;
      label: string;
      icon?: React.ReactNode;
      href: string;
      badge?: string | number;
    }>;
    activeItemId?: string;
    onItemClick?: (item: any) => void;
  };
  header?: {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    back?: boolean;
    onBack?: () => void;
  };
  footer?: {
    content?: React.ReactNode;
    fixed?: boolean;
  };
}

interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}

interface SheetProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  side?: 'left' | 'right' | 'top' | 'bottom';
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
}

interface AppBarProps {
  children: React.ReactNode;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  position?: 'static' | 'sticky' | 'fixed' | 'relative';
  color?: 'primary' | 'secondary' | 'default' | 'transparent';
}

export function PlatformLayout({ 
  children, 
  className,
  platform = 'auto',
  safeArea = true,
  statusBar = true,
  navigation,
  header,
  footer
}: PlatformLayoutProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectedPlatform = platform === 'auto' ? getPlatform() : platform;
    setCurrentPlatform(detectedPlatform);
    setIsMobile(detectedPlatform === 'ios' || detectedPlatform === 'android');
  }, [platform]);

  const safeAreaClasses = safeArea ? 
    (currentPlatform === 'ios' ? 'pt-11 pb-8' : 
     currentPlatform === 'android' ? 'pt-6 pb-10' : '') : '';

  const statusBarComponent = statusBar ? <PlatformStatusBar /> : null;

  const bottomNavHeight = currentPlatform === 'ios' ? 'h-16' : 'h-20';
  const bottomNavPadding = navigation?.type === 'bottom' && isMobile 
    ? `pb-${currentPlatform === 'ios' ? '16' : '20'}` 
    : '';

  return (
    <div className={cn('min-h-screen', 'flex flex-col', className)}>
      {statusBarComponent}
      
      {header && (
        <header className={cn(
          'w-full',
          'flex items-center justify-between',
          'p-4',
          'bg-white dark:bg-gray-800',
          'border-b border-gray-200 dark:border-gray-700',
          currentPlatform === 'ios' ? 'sticky top-0 z-40' : 'relative'
        )}>
          {header.back && (
            <button
              onClick={header.onBack}
              className="p-2 -ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div className="flex-1">
            {header.title && (
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {header.title}
              </h1>
            )}
            {header.subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {header.subtitle}
              </p>
            )}
          </div>
          
          {header.actions && (
            <div className="flex items-center space-x-2">
              {header.actions}
            </div>
          )}
        </header>
      )}
      
      <main className={cn(
        'flex-1',
        'w-full',
        safeAreaClasses,
        bottomNavPadding
      )}>
        {children}
      </main>
      
      {navigation && navigation.type === 'bottom' && isMobile && (
        <nav className={cn(
          'w-full',
          bottomNavHeight,
          'flex items-center justify-around',
          'border-t',
          'bg-white dark:bg-gray-800',
          'fixed bottom-0 left-0 right-0',
          'z-40'
        )}>
          {navigation.items.map((item) => {
            const isActive = item.id === navigation.activeItemId;
            return (
              <button
                key={item.id}
                onClick={() => navigation.onItemClick?.(item)}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'flex-1',
                  'relative',
                  'transition-all duration-200',
                  'active:scale-95',
                  isActive ? 
                    (currentPlatform === 'ios' ? 'text-blue-500' : 'text-green-500') :
                    (currentPlatform === 'ios' ? 'text-gray-500' : 'text-gray-400')
                )}
              >
                {item.icon && (
                  <div className={cn(
                    'mb-1',
                    isActive ? 'scale-110' : 'scale-100'
                  )}>
                    {item.icon}
                  </div>
                )}
                
                <span className={cn(
                  'text-xs font-medium',
                  'leading-none',
                  isActive ? 'font-semibold' : 'font-normal'
                )}>
                  {item.label}
                </span>
                
                {item.badge && (
                  <span className={cn(
                    'absolute',
                    'top-1 right-2',
                    'bg-red-500 text-white text-xs',
                    'rounded-full px-1 py-0.5',
                    'min-w-4 text-center'
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}
      
      {footer && (
        <footer className={cn(
          'w-full',
          'p-4',
          'bg-white dark:bg-gray-800',
          'border-t border-gray-200 dark:border-gray-700',
          footer.fixed ? 'sticky bottom-0 z-30' : 'relative'
        )}>
          {footer.content}
        </footer>
      )}
    </div>
  );
}

export function PlatformModal({ 
  children, 
  open, 
  onClose, 
  className,
  platform = 'auto'
}: ModalProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  if (!open) return null;

  const modalClasses = currentPlatform === 'ios' || currentPlatform === 'android'
    ? 'fixed inset-0 z-50 flex items-center justify-center p-4'
    : 'fixed inset-0 z-50 flex items-center justify-center';

  const modalContentClasses = currentPlatform === 'ios' || currentPlatform === 'android'
    ? 'bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden'
    : 'bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden';

  return (
    <div className={modalClasses}>
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className={cn(modalContentClasses, className)}>
        {children}
      </div>
    </div>
  );
}

export function PlatformSheet({ 
  children, 
  open, 
  onClose, 
  className,
  platform = 'auto',
  side = 'bottom'
}: SheetProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  if (!open) return null;

  const sheetClasses = {
    left: 'left-0 top-0 h-full w-80',
    right: 'right-0 top-0 h-full w-80',
    top: 'top-0 left-0 right-0 h-96',
    bottom: 'bottom-0 left-0 right-0 h-96'
  };

  const positionClasses = {
    left: 'transform -translate-x-full',
    right: 'translate-x-full',
    top: '-translate-y-full',
    bottom: 'translate-y-full'
  };

  const activePositionClasses = {
    left: 'translate-x-0',
    right: '-translate-x-0',
    top: 'translate-y-0',
    bottom: '-translate-y-0'
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50',
      'bg-black bg-opacity-50',
      open && 'animate-fade-in'
    )}>
      <div className={cn(
        'absolute bg-white dark:bg-gray-800',
        sheetClasses[side],
        positionClasses[side],
        open && activePositionClasses[side],
        'transition-transform duration-300 ease-in-out',
        'shadow-lg',
        'rounded-t-3xl' + (side === 'bottom' ? '' : ' rounded-b-none'),
        'rounded-b-3xl' + (side === 'top' ? '' : ' rounded-t-none'),
        className
      )}>
        {children}
      </div>
    </div>
  );
}

export function PlatformCard({ 
  children, 
  className,
  platform = 'auto',
  elevation = 'md',
  variant = 'default'
}: CardProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const elevationClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    filled: 'bg-gray-50 dark:bg-gray-900'
  };

  const platformClasses = currentPlatform === 'ios' || currentPlatform === 'android'
    ? 'rounded-2xl overflow-hidden'
    : 'rounded-lg overflow-hidden';

  return (
    <div className={cn(
      'w-full',
      elevationClasses[elevation],
      variantClasses[variant],
      platformClasses,
      className
    )}>
      {children}
    </div>
  );
}

export function PlatformAppBar({ 
  children, 
  className,
  platform = 'auto',
  position = 'sticky',
  color = 'default'
}: AppBarProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const colorClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    default: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
    transparent: 'bg-transparent text-gray-900 dark:text-white'
  };

  const positionClasses = {
    static: 'relative',
    sticky: 'sticky top-0 z-30',
    fixed: 'fixed top-0 left-0 right-0 z-30',
    relative: 'relative'
  };

  const platformClasses = currentPlatform === 'ios' || currentPlatform === 'android'
    ? 'px-4 py-3'
    : 'px-4 py-2';

  return (
    <header className={cn(
      'w-full',
      'flex items-center justify-between',
      positionClasses[position],
      colorClasses[color],
      platformClasses,
      'border-b',
      color === 'transparent' ? 'border-transparent' : 'border-gray-200 dark:border-gray-700',
      className
    )}>
      {children}
    </header>
  );
}

// Responsive layout utilities
export const usePlatformLayout = () => {
  const [platform, setPlatform] = useState<Platform>('web');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectedPlatform = getPlatform();
    setPlatform(detectedPlatform);
    setIsMobile(detectedPlatform === 'ios' || detectedPlatform === 'android');
  }, []);

  return {
    platform,
    isMobile,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
  };
};

// Platform-specific content containers
export const PlatformContent = ({ 
  children, 
  className,
  platform = 'auto'
}: { 
  children: React.ReactNode; 
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) => {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const paddingClasses = currentPlatform === 'ios' || currentPlatform === 'android'
    ? 'p-4'
    : 'p-6';

  return (
    <div className={cn(paddingClasses, className)}>
      {children}
    </div>
  );
};

export const PlatformScrollArea = ({ 
  children, 
  className,
  platform = 'auto'
}: { 
  children: React.ReactNode; 
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) => {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const scrollClasses = currentPlatform === 'ios' || currentPlatform === 'android'
    ? 'overflow-y-auto -webkit-overflow-scrolling-touch'
    : 'overflow-y-auto';

  return (
    <div className={cn(scrollClasses, className)}>
      {children}
    </div>
  );
};