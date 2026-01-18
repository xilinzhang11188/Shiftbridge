'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { clientsApi, servicesApi } from '@/lib/api';

interface Site {
  id: number;
  address: string;
  client_id: number;
}

interface Client {
  id: number;
  user_id: number;
  company_name: string;
  requested_services: number[];
  user: {
    id: number;
    email: string;
    name: string;
    phone: string;
    address: string;
    role: string;
    created_at: string;
  };
  sites?: Site[];
}

interface Service {
  id: number;
  name: string;
  description: string;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [client, setClient] = useState<Client | null>(null);
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
  }, [router, clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientData, servicesData] = await Promise.all([
        clientsApi.getById(parseInt(clientId)),
        servicesApi.getAll(),
      ]);
      setClient(clientData);
      setServices(servicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      await clientsApi.delete(parseInt(clientId));
      alert('Client deleted successfully');
      router.push('/admin/clients');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client');
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
              className="px-3 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
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
            href="/admin/clients"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Clients
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600">Loading client details...</div>
          </div>
        ) : !client ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Client not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{client.company_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Client ID: {client.id}</p>
                </div>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Client
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="mt-1 text-gray-900">{client.user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-900">{client.user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-gray-900">{client.user.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-gray-900">{client.user.address}</p>
                </div>
              </div>
            </div>

            {/* Sites */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sites</h3>
              {client.sites && client.sites.length > 0 ? (
                <div className="space-y-2">
                  {client.sites.map((site) => (
                    <div key={site.id} className="p-3 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-900">{site.address}</p>
                      <p className="text-xs text-gray-500">Site ID: {site.id}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sites added yet</p>
              )}
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requested Services</h3>
              <p className="text-gray-900">{getServiceNames(client.requested_services)}</p>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">User ID</label>
                  <p className="mt-1 text-gray-900">{client.user_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Created</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(client.user.created_at).toLocaleDateString('en-US', {
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