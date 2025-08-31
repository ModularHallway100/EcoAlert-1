"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexHttpClient } from "convex/browser";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={() => ({ isAuthenticated: false })}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}