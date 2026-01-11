'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type DemoRole = 'admin' | 'worker' | 'client';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginAsDemo = (role: DemoRole) => {
    const demoUsers = {
      admin: {
        id: 1,
        email: 'admin@shiftbridge.com',
        name: 'Demo Admin',
        role: 'admin',
        phone: '555-0001',
        address: '123 Admin St, City, State',
      },
      worker: {
        id: 2,
        email: 'worker@shiftbridge.com',
        name: 'Demo Worker',
        role: 'worker',
        phone: '555-0002',
        address: '456 Worker Ave, City, State',
        license_type: 'Nurse',
        licensed_states: ['CA', 'NY', 'TX'],
        services_offered: ['Nursing', 'Patient Care'],
      },
      client: {
        id: 3,
        email: 'client@shiftbridge.com',
        name: 'Demo Client',
        role: 'client',
        phone: '555-0003',
        address: '789 Client Blvd, City, State',
        company_name: 'Demo Healthcare Facility',
      },
    };

    const user = demoUsers[role];
    localStorage.setItem('token', `demo-token-${role}-${Date.now()}`);
    localStorage.setItem('user', JSON.stringify(user));

    // Redirect to appropriate dashboard
    router.push(`/${role}/dashboard`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // TODO: Backend auth not fully implemented yet
      // For now, create mock user data for testing
      // In production, this would come from the backend response
      const mockUser = {
        id: Date.now(),
        email: formData.email,
        name: formData.email.split('@')[0], // Use email prefix as name
        role: 'admin', // Default to admin for testing
        phone: '555-0000',
        address: 'Test Address',
      };

      // Store mock token and user info
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Show success message
      alert(`Login successful! Logging in as ${mockUser.role}...`);

      // Redirect based on role
      switch (mockUser.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'worker':
          router.push('/worker/dashboard');
          break;
        case 'client':
          router.push('/client/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ShiftBridge</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Account Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">
            Quick access with demo accounts:
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => loginAsDemo('admin')}
              className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
            >
              Demo Admin
            </button>
            <button
              onClick={() => loginAsDemo('worker')}
              className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
            >
              Demo Worker
            </button>
            <button
              onClick={() => loginAsDemo('client')}
              className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
            >
              Demo Client
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            No credentials needed - instant access to explore each role
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}