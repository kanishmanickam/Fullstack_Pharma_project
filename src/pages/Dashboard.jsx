import Layout from '../components/Layout';
import { medicines, notifications } from '../data/mockData';
import { calculateKPIs, getExpiryStatus, getStockStatus, sortByFEFO } from '../utils/helpers';
import { FaBoxes, FaExclamationTriangle, FaClock, FaTimesCircle, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const kpis = calculateKPIs(medicines);
  const fefoMedicines = sortByFEFO(medicines).slice(0, 5);
  const recentNotifications = notifications.slice(0, 4);

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Medicines</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.total}</p>
              </div>
              <FaBoxes className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Low Stock</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{kpis.lowStock}</p>
              </div>
              <FaExclamationTriangle className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Near Expiry</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{kpis.nearExpiry}</p>
              </div>
              <FaClock className="text-4xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Expired</p>
                <p className="text-3xl font-bold text-gray-600 mt-2">{kpis.expired}</p>
              </div>
              <FaTimesCircle className="text-4xl text-gray-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FEFO Priority List */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              FEFO Priority (First Expiry First Out)
            </h2>
            <div className="space-y-3">
              {fefoMedicines.map((medicine) => {
                const expiryStatus = getExpiryStatus(medicine.expiryDate);
                const stockStatus = getStockStatus(medicine.quantity, medicine.reorderLevel);
                
                return (
                  <div key={medicine.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{medicine.name}</p>
                        <p className="text-sm text-gray-500">Batch: {medicine.batchNumber} | Rack: {medicine.rackNumber}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        expiryStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                        expiryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {expiryStatus.days}d left
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        stockStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                        stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {stockStatus.label}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        Qty: {medicine.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/inventory" className="block mt-4 text-center text-primary-600 hover:text-primary-700 font-medium">
              View Full Inventory →
            </Link>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaBell className="text-primary-600" />
              Recent Notifications
            </h2>
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className={`border-l-4 p-4 rounded ${
                  notif.priority === 'high' ? 'border-red-500 bg-red-50' :
                  notif.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(notif.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/billing" className="bg-primary-600 text-white p-6 rounded-xl hover:bg-primary-700 transition-colors text-center">
            <p className="text-2xl font-bold">Create Bill</p>
            <p className="text-sm mt-1">Start new billing transaction</p>
          </Link>
          <Link to="/inventory" className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors text-center">
            <p className="text-2xl font-bold">Manage Inventory</p>
            <p className="text-sm mt-1">Add or update medicines</p>
          </Link>
          <Link to="/excel-upload" className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors text-center">
            <p className="text-2xl font-bold">Upload Excel</p>
            <p className="text-sm mt-1">Bulk import inventory data</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
