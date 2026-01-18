'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clientsApi, servicesApi } from '@/lib/api';

interface Service {
  id: number;
  name: string;
  description: string;
}

export default function NewClientPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [siteAddresses, setSiteAddresses] = useState<string[]>([]);
  const [newSiteAddress, setNewSiteAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    company_name: '',
    requested_services: [] as number[],
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
    loadServices();
  }, [router]);

  const loadServices = async () => {
    try {
      const data = await servicesApi.getAll();
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (siteAddresses.length === 0) {
      setError('Please add at least one site');
      return;
    }

    setLoading(true);

    try {
      // Combine address fields
      const address = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`;
      const payload = {
        ...formData,
        address,
      };
      
      // Create client first
      const newClient = await clientsApi.create(payload);
      
      // Then create sites for the client
      for (const siteAddress of siteAddresses) {
        await clientsApi.createSite(newClient.id, {
          address: siteAddress,
          services_available: []
        });
      }
      
      alert('Client created successfully with sites!');
      router.push('/admin/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = () => {
    if (!newSiteAddress.trim()) {
      alert('Please enter a site address');
      return;
    }
    setSiteAddresses([...siteAddresses, newSiteAddress]);
    setNewSiteAddress('');
  };

  const handleRemoveSite = (index: number) => {
    setSiteAddresses(siteAddresses.filter((_, i) => i !== index));
  };

  const handleServiceToggle = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      requested_services: prev.requested_services.includes(serviceId)
        ? prev.requested_services.filter((id) => id !== serviceId)
        : [...prev.requested_services, serviceId],
    }));
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/clients"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Clients
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Client</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-4">
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
                    placeholder="Healthcare Facility Name"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h3>
              <div className="space-y-4">
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
                    placeholder="John Doe"
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
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimum 8 characters"
                  />
                </div>

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
                    placeholder="555-0123"
                  />
                </div>

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    id="street"
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Boston"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      id="state"
                      type="text"
                      required
                      maxLength={2}
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MA"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    id="zip"
                    type="text"
                    required
                    maxLength={10}
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="02101"
                  />
                </div>
              </div>
            </div>

            {/* Sites */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sites *</h3>
              <div className="space-y-4">
                {/* Existing Sites */}
                {siteAddresses.length > 0 && (
                  <div className="space-y-2">
                    {siteAddresses.map((address, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">{address}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSite(index)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add New Site */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSiteAddress}
                    onChange={(e) => setNewSiteAddress(e.target.value)}
                    placeholder="Enter site address (e.g., 123 Main St, Boston, MA 02101)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddSite}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Add Site
                  </button>
                </div>
                {siteAddresses.length === 0 && (
                  <p className="text-sm text-gray-500">Add at least one site to enable shift creation for this client.</p>
                )}
              </div>
            </div>

            {/* Requested Services */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requested Services</h3>
              {services.length === 0 ? (
                <p className="text-gray-500 text-sm">No services available. Please create services first.</p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requested_services.includes(service.id)}
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
                href="/admin/clients"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}