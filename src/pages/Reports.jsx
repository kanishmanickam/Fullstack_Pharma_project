import Layout from '../components/Layout';
import { salesData, demandForecast } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

const Reports = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sales vs Purchase Income</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#00684a" name="Sales" />
                <Bar dataKey="purchases" fill="#82ca9d" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Demand Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="demand" stroke="#00684a" name="Predicted" />
                <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
