import { redirect } from 'next/navigation';
import { SignedIn, SignedOut } from "@clerk/nextjs";

// Generate static params for SEO
export async function generateMetadata() {
  return {
    title: 'EcoAlert - Pollution Intelligence & Emergency Response Suite',
    description: 'Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet',
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to EcoAlert
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet
          </p>
          
          <div className="mb-12">
            <SignedOut>
              <div className="space-x-4">
                <a
                  href="/sign-in"
                  className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Sign In
                </a>
                <a
                  href="/sign-up"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </a>
              </div>
            </SignedOut>
            
            <SignedIn>
              <div className="space-x-4">
                <a
                  href="/dashboard"
                  className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Go to Dashboard
                </a>
              </div>
            </SignedIn>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Monitoring</h3>
              <p className="text-gray-600">Track environmental data in real-time from multiple IoT sensors across your area.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Insights</h3>
              <p className="text-gray-600">Get intelligent analysis and predictions about environmental trends and pollution sources.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Emergency Response</h3>
              <p className="text-gray-600">Receive instant alerts and take action during environmental emergencies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
