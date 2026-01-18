'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { shiftsApi, clientsApi, servicesApi, workersApi } from '@/lib/api';

interface Site {
  id: number;
  address: string;
  client_id: number;
}

interface Client {
  id: number;
  company_name: string;
  user: {
    name: string;
  };
  sites?: Site[];
}

interface Service {
  id: number;
  name: string;
  description: string;
}

interface Worker {
  id: number;
  user: {
    name: string;
  };
  license_type: string;
}

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
}

export default function EditShiftPage() {
  const router = useRouter();
  const params = useParams();
  const shiftId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    client_id: '',
    site_id: '',
    service_ids: [] as number[],
    day: '',
    start_time: '',
    end_time: '',
    repeat_pattern: '',
    assigned_worker_id: '',
  });

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
      const [shiftData, clientsData, servicesData, workersData] = await Promise.all([
        shiftsApi.getById(parseInt(shiftId)),
        clientsApi.getAll(),
        servicesApi.getAll(),
        workersApi.getAll(),
      ]);
      
      setShift(shiftData);
      setClients(clientsData);
      setServices(servicesData);
      setWorkers(workersData);
      
      // Load sites for the shift's client
      if (shiftData.client_id) {
        const clientData = await clientsApi.getById(shiftData.client_id);
        setSites(clientData.sites || []);
      }
      
      // Populate form with existing data
      setFormData({
        client_id: shiftData.client_id.toString(),
        site_id: shiftData.site_id.toString(),
        service_ids: shiftData.service_ids,
        day: shiftData.day,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        repeat_pattern: shiftData.repeat_pattern || '',
        assigned_worker_id: shiftData.assigned_worker_id?.toString() || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shift data');
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = async (clientId: string) => {
    setFormData({ ...formData, client_id: clientId, site_id: '' });
    
    if (clientId) {
      try {
        const clientData = await clientsApi.getById(parseInt(clientId));
        setSites(clientData.sites || []);
      } catch (err) {
        console.error('Failed to load client sites:', err);
        setSites([]);
      }
    } else {
      setSites([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.client_id) {
      setError('Please select a client');
      return;
    }
    if (!formData.site_id) {
      setError('Please select a site');
      return;
    }
    if (formData.service_ids.length === 0) {
      setError('Please select at least one service');
      return;
    }
    if (!formData.day) {
      setError('Please select a date');
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      setError('Please enter start and end times');
      return;
    }

    // Validate end time is after start time
    if (formData.end_time <= formData.start_time) {
      setError('End time must be after start time');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        client_id: parseInt(formData.client_id),
        site_id: parseInt(formData.site_id),
        service_ids: formData.service_ids,
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        repeat_pattern: formData.repeat_pattern || null,
        assigned_worker_id: formData.assigned_worker_id ? parseInt(formData.assigned_worker_id) : null,
      };

      console.log('Updating shift with payload:', payload);
      await shiftsApi.update(parseInt(shiftId), payload);
      alert('Shift updated successfully!');
      router.push('/admin/shifts');
    } catch (err: any) {
      console.error('Error updating shift:', err);
      if (err.message) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Failed to update shift. Please check all fields and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleServiceToggle = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter((id) => id !== serviceId)
        : [...prev.service_ids, serviceId],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Shift not found</div>
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/shifts"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Shifts
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Shift</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client & Location</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  {clients.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No clients available.
                    </p>
                  ) : (
                    <select
                      id="client_id"
                      required
                      value={formData.client_id}
                      onChange={(e) => handleClientChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.company_name} - {client.user.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label htmlFor="site_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Site Location *
                  </label>
                  {!formData.client_id ? (
                    <p className="text-sm text-gray-500 py-2">
                      Please select a client first
                    </p>
                  ) : sites.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">
                      No sites available for this client.
                    </p>
                  ) : (
                    <select
                      id="site_id"
                      required
                      value={formData.site_id}
                      onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a site</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.address}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    id="day"
                    type="date"
                    required
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      id="start_time"
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      id="end_time"
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="repeat_pattern" className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat Pattern (Optional)
                  </label>
                  <input
                    id="repeat_pattern"
                    type="text"
                    value={formData.repeat_pattern}
                    onChange={(e) => setFormData({ ...formData, repeat_pattern: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Weekly, Daily, etc."
                  />
                </div>
              </div>
            </div>

            {/* Worker Assignment (Optional) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Worker Assignment (Optional)</h3>
              <div>
                <label htmlFor="assigned_worker_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Worker
                </label>
                {workers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No workers available.
                  </p>
                ) : (
                  <select
                    id="assigned_worker_id"
                    value={formData.assigned_worker_id}
                    onChange={(e) => setFormData({ ...formData, assigned_worker_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Leave unassigned</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.user.name} ({worker.license_type})
                      </option>
                    ))}
                  </select>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  You can assign a worker now or leave it unassigned for workers to claim later
                </p>
              </div>
            </div>

            {/* Services Required */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Required *</h3>
              {services.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No services available.
                </p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.service_ids.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        {service.description && (
                          <div className="text-xs text-gray-500">{service.description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link
                href="/admin/shifts"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || clients.length === 0 || services.length === 0}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}