"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to sign-in page for unauthenticated users
    router.push('/sign-in');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to EcoAlert</h1>
        <p className="text-gray-600">Redirecting to authentication...</p>
      </div>
    </div>
  );
}

// Generate static params for SEO
export async function generateMetadata() {
  return {
    title: 'EcoAlert - Pollution Intelligence & Emergency Response Suite',
    description: 'Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet',
  };
}
