import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Get days until expiry
export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get stock status
export const getStockStatus = (quantity, reorderLevel) => {
  if (quantity <= reorderLevel / 2) return 'low';
  if (quantity <= reorderLevel) return 'medium';
  return 'high';
};

// FEFO sorting - sort by expiry date (ascending)
export const sortByFEFO = (medicines) => {
  return medicines.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
};

// Check if medicine is near expiry (within 7 days)
export const isNearExpiry = (expiryDate, days = 7) => {
  const daysLeft = getDaysUntilExpiry(expiryDate);
  return daysLeft <= days && daysLeft > 0;
};

// Check if medicine is expired
export const isExpired = (expiryDate) => {
  return getDaysUntilExpiry(expiryDate) <= 0;
};

// Calculate KPIs
export const calculateKPIs = (medicines) => {
  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter(m => m.stockStatus === 'low').length;
  const nearExpiryCount = medicines.filter(m => isNearExpiry(m.expiryDate)).length;
  const expiredCount = medicines.filter(m => isExpired(m.expiryDate)).length;

  return {
    totalMedicines,
    lowStockCount,
    nearExpiryCount,
    expiredCount,
  };
};

// Detect anomalies in uploaded data
export const detectAnomalies = (data) => {
  const anomalies = [];

  data.forEach((row, index) => {
    if (row.quantity < 0) {
      anomalies.push({
        row: index + 1,
        field: 'quantity',
        issue: 'Negative quantity detected',
      });
    }

    if (row.quantity > 100000) {
      anomalies.push({
        row: index + 1,
        field: 'quantity',
        issue: 'Unusually high stock quantity',
      });
    }

    if (new Date(row.expiryDate) < new Date()) {
      anomalies.push({
        row: index + 1,
        field: 'expiryDate',
        issue: 'Expiry date in the past',
      });
    }

    if (row.sellingPrice < row.purchasePrice) {
      anomalies.push({
        row: index + 1,
        field: 'price',
        issue: 'Selling price is less than purchase price',
      });
    }
  });

  return anomalies;
};

// Format currency
export const formatCurrency = (amount) => {
  return `₹${parseFloat(amount).toFixed(2)}`;
};

// Generate bill number
export const generateBillNumber = () => {
  return `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Calculate demand forecast (mock)
export const calculateDemandForecast = (salesData, days = 7) => {
  if (salesData.length === 0) return [];

  const avgDaily = salesData.reduce((sum, item) => sum + item.quantity, 0) / salesData.length;
  const forecast = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.ceil(avgDaily * (0.8 + Math.random() * 0.4)), // ±20% variation
      actual: null,
    });
  }

  return forecast;
};

// Classify medicine movement
export const classifyMovement = (medicineId, salesData) => {
  const medicineSales = salesData.filter(s => s.medicineId === medicineId);
  const totalSales = medicineSales.reduce((sum, s) => sum + s.quantity, 0);

  if (totalSales > 100) return 'fast_moving';
  if (totalSales < 10) return 'slow_moving';
  return 'normal';
};
