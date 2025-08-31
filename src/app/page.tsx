import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to sign-in page for all users
  // The middleware will handle authentication checks
  redirect('/sign-in');
}

// Generate static params for SEO
export async function generateMetadata() {
  return {
    title: 'EcoAlert - Pollution Intelligence & Emergency Response Suite',
    description: 'Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet',
  };
}
