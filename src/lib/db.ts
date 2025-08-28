/**
 * Simple local storage database for EcoAlert
 * This provides a client-side data persistence layer
 */

interface UserProfileData {
  id: string;
  data: any;
  timestamp: number;
}

interface UserActivity {
  userId: string;
  activity: any;
  timestamp: number;
}

// Simple in-memory cache
const memoryCache = new Map<string, UserProfileData>();
const activityCache: UserActivity[] = [];

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILES: 'ecoalert_user_profiles',
  USER_ACTIVITIES: 'ecoalert_user_activities',
};

// Initialize from localStorage
function initializeFromStorage() {
  if (typeof window === 'undefined') return; // Only run on client-side
  try {
    const profilesData = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
    if (profilesData) {
      const profiles = JSON.parse(profilesData);
      Object.entries(profiles).forEach(([id, data]) => {
        memoryCache.set(id, data as UserProfileData);
      });
    }

    const activitiesData = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITIES);
    if (activitiesData) {
      activityCache.push(...JSON.parse(activitiesData));
    }
  } catch (error) {
    console.error('Error initializing from localStorage:', error);
  }
}

// Save to localStorage
function saveToStorage() {
  if (typeof window === 'undefined') return; // Only run on client-side
  try {
    const profilesData: Record<string, UserProfileData> = {};
    memoryCache.forEach((data, id) => {
      profilesData[id] = data;
    });
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profilesData));
    localStorage.setItem(STORAGE_KEYS.USER_ACTIVITIES, JSON.stringify(activityCache));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// User profile operations
export const db = {
  // Save user profile
  saveUserProfile: async (userId: string, profile: any): Promise<void> => {
    try {
      const data: UserProfileData = {
        id: userId,
        data: profile,
        timestamp: Date.now(),
      };

      memoryCache.set(userId, data);
      saveToStorage();
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (userId: string): Promise<any | null> => {
    try {
      // Check memory cache first
      const cached = memoryCache.get(userId);
      if (cached) {
        return cached.data;
      }

      // If not in cache, return null (in a real app, this would fetch from a server)
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Update user activity
  updateUserActivity: async (userId: string, activity: any): Promise<void> => {
    try {
      const userActivity: UserActivity = {
        userId,
        activity,
        timestamp: Date.now(),
      };

      activityCache.push(userActivity);
      
      // Keep only last 1000 activities
      if (activityCache.length > 1000) {
        activityCache.splice(0, activityCache.length - 1000);
      }

      saveToStorage();
    } catch (error) {
      console.error('Error updating user activity:', error);
      throw error;
    }
  },

  // Get user activities
  getUserActivities: async (userId: string): Promise<any[]> => {
    try {
      return activityCache
        .filter(activity => activity.userId === userId)
        .map(activity => activity.activity)
        .reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  },

  // Clear all data (for testing/reset)
  clearAllData: async (): Promise<void> => {
    if (typeof window === 'undefined') return; // Only run on client-side
    try {
      memoryCache.clear();
      activityCache.length = 0;
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILES);
      localStorage.removeItem(STORAGE_KEYS.USER_ACTIVITIES);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },

  // Get storage statistics
  getStorageStats: async (): Promise<{ profiles: number; activities: number; size: string }> => {
    if (typeof window === 'undefined') return { profiles: 0, activities: 0, size: '0 Bytes' }; // Only run on client-side
    try {
      const profilesSize = new Blob([JSON.stringify(Object.fromEntries(memoryCache))]).size;
      const activitiesSize = new Blob([JSON.stringify(activityCache)]).size;
      const totalSize = profilesSize + activitiesSize;

      return {
        profiles: memoryCache.size,
        activities: activityCache.length,
        size: formatBytes(totalSize),
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  },
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize on module load
initializeFromStorage();
