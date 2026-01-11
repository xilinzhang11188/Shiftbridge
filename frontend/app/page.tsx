'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const loginAsDemo = (role: 'admin' | 'worker' | 'client') => {
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
    router.push(`/${role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8 max-w-4xl">
        <h1 className="text-5xl font-bold text-gray-900">
          Welcome to ShiftBridge
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Healthcare Staffing & Scheduling Platform
        </p>
        <p className="text-gray-500">
          Multi-state, multi-client, multi-worker scheduling management system
        </p>
        
        {/* Main Action Buttons */}
        <div className="pt-8 space-x-4">
          <Link href="/login">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Get Started
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Demo Accounts Section */}
        <div className="pt-12 pb-8">
          <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Try Demo Accounts (No signup required)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => loginAsDemo('admin')}
                className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <div className="font-semibold text-lg">Admin Demo</div>
                <div className="text-sm opacity-90 mt-1">Manage system & users</div>
              </button>
              <button
                onClick={() => loginAsDemo('worker')}
                className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <div className="font-semibold text-lg">Worker Demo</div>
                <div className="text-sm opacity-90 mt-1">View & claim shifts</div>
              </button>
              <button
                onClick={() => loginAsDemo('client')}
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <div className="font-semibold text-lg">Client Demo</div>
                <div className="text-sm opacity-90 mt-1">Request shifts</div>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 text-sm text-gray-400">
          <p>Frontend running. Backend API available at http://localhost:8000</p>
        </div>
      </div>
    </div>
  );
}