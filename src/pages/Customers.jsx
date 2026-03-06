import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosConfig';
import Layout from '../components/Layout';
import { FaSearch, FaTimes, FaPlus, FaUserPlus } from 'react-icons/fa';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    customerType: 'regular',
    address: '',
    city: '',
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      await axiosInstance.post('/customers', formData);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        customerType: 'regular',
        address: '',
        city: '',
      });
      fetchCustomers();
    } catch (err) {
      console.error('Failed to create customer:', err);
      alert(err.response?.data?.message || 'Error creating customer');
    } finally {
      setAdding(false);
    }
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <FaPlus /> Add Customer
          </button>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${customer.customerType === 'regular' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {customer.customerType ? customer.customerType.charAt(0).toUpperCase() + customer.customerType.slice(1) : 'Unknown'}
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

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaUserPlus className="text-indigo-600" /> Add New Customer
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="+919876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="regular">Regular</option>
                  <option value="walking">Walking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Chennai"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:bg-indigo-400"
                >
                  {adding ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Customers;
