import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Check if user is authenticated and redirect accordingly
async function checkAuth() {
  // const cookieStore = await cookies();
  // const token = cookieStore.get('auth-token')?.value;
  
  // if (!token) {
  //   // Redirect to onboarding for new users
  //   redirect('/onboarding');
  // }
  
  // For now, redirect to dashboard
  redirect('/dashboard');
}

export default function Home() {
  // This will redirect immediately
  checkAuth();
  
  return null;
}

// Generate static params for SEO
export async function generateMetadata() {
  return {
    title: 'EcoAlert - Pollution Intelligence & Emergency Response Suite',
    description: 'Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet',
  };
}
