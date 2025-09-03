"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
      appearance={{
        elements: {
            formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
            formFieldInput: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
            card: 'bg-white rounded-lg shadow-md overflow-hidden',
            headerTitle: 'text-2xl font-bold text-gray-900',
            headerSubtitle: 'text-gray-600',
            dividerLine: 'border-gray-200',
            socialButtonsBlockButton: 'flex items-center justify-center gap-2 w-full py-3 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors duration-200',
        },
      }}    >
      {children}
    </ClerkProvider>
  );
}