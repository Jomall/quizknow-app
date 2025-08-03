'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { storage } from '@/lib/data/storage';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email and token from URL params
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (!emailParam || !tokenParam) {
      setError('Invalid reset link');
      return;
    }
    
    setEmail(emailParam);
    
    // Validate token
    if (storage.validateResetToken(emailParam, tokenParam)) {
      setIsValidToken(true);
    } else {
      setError('Invalid or expired reset link');
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset password form submitted with:', { email, password, confirmPassword });
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      console.log('Password too short');
      setError('Password must be at least 6 characters long');
      return;
    }

    // Reset password
    if (storage.resetPassword(email, password)) {
      console.log('Password reset successful');
      setMessage('Password successfully reset. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      console.log('Password reset failed');
      setError('Failed to reset password. Please try again.');
    }
  };

  if (!isValidToken && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded shadow">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
        
        {isValidToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Reset Password
            </button>
          </form>
        ) : (
          <div>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push('/login/forgot-password')}
              className="mt-4 w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
            >
              Request New Reset Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
