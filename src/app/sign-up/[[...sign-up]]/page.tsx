import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50">      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join EcoAlert
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start monitoring environmental data
          </p>
        </div>
        <SignUp
          routing="hash"
          signInForceRedirectUrl="/sign-in"
          afterSignUpUrl="/onboarding"
          appearance={{
            elements: {
              card: 'bg-white/90 backdrop-blur-sm',
              headerTitle: 'text-2xl font-bold text-green-600',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200',
              formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
              formInput: 'border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
            },
          }}
        />
      </div>
    </div>
  );
}