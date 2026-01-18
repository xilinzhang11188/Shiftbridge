'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { shiftsApi } from '@/lib/api';

interface Shift {
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
  client_name?: string;
  site_address?: string;
  assigned_worker_name?: string;
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ShiftsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

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
    loadShifts();
  }, [router, statusFilter]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await shiftsApi.getAll(statusFilter);
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this shift?')) {
      return;
    }

    try {
      await shiftsApi.cancel(id);
      loadShifts(); // Reload to show updated status
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel shift');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    // Handle time format from backend (HH:MM:SS)
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shifts</h2>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Link
              href="/admin/shifts/new"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              + Create Shift
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600">Loading shifts...</div>
          </div>
        ) : shifts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              {statusFilter
                ? `No shifts found with status "${statusFilter}".`
                : 'No shifts found. Create your first shift to get started.'}
            </p>
            <Link
              href="/admin/shifts/new"
              className="mt-4 inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Create Shift
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(shift.day)}
                      </div>
                      {shift.repeat_pattern && (
                        <div className="text-xs text-gray-500">{shift.repeat_pattern}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shift.client_name || `Client #${shift.client_id}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{shift.site_address || `Site #${shift.site_id}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          STATUS_COLORS[shift.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {shift.assigned_worker_name || (shift.assigned_worker_id
                          ? `Worker #${shift.assigned_worker_id}`
                          : 'Unassigned')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {shift.service_ids.length} service(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/shifts/${shift.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      {shift.status !== 'CANCELLED' && (
                        <>
                          <button
                            onClick={() => router.push(`/admin/shifts/${shift.id}/edit`)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancel(shift.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}