// Utility functions for MediStock AI

/**
 * Calculate days until expiry
 */
export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get expiry status with color coding
 */
export const getExpiryStatus = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  
  if (days < 0) {
    return { status: 'expired', color: 'red', label: 'Expired', days };
  } else if (days <= 30) {
    return { status: 'critical', color: 'red', label: 'Expires Soon', days };
  } else if (days <= 90) {
    return { status: 'warning', color: 'yellow', label: 'Near Expiry', days };
  }
  return { status: 'good', color: 'green', label: 'Good', days };
};

/**
 * Get stock status based on quantity and reorder level
 */
export const getStockStatus = (quantity, reorderLevel) => {
  if (quantity === 0) {
    return { status: 'out', color: 'red', label: 'Out of Stock' };
  } else if (quantity <= reorderLevel) {
    return { status: 'low', color: 'red', label: 'Low Stock' };
  } else if (quantity <= reorderLevel * 1.5) {
    return { status: 'medium', color: 'yellow', label: 'Medium Stock' };
  }
  return { status: 'high', color: 'green', label: 'Over Stock' };
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Sort medicines by FEFO (First Expiry First Out)
 */
export const sortByFEFO = (medicines) => {
  return [...medicines].sort((a, b) => {
    return new Date(a.expiryDate) - new Date(b.expiryDate);
  });
};

/**
 * Filter medicines by search query
 */
export const filterMedicines = (medicines, searchQuery) => {
  if (!searchQuery) return medicines;
  
  const query = searchQuery.toLowerCase();
  return medicines.filter(med => 
    med.name.toLowerCase().includes(query) ||
    med.category.toLowerCase().includes(query) ||
    med.batchNumber.toLowerCase().includes(query) ||
    med.rackNumber.toLowerCase().includes(query)
  );
};

/**
 * Get dashboard KPIs
 */
export const calculateKPIs = (medicines) => {
  const total = medicines.length;
  const lowStock = medicines.filter(m => getStockStatus(m.quantity, m.reorderLevel).status === 'low').length;
  const nearExpiry = medicines.filter(m => {
    const status = getExpiryStatus(m.expiryDate);
    return status.status === 'critical' || status.status === 'warning';
  }).length;
  const expired = medicines.filter(m => getExpiryStatus(m.expiryDate).status === 'expired').length;
  
  return { total, lowStock, nearExpiry, expired };
};

/**
 * Generate bill number
 */
export const generateBillNumber = () => {
  const timestamp = Date.now();
  return `BILL${timestamp.toString().slice(-6)}`;
};

/**
 * Calculate bill totals
 */
export const calculateBillTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
};
