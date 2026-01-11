export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Welcome to ShiftBridge
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Healthcare Staffing & Scheduling Platform
        </p>
        <p className="text-gray-500">
          Multi-state, multi-client, multi-worker scheduling management system
        </p>
        <div className="pt-8 space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
          <button className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
            Learn More
          </button>
        </div>
        <div className="pt-12 text-sm text-gray-400">
          <p>Frontend setup complete. Backend API available at http://localhost:8000</p>
        </div>
      </div>
    </div>
  );
}