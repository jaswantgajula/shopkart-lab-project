import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentCustomer, logoutCustomer } from '../services/api';

const Home = ({ onUserLoaded }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    setActionMessage('');
    try {
      const response = await getCurrentCustomer();
      setRawResponse(response);
      const customerData = response.customer || response.user || response;
      setCustomer(customerData);
      if (onUserLoaded) {
        onUserLoaded(customerData);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Unauthorized / Not logged in';
      setError(msg);
      setCustomer(null);
      setRawResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      if (onUserLoaded) onUserLoaded(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setActionMessage('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto my-10 p-6 text-center text-gray-600">
        Checking authentication status...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white p-6 border border-gray-300 rounded shadow-sm text-center">
        <h2 className="text-lg font-bold text-red-600 mb-2">Not Authenticated</h2>
        <p className="text-sm text-gray-600 mb-4">{error || 'You need to log in to view this page.'}</p>
        <div className="flex justify-center space-x-3">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            Go to Login
          </Link>
          <button
            onClick={fetchProfile}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded"
          >
            Retry /customers/me
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white border border-gray-300 rounded shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h1 className="text-xl font-bold text-gray-800">Customer Dashboard</h1>
        <div className="space-x-2">
          <button
            onClick={fetchProfile}
            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded"
          >
            Refresh Profile (GET /me)
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
          {actionMessage}
        </div>
      )}

      {/* Customer Information Table */}
      <div className="border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide border-b border-gray-200">
          Customer Profile Info
        </div>
        <table className="w-full text-left text-sm divide-y divide-gray-200">
          <tbody>
            <tr>
              <td className="px-4 py-2.5 font-medium text-gray-600 bg-gray-50/50 w-1/3">Full Name</td>
              <td className="px-4 py-2.5 text-gray-900 font-semibold">{customer.fullName || customer.name || 'N/A'}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 font-medium text-gray-600 bg-gray-50/50">Email</td>
              <td className="px-4 py-2.5 text-gray-900">{customer.email || 'N/A'}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 font-medium text-gray-600 bg-gray-50/50">Phone</td>
              <td className="px-4 py-2.5 text-gray-900">{customer.phone || customer.phoneNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 font-medium text-gray-600 bg-gray-50/50">Customer ID</td>
              <td className="px-4 py-2.5 font-mono text-xs text-gray-800">{customer._id || customer.id || 'N/A'}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 font-medium text-gray-600 bg-gray-50/50">Role</td>
              <td className="px-4 py-2.5 text-gray-900 capitalize">{customer.role || 'customer'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Raw Backend Response JSON Box (Testing Tool) */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Backend API Response (JSON):
        </div>
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono">
          {JSON.stringify(rawResponse, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Home;
