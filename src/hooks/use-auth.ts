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
      const syncUserWithBackend = async () => {
        try {
          const token = await getToken();
          
          // Get user info from Clerk
          const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (!clerkResponse.ok) {
            throw new Error('Failed to fetch user info');
          }
          
          const clerkUser = await clerkResponse.json();
          
          // Sync user data with our backend
          const syncResponse = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              clerkId: userId,
              email: clerkUser.email_addresses[0]?.email_address || "",
              name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || clerkUser.username,
              imageUrl: clerkUser.image_url,
              subscriptionTier: "free",
              subscriptionStatus: "active",
              currentPeriodStart: Date.now(),
              currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000),
              trialEnd: Date.now() + (14 * 24 * 60 * 60 * 1000),
            }),
          });
          
          if (!syncResponse.ok) {
            console.error('Failed to sync user data');
          } else {
            console.log('User data synced successfully');
          }
        } catch (error) {
          console.error("Error syncing user with backend:", error);
        }
      };

      syncUserWithBackend();
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