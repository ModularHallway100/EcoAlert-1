import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserProfile, UserProfileUpdate, DEFAULT_USER_PROFILE } from '@/lib/user-profile';
import { db } from '@/lib/db';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserActivity: (activity: any) => Promise<void>;
}

export function useUserProfile(userId: string = 'anonymous'): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isSignedIn } = useUser();

  // Use Clerk user ID if available
  const effectiveUserId = isSignedIn ? user!.id : userId;

  // Load user profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/profile?userId=${effectiveUserId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Failed to load profile');
        // Create default profile if error
        const defaultProfile: UserProfile = {
          id: effectiveUserId,
          ...DEFAULT_USER_PROFILE,
          basicInfo: {
            ...DEFAULT_USER_PROFILE.basicInfo,
            name: isSignedIn ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || '' : '',
            location: { latitude: 40.7128, longitude: -74.0060 } // Default to NYC
          }
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Network error while loading profile');
      
      // Fallback to default profile
      const defaultProfile: UserProfile = {
        id: effectiveUserId,
        ...DEFAULT_USER_PROFILE,
        basicInfo: {
          ...DEFAULT_USER_PROFILE.basicInfo,
          name: isSignedIn ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || '' : '',
          location: { latitude: 40.7128, longitude: -74.0060 }
        }
      };
      setProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, isSignedIn, user]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  // Update profile
  const updateProfile = useCallback(async (updates: UserProfileUpdate) => {
    try {
      setError(null);
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        // Update local database cache
        await db.saveUserProfile(userId, data.data);
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update profile');
      throw err;
    }
  }, [userId]);

  // Save complete profile
  const saveProfile = useCallback(async (profileData: UserProfile) => {
    try {
      setError(null);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        // Update local database cache
        await db.saveUserProfile(userId, data.data);
      } else {
        throw new Error(data.error || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving user profile:', err);
      setError('Failed to save profile');
      throw err;
    }
  }, [userId]);

  // Update user activity
  const updateUserActivity = useCallback(async (activity: any) => {
    try {
      await db.updateUserActivity(userId, activity);
      
      // Optionally update profile with new activity data
      if (profile) {
        const updatedProfile = {
          ...profile,
          usagePatterns: {
            ...profile.usagePatterns,
            lastActive: new Date(),
            engagementLevel: calculateEngagementLevel(activity)
          }
        };
        
        setProfile(updatedProfile);
        await db.saveUserProfile(userId, updatedProfile);
      }
    } catch (err) {
      console.error('Error updating user activity:', err);
    }
  }, [userId, profile]);

  // Calculate engagement level based on activity
  const calculateEngagementLevel = (activity: any): 'low' | 'medium' | 'high' => {
    // Simple logic to determine engagement level
    if (activity.type === 'feature_usage' || activity.type === 'alert_interaction') {
      return 'high';
    } else if (activity.type === 'dashboard_view') {
      return 'medium';
    }
    return 'low';
  };

  // Load profile on mount and when userId changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    saveProfile,
    refreshProfile,
    updateUserActivity
  };
}

// Hook for guest users (anonymous)
export function useGuestUserProfile(): UseUserProfileReturn {
  return useUserProfile('anonymous');
}

// Hook for specific user ID
export function useSpecificUserProfile(targetUserId: string): UseUserProfileReturn {
  return useUserProfile(targetUserId);
}

// Hook for profile preferences only
export function useUserPreferences(userId: string = 'anonymous') {
  const { profile, loading, error, updateProfile } = useUserProfile(userId);
  
  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['preferences']>) => {
    if (!profile) return;
    
    await updateProfile({
      preferences: {
        ...profile.preferences,
        ...preferences
      }
    });
  }, [profile, updateProfile]);
  
  return {
    preferences: profile?.preferences || DEFAULT_USER_PROFILE.preferences,
    loading,
    error,
    updatePreferences
  };
}

// Hook for health profile only
export function useHealthProfile(userId: string = 'anonymous') {
  const { profile, loading, error, updateProfile } = useUserProfile(userId);
  
  const updateHealthProfile = useCallback(async (healthProfile: Partial<UserProfile['healthProfile']>) => {
    if (!profile) return;
    
    await updateProfile({
      healthProfile: {
        ...profile.healthProfile,
        ...healthProfile
      }
    });
  }, [profile, updateProfile]);
  
  return {
    healthProfile: profile?.healthProfile || DEFAULT_USER_PROFILE.healthProfile,
    loading,
    error,
    updateHealthProfile
  };
}

// Hook for environmental concerns only
export function useEnvironmentalConcerns(userId: string = 'anonymous') {
  const { profile, loading, error, updateProfile } = useUserProfile(userId);
  
  const updateEnvironmentalConcerns = useCallback(async (concerns: Partial<UserProfile['environmentalConcerns']>) => {
    if (!profile) return;
    
    await updateProfile({
      environmentalConcerns: {
        ...profile.environmentalConcerns,
        ...concerns
      }
    });
  }, [profile, updateProfile]);
  
  return {
    environmentalConcerns: profile?.environmentalConcerns || DEFAULT_USER_PROFILE.environmentalConcerns,
    loading,
    error,
    updateEnvironmentalConcerns
  };
}