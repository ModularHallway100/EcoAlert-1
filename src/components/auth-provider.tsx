"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  register: (userData: { email: string; password: string; name: string }) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper function to set cookie
function setCookie(name: string, value: string, days: number = 1) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;secure;samesite=strict`;
}

// Helper function to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { profile, loading } = useUserProfile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = getCookie('auth-token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Validate token with server
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Invalid session');
        }

        const userData = await response.json();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Session validation error:', error);
        setIsAuthenticated(false);
        deleteCookie('auth-token');
      }
    };

    validateSession();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setError(null);
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Login failed');
      }

      const { token, user } = await response.json();
      
      // Store token in secure cookie
      setCookie('auth-token', token, 1);
      
      // Update authentication state
      setIsAuthenticated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; name: string }) => {
    try {
      setError(null);
      
      // Validate input
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('All fields are required');
      }

      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Registration failed');
      }

      const { token, user } = await response.json();
      
      // Store token in secure cookie
      setCookie('auth-token', token, 1);
      
      // Update authentication state
      setIsAuthenticated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear token
    deleteCookie('auth-token');
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user: profile,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}