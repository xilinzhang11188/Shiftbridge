'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UserRole = 'client' | 'worker' | 'admin';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('worker');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    // Client specific
    company_name: '',
    // Worker specific
    license_type: '',
    licensed_states: [] as string[],
    services_offered: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        email: formData.email,
        password: formData.password,
        role,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };

      if (role === 'client') {
        payload.company_name = formData.company_name;
      } else if (role === 'worker') {
        payload.license_type = formData.license_type;
        payload.licensed_states = formData.licensed_states;
        payload.services_offered = formData.services_offered;
      }

      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // TODO: Backend auth not fully implemented yet
      // For now, create mock user data for testing
      const mockUser = {
        id: Date.now(),
        email: formData.email,
        name: formData.name,
        role: role,
        phone: formData.phone,
        address: formData.address,
      };

      // Store mock token and user info
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Show success message
      alert(`Registration successful! Logging in as ${role}...`);

      // Redirect based on role
      switch (role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'worker':
          router.push('/worker/dashboard');
          break;
        case 'client':
          router.push('/client/dashboard');
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ShiftBridge</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`p-4 border-2 rounded-lg transition ${
                  role === 'worker'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Worker</div>
                <div className="text-xs text-gray-500">Healthcare Professional</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-4 border-2 rounded-lg transition ${
                  role === 'client'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Client</div>
                <div className="text-xs text-gray-500">Healthcare Facility</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-4 border-2 rounded-lg transition ${
                  role === 'admin'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Admin</div>
                <div className="text-xs text-gray-500">System Administrator</div>
              </button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                id="address"
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Client Specific Fields */}
          {role === 'client' && (
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                id="company_name"
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Worker Specific Fields */}
          {role === 'worker' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="license_type" className="block text-sm font-medium text-gray-700 mb-2">
                  License Type *
                </label>
                <select
                  id="license_type"
                  required
                  value={formData.license_type}
                  onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select license type</option>
                  <option value="Medical Provider">Medical Provider</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Medical Assistant">Medical Assistant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Licensed States * (Select at least one)
                </label>
                <div className="text-sm text-gray-500 mb-2">
                  Note: Full state selection will be available after registration
                </div>
                <input
                  type="text"
                  placeholder="e.g., CA, NY, TX (comma separated)"
                  value={formData.licensed_states.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    licensed_states: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
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