/**
 * Performance optimization utilities for EcoAlert
 */

import React from 'react';

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

// Throttle function to limit how often a function can be called
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoize function to cache results based on arguments
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(null, args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Lazy load a component with error handling
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    importFn()
      .catch((error) => {
        console.error('Failed to load component:', error);
        // Return a simple fallback component
        return new Promise<{ default: T }>((resolve) => {
          resolve({
            default: (() => {
              const div = document.createElement('div');
              div.className = 'p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800';
              div.textContent = 'Failed to load component. Please refresh the page.';
              return () => div;
            }) as unknown as T
          });
        });
      })
  );
}

// Measure component render time for debugging
export function measureRenderTime<T extends (...args: any[]) => React.ReactNode>(
  componentName: string,
  fn: T
): T {
  return ((...args: Parameters<T>): React.ReactNode => {
    const start = performance.now();
    const result = fn.apply(null, args);
    const end = performance.now();
    
    if (end - start > 100) { // Log if render takes more than 100ms
      console.warn(`${componentName} render took ${end - start}ms`);
    }
    
    return result;
  }) as T;
}

// Optimize image loading with proper attributes
export function optimizeImageSrc(src: string, width?: number, height?: number): string {
  if (!src) return '';
  
  // Add width and height parameters if provided
  if (width && height) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}w=${width}&h=${height}&fit=cover`;
  }
  
  return src;
}

// Preload critical resources
export function preloadResource(url: string, as: 'style' | 'script' | 'font' = 'style'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

// Optimize bundle by dynamically importing non-critical modules
export function loadNonCriticalModule<T>(importFn: () => Promise<T>): Promise<T> {
  // Use requestIdleCallback to load during browser idle time
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return new Promise((resolve) => {
      window.requestIdleCallback(() => {
        importFn().then(resolve);
      });
    });
  }
  
  // Fallback for browsers without requestIdleCallback
  return importFn();
}

// Performance monitoring utility
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  mark(metric: string): void {
    const now = performance.now();
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    this.metrics.get(metric)!.push(now);
  }
  
  measure(metric: string, startMark: string, endMark: string): number | null {
    const startMarks = this.metrics.get(startMark) || [];
    const endMarks = this.metrics.get(endMark) || [];
    
    if (startMarks.length === 0 || endMarks.length === 0) {
      return null;
    }
    
    // Take the last occurrence of each mark
    const start = startMarks[startMarks.length - 1];
    const end = endMarks[endMarks.length - 1];
    
    return end - start;
  }
  
  getAverage(metric: string): number | null {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) {
      return null;
    }
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
  
  reset(): void {
    this.metrics.clear();
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();