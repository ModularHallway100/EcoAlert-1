"use client";

import { useState, useEffect } from 'react';
import { getPlatform, type Platform } from '@/lib/platform';
import { cn } from '@/lib/utils';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  value?: string | number;
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (value: string | number) => void;
}

interface PlatformFormProps {
  fields: FormField[];
  onSubmit?: (values: Record<string, string | number>) => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  showLabels?: boolean;
  layout?: 'stacked' | 'horizontal' | 'grid';
}

interface PlatformInputProps {
  field: FormField;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  showLabel?: boolean;
}

interface PlatformButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
  onClick?: () => void;
}

export function PlatformForm({ 
  fields, 
  onSubmit, 
  className,
  platform = 'auto',
  showLabels = true,
  layout = 'stacked'
}: PlatformFormProps) {
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const handleChange = (id: string, value: string | number) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  const layoutClasses = {
    stacked: 'space-y-4',
    horizontal: 'space-y-4 md:space-y-0 md:space-x-6 md:items-center',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4'
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(layoutClasses[layout], className)}
    >
      {fields.map((field) => (
        <PlatformInput
          key={field.id}
          field={field}
          platform={platform}
          showLabel={showLabels}
        />
      ))}
    </form>
  );
}

export function PlatformInput({ 
  field, 
  className,
  platform = 'auto',
  showLabel = true
}: PlatformInputProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    if (field.onChange) {
      field.onChange(value === '' ? '' : field.type === 'number' ? Number(value) : value);
    }
  };

  const getInputClasses = () => {
    const baseClasses = field.error 
      ? 'border-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:border-blue-500';
      
    const disabledClasses = field.disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    const platformClasses = currentPlatform === 'ios' || currentPlatform === 'android' 
      ? 'py-3 px-4 rounded-lg' 
      : 'py-2 px-3 rounded';
    
    return cn(
      'w-full',
      'border',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
      baseClasses,
      disabledClasses,
      platformClasses,
      className
    );
  };

  const renderInput = () => {
    const commonProps = {
      id: field.id,
      value: field.value || '',
      placeholder: field.placeholder,
      disabled: field.disabled,
      className: getInputClasses(),
      onChange: handleChange
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        );
        
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              checked={!!field.value}
              disabled={field.disabled}
              onChange={(e) => field.onChange?.(e.target.checked ? 1 : 0)}
              className={cn(
                'h-4 w-4 text-blue-600 rounded focus:ring-blue-500',
                currentPlatform === 'ios' || currentPlatform === 'android' ? 'scale-110' : ''
              )}
            />
            {showLabel && (
              <label htmlFor={field.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {field.label}
              </label>
            )}
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  value={option.value}
                  checked={field.value === option.value}
                  disabled={field.disabled}
                  onChange={handleChange}
                  className={cn(
                    'h-4 w-4 text-blue-600 focus:ring-blue-500',
                    currentPlatform === 'ios' || currentPlatform === 'android' ? 'scale-110' : ''
                  )}
                />
                <label htmlFor={`${field.id}-${option.value}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <input
            type={field.type}
            {...commonProps}
          />
        );
        
      default:
        return (
          <input
            type={field.type}
            {...commonProps}
          />
        );
    }
  };

  const isMobile = currentPlatform === 'ios' || currentPlatform === 'android';

  return (
    <div className="space-y-1">
      {showLabel && field.type !== 'checkbox' && field.type !== 'radio' && (
        <label 
          htmlFor={field.id}
          className={cn(
            'block text-sm font-medium text-gray-700 dark:text-gray-300',
            isMobile ? 'mb-2' : 'mb-1'
          )}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {field.helperText && !field.error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {field.helperText}
        </p>
      )}
      
      {field.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {field.error}
        </p>
      )}
    </div>
  );
}

export function PlatformButton({ 
  children, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  platform = 'auto',
  onClick
}: PlatformButtonProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700',
    link: 'text-blue-600 hover:text-blue-800 hover:underline focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
  };

  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    xl: 'text-lg px-8 py-4'
  };

  const platformClasses = currentPlatform === 'ios' || currentPlatform === 'android'
    ? 'rounded-lg font-medium active:scale-95 transition-all duration-150'
    : 'rounded-md font-medium shadow-sm transition-colors duration-200';

  const disabledClasses = disabled || loading 
    ? 'opacity-50 cursor-not-allowed' 
    : '';

  const fullClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        platformClasses,
        disabledClasses,
        fullClasses,
        className
      )}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}

// Specialized platform form components
export function PlatformSearchBar({ 
  placeholder = "Search...",
  onSearch,
  className,
  platform = 'auto'
}: {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) {
  const [query, setQuery] = useState('');
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const isMobile = currentPlatform === 'ios' || currentPlatform === 'android';

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full',
          'pl-10 pr-4',
          'py-2',
          'border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
          isMobile ? 'py-3' : ''
        )}
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <svg 
          className="w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
      >
        <svg 
          className="w-5 h-5 text-blue-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </button>
    </form>
  );
}

export function PlatformDatePicker({
  label,
  value,
  onChange,
  className,
  platform = 'auto'
}: {
  label: string;
  value?: string;
  onChange?: (date: string) => void;
  className?: string;
  platform?: 'web' | 'ios' | 'android' | 'auto';
}) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('web');

  useEffect(() => {
    setCurrentPlatform(platform === 'auto' ? getPlatform() : platform);
  }, [platform]);

  const isIOS = currentPlatform === 'ios';
  const isMobile = currentPlatform === 'ios' || currentPlatform === 'android';

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={isIOS ? "date" : "datetime-local"}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'w-full',
          'border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
          isMobile ? 'py-3' : '',
          className
        )}
      />
    </div>
  );
}

// Form validation hook
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Partial<Record<keyof T, string>>
) => {
  const [formValues, setFormValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (key: keyof T, value: any) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    
    // Clear error when field is changed
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const setValues = (newValues: Partial<T>) => {
    setFormValues(prev => ({ ...prev, ...newValues }));
    
    // Clear errors when fields are changed
    const newErrors = { ...errors };
    Object.keys(newValues).forEach(key => {
      if (newErrors[key as keyof T]) {
        delete newErrors[key as keyof T];
      }
    });
    setErrors(newErrors);
  };

  const validateForm = () => {
    if (!validate) return true;
    
    const validationErrors = validate(formValues);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (onSubmit: (values: T) => Promise<void> | void) => {
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        await onSubmit(formValues);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  return {
    values: formValues,
    errors,
    isSubmitting,
    setValue,
    setValues,
    validateForm,
    handleSubmit,
  };
};