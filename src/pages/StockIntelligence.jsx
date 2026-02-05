import Layout from '../components/Layout';
import { stockIntelligence } from '../data/mockData';

const StockIntelligence = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Stock Intelligence</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Fast Moving</h3>
            <ul className="space-y-2">
              {stockIntelligence.fastMoving.map((item, idx) => (
                <li key={idx} className="text-sm bg-green-50 p-2 rounded">{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Slow Moving</h3>
            <ul className="space-y-2">
              {stockIntelligence.slowMoving.map((item, idx) => (
                <li key={idx} className="text-sm bg-yellow-50 p-2 rounded">{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Critical Stock</h3>
            <ul className="space-y-2">
              {stockIntelligence.critical.map((item, idx) => (
                <li key={idx} className="text-sm bg-red-50 p-2 rounded">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">AI Recommendations</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medicine</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stockIntelligence.recommendations.map((rec, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3">{rec.medicine}</td>
                  <td className="px-4 py-3">{rec.action}</td>
                  <td className="px-4 py-3">{rec.quantity || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StockIntelligence;
