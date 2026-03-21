'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh(); // Ensure layout captures updated cookies
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold opacity-5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold opacity-5 blur-[120px]" />

      <div className="premium-card p-8 w-full max-w-md z-10 glass">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wider text-foreground">
            PALACE <span className="text-gold">FRYS</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2 tracking-widest uppercase">Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="input-label" htmlFor="password">
              Admin Access Key
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field py-3 text-center tracking-widest text-xl"
              placeholder="••••••••"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-md border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg font-bold tracking-wide uppercase transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Secure Access'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-600">
          <p>Restricted to authorized personnel only.</p>
          <p className="mt-1">&copy; 2026 Palace Frys. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
