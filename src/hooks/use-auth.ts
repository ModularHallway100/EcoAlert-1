import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";

interface AuthUser {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId?: string;
  orgId?: string | null;
  orgRole?: string | null;
}

interface ConvexUser {
  _id: string;
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  trialEnd?: number;
  createdAt: number;
  updatedAt: number;
}

export function useAuthWithConvex(): AuthUser {
  const { isLoaded, isSignedIn, userId, getToken, orgId, orgRole } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      let isCancelled = false;
      
      const syncUserWithBackend = async () => {
        try {
          // Retry logic for transient failures
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries && !isCancelled) {
            try {
              // Sync user data with our backend (server will fetch Clerk data)
              const syncResponse = await fetch('/api/auth/sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({
                  clerkId: userId,
                }),
              });
              
              if (!syncResponse.ok) {
                throw new Error(`Failed to sync user data: ${syncResponse.status}`);
              }
              
              const result = await syncResponse.json();
              console.log('User data synced successfully:', result);
              break; // Success, exit retry loop
              
            } catch (error) {
              retryCount++;
              if (retryCount >= maxRetries) {
                console.error("Error syncing user with backend after retries:", error);
                break;
              }
              
              // Exponential backoff
              await new Promise(resolve =>
                setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1))
              );
            }
          }
        } catch (error) {
          if (!isCancelled) {
            console.error("Error syncing user with backend:", error);
          }
        }
      };

      syncUserWithBackend();
      
      // Cleanup function to cancel in-flight sync
      return () => {
        isCancelled = true;
      };
    }
  }, [isLoaded, isSignedIn, userId, getToken]);

  if (!isLoaded) {
    return {
      isLoading: true,
      isAuthenticated: false,
    };
  }

  return {
    isLoading: false,
    isAuthenticated: isSignedIn,
    userId: userId || undefined,
    orgId,
    orgRole,
  };
}

// Placeholder for Convex user integration
// This will be updated once we have the Convex API properly generated
export function useConvexUser(): ConvexUser | null {
  const { userId } = useAuthWithConvex();
  
  // This would normally call a Convex query
  // For now, return null until Convex is properly configured
  return null;
}

// Placeholder for subscription management
export function useSubscription() {
  const convexUser = useConvexUser();
  
  if (!convexUser) return null;

  const now = Date.now();
  const isPro = convexUser.subscriptionTier === "pro";
  const isTrial = convexUser.trialEnd ? now < convexUser.trialEnd : false;
  const daysRemaining = convexUser.trialEnd
    ? Math.ceil((convexUser.trialEnd - now) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    subscriptionTier: convexUser.subscriptionTier,
    subscriptionStatus: convexUser.subscriptionStatus,
    isPro,
    isTrial,
    daysRemaining: Math.max(0, daysRemaining),
  };
}