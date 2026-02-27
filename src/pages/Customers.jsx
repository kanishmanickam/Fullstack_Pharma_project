import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosConfig';
import Layout from '../components/Layout';
import { FaSearch, FaTimes } from 'react-icons/fa';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('medistock_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/customers`);
      const apiData = res.data.customers || [];
      setCustomers(apiData);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all customers initially
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Search handler with API fallback
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      fetchCustomers();
      return;
    }

    // Try API search
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/customers/search`, {
        params: { query },
      });
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error('Search failed:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    handleSearch('');
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Management</h1>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex gap-2">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, phone, or email..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id || customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${customer.type === 'regular' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {customer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm">{customer.email}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{customer.totalPurchases || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Searching...' : 'No customers found matching your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
