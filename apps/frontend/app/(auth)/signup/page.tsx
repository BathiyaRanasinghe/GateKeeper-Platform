export const dynamic = 'force-dynamic';

import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GateKeeper</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
