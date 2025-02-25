import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithEmail } from '../utils/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      router.push('/');
    } catch (error) {
      console.error("Login error:", error);
      setError('Failed to log in. Please check your credentials.');
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-background-light">
      <div className="w-full max-w-md p-8 space-y-8 bg-secondary rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Log in to your account to continue</p>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-white bg-red-600 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-light">
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-primary-light">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}