'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { workersApi, servicesApi } from '@/lib/api';

interface Worker {
  id: number;
  user_id: number;
  license_type: string;
  licensed_states: string[];
  services_offered: number[];
  user: {
    id: number;
    email: string;
    name: string;
    phone: string;
    address: string;
    role: string;
    created_at: string;
  };
}

interface Service {
  id: number;
  name: string;
  description: string;
}

export default function WorkerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workerId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    loadData();
  }, [router, workerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workerData, servicesData] = await Promise.all([
        workersApi.getById(parseInt(workerId)),
        servicesApi.getAll(),
      ]);
      setWorker(workerData);
      setServices(servicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load worker');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this worker? This action cannot be undone.')) {
      return;
    }

    try {
      await workersApi.delete(parseInt(workerId));
      alert('Worker deleted successfully');
      router.push('/admin/workers');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete worker');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getServiceNames = (serviceIds: number[]) => {
    return serviceIds
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(', ') || 'None';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ShiftBridge Admin</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/admin/dashboard"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/clients"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Clients
            </Link>
            <Link
              href="/admin/workers"
              className="px-3 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              Workers
            </Link>
            <Link
              href="/admin/shifts"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Shifts
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/workers"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Workers
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600">Loading worker details...</div>
          </div>
        ) : !worker ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Worker not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{worker.user.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Worker ID: {worker.id}</p>
                  <span className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    {worker.license_type}
                  </span>
                </div>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Worker
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-900">{worker.user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-gray-900">{worker.user.phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-gray-900">{worker.user.address}</p>
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">License Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">License Type</label>
                  <p className="mt-1 text-gray-900">{worker.license_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Licensed States</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {worker.licensed_states.map((state) => (
                      <span
                        key={state}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                      >
                        {state}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
              <p className="text-gray-900">{getServiceNames(worker.services_offered)}</p>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">User ID</label>
                  <p className="mt-1 text-gray-900">{worker.user_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Created</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(worker.user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}