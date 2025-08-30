"use client";

import { useState, useEffect } from 'react';
import { getPlatform, type Platform } from '@/lib/platform';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href: string;
  badge?: string | number;
}

interface PlatformNavProps {
  items: NavItem[];
  activeItemId?: string;
  onItemClick?: (item: NavItem) => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}

interface MobileNavProps {
  items: NavItem[];
  activeItemId?: string;
  onItemClick?: (item: NavItem) => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  showLabels?: boolean;
  position?: 'bottom' | 'top';
}

interface DesktopNavProps {
  items: NavItem[];
  activeItemId?: string;
  onItemClick?: (item: NavItem) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

interface Breadcrumb {
  label: string;
  href?: string;
}

export function PlatformNavigation({ 
  items, 
  activeItemId, 
  onItemClick, 
  className,
  platform = 'auto'
}: PlatformNavProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectedPlatform = platform === 'auto' ? getPlatform() : platform;
    setCurrentPlatform(detectedPlatform);
    setIsMobile(detectedPlatform === 'ios' || detectedPlatform === 'android');
  }, [platform]);

  if (isMobile) {
    return (
      <MobileNavigation 
        items={items}
        activeItemId={activeItemId}
        onItemClick={onItemClick}
        className={className}
        platform={platform}
      />
    );
  }

  return (
    <DesktopNavigation 
      items={items}
      activeItemId={activeItemId}
      onItemClick={onItemClick}
      className={className}
    />
  );
}

export function MobileNavigation({ 
  items, 
  activeItemId, 
  onItemClick, 
  className,
  platform = 'auto',
  showLabels = true,
  position = 'bottom'
}: MobileNavProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');
  
  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const handleClick = (item: NavItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const iOSBottomNavHeight = 'h-16';
  const AndroidBottomNavHeight = 'h-20';
  const navHeight = currentPlatform === 'ios' ? iOSBottomNavHeight : AndroidBottomNavHeight;

  return (
    <div className={cn(
      'fixed',
      'left-0 right-0',
      'flex items-center justify-around',
      'border-t',
      'bg-white dark:bg-gray-800',
      'z-50',
      position === 'bottom' ? 'bottom-0' : 'top-0',
      navHeight,
      className
    )}>
      {items.map((item) => {
        const isActive = item.id === activeItemId;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
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
            {Icon && (
              <div className={cn(
                'mb-1',
                isActive ? 'scale-110' : 'scale-100'
              )}>
                {Icon}
              </div>
            )}
            
            {showLabels && (
              <span className={cn(
                'text-xs font-medium',
                'leading-none',
                isActive ? 'font-semibold' : 'font-normal'
              )}>
                {item.label}
              </span>
            )}
            
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
    </div>
  );
}

export function DesktopNavigation({ 
  items, 
  activeItemId, 
  onItemClick, 
  className,
  orientation = 'horizontal'
}: DesktopNavProps) {
  const handleClick = (item: NavItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <nav className={cn(
      orientation === 'horizontal' ? 'flex space-x-6' : 'flex-col space-y-2',
      className
    )}>
      {items.map((item) => {
        const isActive = item.id === activeItemId;
        
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={cn(
              'flex items-center',
              'px-3 py-2',
              'rounded-lg',
              'transition-all duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              isActive ? 
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                'text-gray-700 dark:text-gray-300'
            )}
          >
            {item.icon && (
              <div className="mr-2">
                {item.icon}
              </div>
            )}
            
            <span className={cn(
              'font-medium',
              isActive ? 'font-semibold' : 'font-normal'
            )}>
              {item.label}
            </span>
            
            {item.badge && (
              <span className={cn(
                'ml-2',
                'bg-red-500 text-white text-xs',
                'rounded-full px-2 py-0.5',
                'min-w-5 text-center'
              )}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function BreadcrumbNavigation({ 
  items, 
  className 
}: { 
  items: Breadcrumb[]; 
  className?: string;
}) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      <span className="text-gray-500">/</span>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {item.href ? (
            <a 
              href={item.href}
              className={cn(
                'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
                index === items.length - 1 ? 'font-medium' : ''
              )}
            >
              {item.label}
            </a>
          ) : (
            <span className={cn(
              'text-gray-900 dark:text-gray-100',
              index === items.length - 1 ? 'font-medium' : 'text-gray-500'
            )}>
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="text-gray-500">/</span>
          )}
        </div>
      ))}
    </nav>
  );
}

export function CollapsibleNavigation({ 
  items, 
  activeItemId, 
  onItemClick, 
  className,
  platform = 'auto'
}: PlatformNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');
  
  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const handleClick = (item: NavItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    setIsExpanded(false);
  };

  if (currentPlatform === 'ios' || currentPlatform === 'android') {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full',
            'flex items-center justify-between',
            'p-4',
            'bg-gray-100 dark:bg-gray-800',
            'rounded-lg',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'transition-colors duration-200'
          )}
        >
          <span className="font-medium">Menu</span>
          <svg
            className={cn(
              'w-5 h-5',
              'transform transition-transform duration-200',
              isExpanded ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        {isExpanded && (
          <div className={cn(
            'absolute',
            'top-full left-0 right-0',
            'mt-2',
            'bg-white dark:bg-gray-800',
            'rounded-lg shadow-lg',
            'border border-gray-200 dark:border-gray-700',
            'z-40'
          )}>
            {items.map((item) => {
              const isActive = item.id === activeItemId;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className={cn(
                    'w-full',
                    'flex items-center',
                    'p-4',
                    'text-left',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'transition-colors duration-200',
                    isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : ''
                  )}
                >
                  {item.icon && (
                    <div className="mr-3">
                      {item.icon}
                    </div>
                  )}
                  
                  <span className="font-medium flex-1">{item.label}</span>
                  
                  {item.badge && (
                    <span className={cn(
                      'bg-red-500 text-white text-xs',
                      'rounded-full px-2 py-1',
                      'min-w-5 text-center'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <DesktopNavigation 
      items={items}
      activeItemId={activeItemId}
      onItemClick={onItemClick}
      className={className}
    />
  );
}

// Navigation hook
export const useNavigation = () => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const handleItemClick = (item: NavItem) => {
    setActiveItemId(item.id);
    // In a real app, you would also handle navigation
    console.log('Navigating to:', item.href);
  };
  
  return {
    activeItemId,
    setActiveItemId,
    handleItemClick,
  };
};

// Platform-specific navigation items
export const defaultNavigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'pollution',
    label: 'Pollution Map',
    href: '/pollution-map',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'alerts',
    label: 'Alerts',
    href: '/alerts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
      </svg>
    ),
    badge: 3,
  },
  {
    id: 'community',
    label: 'Community',
    href: '/community',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];