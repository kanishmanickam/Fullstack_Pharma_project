import { useState } from 'react';
import Layout from '../components/Layout';
import { medicines, customers } from '../data/mockData';
import { formatCurrency, sortByFEFO } from '../utils/helpers';
import { FaSearch, FaTrash, FaCheck } from 'react-icons/fa';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState([]);
  const [customerType, setCustomerType] = useState('walking'); // walking or regular
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash or gpay
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);

  // Filter medicines based on search
  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add item to bill
  const handleAddItem = () => {
    if (!selectedMedicine || quantity <= 0) return;

    // Check if enough stock
    if (quantity > selectedMedicine.quantity) {
      alert(`Not enough stock! Available: ${selectedMedicine.quantity}`);
      return;
    }

    const existingItem = billItems.find(item => item.medicineId === selectedMedicine.id);
    
    if (existingItem) {
      // Update quantity if medicine already in bill
      setBillItems(billItems.map(item =>
        item.medicineId === selectedMedicine.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      // Add new item
      const newItem = {
        medicineId: selectedMedicine.id,
        name: selectedMedicine.name,
        batchNo: selectedMedicine.batchNo,
        expiryDate: selectedMedicine.expiryDate,
        rackNo: selectedMedicine.rackNo,
        price: selectedMedicine.price,
        quantity: quantity,
        total: selectedMedicine.price * quantity
      };
      setBillItems([...billItems, newItem]);
    }

    // Reset selection
    setSelectedMedicine(null);
    setQuantity(1);
    setSearchTerm('');
  };

  // Remove item from bill
  const handleRemoveItem = (medicineId) => {
    setBillItems(billItems.filter(item => item.medicineId !== medicineId));
  };

  // Calculate bill totals
  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.12; // 12% GST
  const grandTotal = subtotal + tax;

  // Process payment
  const handlePayment = () => {
    if (billItems.length === 0) {
      alert('Please add items to the bill first!');
      return;
    }

    const newBill = {
      id: Math.floor(Math.random() * 10000),
      date: new Date().toISOString(),
      customerType,
      customerName: customerType === 'regular' && selectedCustomer ? selectedCustomer.name : 'Walking Customer',
      items: billItems,
      subtotal,
      tax,
      total: grandTotal,
      paymentMethod
    };

    setCurrentBill(newBill);
    setShowPaymentSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setBillItems([]);
      setCustomerType('walking');
      setSelectedCustomer(null);
      setPaymentMethod('cash');
      setShowPaymentSuccess(false);
      setCurrentBill(null);
    }, 3000);
  };

  // Payment success screen
  if (showPaymentSuccess && currentBill) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-600 text-4xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Transaction completed successfully</p>
            
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Bill ID:</span>
                <span className="font-semibold">#{currentBill.id}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-2xl text-primary-600">{formatCurrency(currentBill.total)}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold uppercase">{currentBill.paymentMethod}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold">{new Date(currentBill.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold">
                  {currentBill.customerName}
                  {currentBill.customerType === 'regular' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Regular</span>
                  )}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500">Redirecting to new bill...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Billing</h1>
          <p className="text-gray-600 mt-2">Create new bills with FEFO batch preference</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section - Medicine Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Medicine</h2>
            
            {/* Customer Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setCustomerType('walking')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                    customerType === 'walking'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                  }`}
                >
                  Walking Customer
                </button>
                <button
                  onClick={() => setCustomerType('regular')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                    customerType === 'regular'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                  }`}
                >
                  Regular Customer
                </button>
              </div>
            </div>

            {/* Regular Customer Selection */}
            {customerType === 'regular' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => setSelectedCustomer(customers.find(c => c.id === parseInt(e.target.value)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a customer</option>
                  {customers.filter(c => c.type === 'regular').map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Medicine Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Medicine</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or category..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Medicine List */}
            {searchTerm && (
              <div className="mb-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredMedicines.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No medicines found</p>
                ) : (
                  <div className="divide-y">
                    {sortByFEFO(filteredMedicines).map(medicine => (
                      <button
                        key={medicine.id}
                        onClick={() => {
                          setSelectedMedicine(medicine);
                          setSearchTerm('');
                        }}
                        className="w-full p-4 text-left hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{medicine.name}</p>
                            <p className="text-sm text-gray-600">{medicine.category}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Batch: {medicine.batchNo} | Rack: {medicine.rackNo} | Stock: {medicine.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-primary-600">{formatCurrency(medicine.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Medicine */}
            {selectedMedicine && (
              <div className="mb-4 p-4 bg-primary-50 border-2 border-primary-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{selectedMedicine.name}</p>
                    <p className="text-sm text-gray-600">{selectedMedicine.category}</p>
                  </div>
                  <p className="font-bold text-primary-600">{formatCurrency(selectedMedicine.price)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Batch:</span>
                    <span className="ml-2 font-semibold">{selectedMedicine.batchNo}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rack:</span>
                    <span className="ml-2 font-semibold">{selectedMedicine.rackNo}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expiry:</span>
                    <span className="ml-2 font-semibold">{selectedMedicine.expiryDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Available:</span>
                    <span className="ml-2 font-semibold">{selectedMedicine.quantity}</span>
                  </div>
                </div>
                
                {/* Quantity Input */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedMedicine.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddItem}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>FEFO Note:</strong> Medicines are automatically sorted by expiry date. Select items with nearest expiry first.
              </p>
            </div>
          </div>

          {/* Right Section - Bill Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bill Summary</h2>

            {/* Bill Items */}
            <div className="mb-6">
              {billItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items added yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {billItems.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Batch: {item.batchNo} | Rack: {item.rackNo}
                          </p>
                          <p className="text-xs text-gray-500">Expiry: {item.expiryDate}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.medicineId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {formatCurrency(item.price)} × {item.quantity}
                        </span>
                        <span className="font-bold text-primary-600">{formatCurrency(item.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Totals */}
            {billItems.length > 0 && (
              <>
                <div className="border-t pt-4 mb-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>GST (12%):</span>
                    <span className="font-semibold">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                    <span>Grand Total:</span>
                    <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                        paymentMethod === 'cash'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('gpay')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                        paymentMethod === 'gpay'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                      }`}
                    >
                      GPay
                    </button>
                  </div>
                </div>

                {/* Complete Payment Button */}
                <button
                  onClick={handlePayment}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                >
                  Complete Payment
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Billing;
