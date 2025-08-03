'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/data/storage';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Forgot password form submitted with email:', email);
    setError('');
    setMessage('');

    const users = storage.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      console.log('No user found with email:', email);
      setError('No account found with that email address.');
      return;
    }

    // Simulate generating a reset token and sending email
    const resetToken = Math.random().toString(36).substr(2, 8);
    console.log('Generated reset token:', resetToken);
    storage.saveResetToken(email, resetToken);

    setMessage('A password reset link has been sent to your email address.');
    // For demo, redirect to reset password page with token param
    setTimeout(() => {
      console.log('Redirecting to reset password page');
      router.push(`/login/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Enter your email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
