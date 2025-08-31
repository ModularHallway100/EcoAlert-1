import { redirect } from 'next/navigation';

// Generate static params for SEO
export async function generateMetadata() {
  return {
    title: 'EcoAlert - Pollution Intelligence & Emergency Response Suite',
    description: 'Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet',
  };
}

export default function Home() {
  // Redirect to sign-in page for unauthenticated users
  redirect('/sign-in');
}
