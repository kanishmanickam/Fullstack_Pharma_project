import { useState } from 'react';
import Layout from '../components/Layout';
import { FaFileAlt, FaChartBar, FaCalendarAlt, FaDownload } from 'react-icons/fa';

const FinancialReports = () => {
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');

  // Mock financial data
  const financialData = {
    daily: {
      purchases: [
        { date: '2024-01-01', amount: 5000, items: 12, suppliers: 3 },
        { date: '2024-01-02', amount: 7500, items: 15, suppliers: 4 },
        { date: '2024-01-03', amount: 4200, items: 8, suppliers: 2 },
      ],
      sales: [
        { date: '2024-01-01', amount: 8500, bills: 25, customers: 20 },
        { date: '2024-01-02', amount: 12000, bills: 35, customers: 28 },
        { date: '2024-01-03', amount: 9800, bills: 30, customers: 25 },
      ],
    },
    weekly: {
      purchases: [
        { week: 'Week 1', amount: 28000, items: 65, suppliers: 8 },
        { week: 'Week 2', amount: 32000, items: 72, suppliers: 9 },
        { week: 'Week 3', amount: 29500, items: 68, suppliers: 7 },
        { week: 'Week 4', amount: 31000, items: 70, suppliers: 8 },
      ],
      sales: [
        { week: 'Week 1', amount: 45000, bills: 120, customers: 95 },
        { week: 'Week 2', amount: 52000, bills: 140, customers: 110 },
        { week: 'Week 3', amount: 48000, bills: 130, customers: 102 },
        { week: 'Week 4', amount: 50000, bills: 135, customers: 108 },
      ],
    },
    monthly: {
      purchases: [
        { month: 'Jan 2024', amount: 120500, items: 275, suppliers: 12 },
        { month: 'Feb 2024', amount: 115000, items: 260, suppliers: 11 },
        { month: 'Mar 2024', amount: 132000, items: 290, suppliers: 13 },
      ],
      sales: [
        { month: 'Jan 2024', amount: 195000, bills: 525, customers: 415 },
        { month: 'Feb 2024', amount: 185000, bills: 490, customers: 390 },
        { month: 'Mar 2024', amount: 210000, bills: 550, customers: 440 },
      ],
    },
  };

  const data = financialData[period];
  const totalPurchases = data.purchases.reduce((sum, item) => sum + item.amount, 0);
  const totalSales = data.sales.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalSales - totalPurchases;
  const profitMargin = ((netProfit / totalSales) * 100).toFixed(2);

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>
          <p className="text-gray-600 mt-2">Compare purchase income vs sales income</p>
        </div>

        {/* Period Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('daily')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    period === 'daily'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    period === 'weekly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    period === 'monthly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
              <FaDownload />
              Export PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-red-600">₹{totalPurchases.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <FaChartBar className="text-red-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">₹{totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaChartBar className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-primary-600">₹{netProfit.toLocaleString()}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <FaChartBar className="text-primary-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-600">{profitMargin}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaChartBar className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Purchase vs Sales Comparison</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider bg-red-50">
                    Purchase Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider bg-red-50">
                    Items/Suppliers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider bg-green-50">
                    Sales Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider bg-green-50">
                    Bills/Customers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider bg-primary-50">
                    Net Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider bg-primary-50">
                    Margin %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.purchases.map((purchase, index) => {
                  const sale = data.sales[index];
                  const profit = sale.amount - purchase.amount;
                  const margin = ((profit / sale.amount) * 100).toFixed(2);
                  const periodLabel = purchase.date || purchase.week || purchase.month;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {periodLabel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 bg-red-50 font-semibold">
                        ₹{purchase.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 bg-red-50">
                        {purchase.items} items / {purchase.suppliers} suppliers
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 bg-green-50 font-semibold">
                        ₹{sale.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 bg-green-50">
                        {sale.bills} bills / {sale.customers} customers
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 bg-primary-50 font-bold">
                        ₹{profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 bg-primary-50 font-bold">
                        {margin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr className="font-bold">
                  <td className="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                  <td className="px-6 py-4 text-sm text-red-600 bg-red-100">
                    ₹{totalPurchases.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 bg-red-100">-</td>
                  <td className="px-6 py-4 text-sm text-green-600 bg-green-100">
                    ₹{totalSales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 bg-green-100">-</td>
                  <td className="px-6 py-4 text-sm text-primary-600 bg-primary-100">
                    ₹{netProfit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-primary-600 bg-primary-100">
                    {profitMargin}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This financial report compares purchase costs vs sales revenue for the selected period. 
            Net profit is calculated as Sales - Purchases. Profit margin shows profitability percentage.
            Owner-only access ensures sensitive financial data remains confidential.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default FinancialReports;
