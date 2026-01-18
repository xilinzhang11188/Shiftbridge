'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { shiftsApi, servicesApi } from '@/lib/api';

interface ShiftDetail {
  id: number;
  client_id: number;
  site_id: number;
  service_ids: number[];
  day: string;
  start_time: string;
  end_time: string;
  repeat_pattern: string | null;
  status: string;
  assigned_worker_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  client_name: string | null;
  site_address: string | null;
  assigned_worker_name: string | null;
  claimants_count: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ShiftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shiftId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [shift, setShift] = useState<ShiftDetail | null>(null);
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
  }, [router, shiftId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shiftData, servicesData] = await Promise.all([
        shiftsApi.getById(parseInt(shiftId)),
        servicesApi.getAll(),
      ]);
      setShift(shiftData);
      setServices(servicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shift');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this shift?')) {
      return;
    }

    try {
      await shiftsApi.cancel(parseInt(shiftId));
      alert('Shift cancelled successfully');
      loadData(); // Reload to show updated status
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel shift');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Workers
            </Link>
            <Link
              href="/admin/shifts"
              className="px-3 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
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
            href="/admin/shifts"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Shifts
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600">Loading shift details...</div>
          </div>
        ) : !shift ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Shift not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shift #{shift.id}</h2>
                  <div className="mt-2 flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        STATUS_COLORS[shift.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {shift.status}
                    </span>
                    {shift.repeat_pattern && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                        {shift.repeat_pattern}
                      </span>
                    )}
                  </div>
                </div>
                {shift.status !== 'CANCELLED' && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Cancel Shift
                  </button>
                )}
              </div>
            </div>

            {/* Schedule Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-gray-900">{formatDate(shift.day)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Time</label>
                  <p className="mt-1 text-gray-900">
                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Client & Location */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client & Location</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Client</label>
                  <p className="mt-1 text-gray-900">
                    {shift.client_name || `Client #${shift.client_id}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Site</label>
                  <p className="mt-1 text-gray-900">
                    {shift.site_address || `Site #${shift.site_id}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Worker Assignment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Worker Assignment</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Assigned Worker</label>
                  <p className="mt-1 text-gray-900">
                    {shift.assigned_worker_name || 
                     (shift.assigned_worker_id ? `Worker #${shift.assigned_worker_id}` : 'Unassigned')}
                  </p>
                </div>
                {shift.claimants_count > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pending Claims</label>
                    <p className="mt-1 text-gray-900">{shift.claimants_count} worker(s) interested</p>
                  </div>
                )}
              </div>
            </div>

            {/* Services Required */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Required</h3>
              <p className="text-gray-900">{getServiceNames(shift.service_ids)}</p>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(shift.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(shift.updated_at).toLocaleDateString('en-US', {
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