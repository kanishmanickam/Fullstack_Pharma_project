import { Medicine, Bill, InventoryHistory } from '../models/index.js';
import { calculateDemandForecast, classifyMovement } from '../utils/helpers.js';
import log from '../utils/logger.js';

// Get sales report
export const getSalesReport = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;

    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (period === 'weekly') {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      dateFilter = { createdAt: { $gte: date } };
    } else if (period === 'monthly') {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      dateFilter = { createdAt: { $gte: date } };
    } else {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: date } };
    }

    const bills = await Bill.find(dateFilter);

    const totalSales = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const totalTax = bills.reduce((sum, bill) => sum + bill.tax, 0);
    const totalSubtotal = bills.reduce((sum, bill) => sum + bill.subtotal, 0);
    const totalBills = bills.length;
    const avgBillValue = totalBills > 0 ? totalSales / totalBills : 0;

    res.status(200).json({
      success: true,
      report: {
        period: period || 'daily',
        dateRange: {
          startDate,
          endDate,
        },
        totalSales,
        totalTax,
        totalSubtotal,
        totalBills,
        avgBillValue,
        data: bills,
      },
    });
  } catch (error) {
    log('ERROR', 'Get sales report error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching sales report',
      error: error.message,
    });
  }
};

// Get purchase report
export const getPurchaseReport = async (req, res) => {
  try {
    const { period } = req.query;

    let dateFilter = {};

    if (period === 'weekly') {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      dateFilter = { createdAt: { $gte: date } };
    } else if (period === 'monthly') {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      dateFilter = { createdAt: { $gte: date } };
    } else {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: date } };
    }

    const medicines = await Medicine.find();

    const totalPurchaseValue = medicines.reduce(
      (sum, med) => sum + med.purchasePrice * med.quantity,
      0
    );
    const totalMedicines = medicines.length;
    const lowStockCount = medicines.filter(m => m.quantity <= m.reorderLevel / 2).length;

    res.status(200).json({
      success: true,
      report: {
        period: period || 'daily',
        totalPurchaseValue,
        totalMedicines,
        lowStockCount,
        medicines,
      },
    });
  } catch (error) {
    log('ERROR', 'Get purchase report error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase report',
      error: error.message,
    });
  }
};

// Get inventory report
export const getInventoryReport = async (req, res) => {
  try {
    const medicines = await Medicine.find();

    const totalValue = medicines.reduce(
      (sum, med) => sum + med.sellingPrice * med.quantity,
      0
    );
    const highStockCount = medicines.filter(m => m.stockStatus === 'high').length;
    const mediumStockCount = medicines.filter(m => m.stockStatus === 'medium').length;
    const lowStockCount = medicines.filter(m => m.stockStatus === 'low').length;

    res.status(200).json({
      success: true,
      report: {
        totalValue,
        totalMedicines: medicines.length,
        highStockCount,
        mediumStockCount,
        lowStockCount,
        medicines,
      },
    });
  } catch (error) {
    log('ERROR', 'Get inventory report error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory report',
      error: error.message,
    });
  }
};

// Get demand forecast
export const getDemandForecast = async (req, res) => {
  try {
    const { medicineId, days } = req.query;

    const history = await InventoryHistory.find({
      action: 'sale',
      ...(medicineId && { medicineId }),
    }).sort({ createdAt: -1 });

    const forecast = calculateDemandForecast(history, parseInt(days) || 7);

    res.status(200).json({
      success: true,
      forecast,
    });
  } catch (error) {
    log('ERROR', 'Get demand forecast error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching demand forecast',
      error: error.message,
    });
  }
};

// Get stock classification
export const getStockClassification = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const history = await InventoryHistory.find({ action: 'sale' });

    const fastMoving = [];
    const slowMoving = [];
    const normalMoving = [];

    medicines.forEach(med => {
      const movement = classifyMovement(med._id, history);

      const item = {
        medicineId: med._id,
        name: med.name,
        category: med.category,
        quantity: med.quantity,
        movement,
      };

      if (movement === 'fast_moving') fastMoving.push(item);
      else if (movement === 'slow_moving') slowMoving.push(item);
      else normalMoving.push(item);
    });

    res.status(200).json({
      success: true,
      classification: {
        fastMoving,
        slowMoving,
        normalMoving,
      },
    });
  } catch (error) {
    log('ERROR', 'Get stock classification error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching stock classification',
      error: error.message,
    });
  }
};

// Get dashboard summary
export const getDashboardSummary = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const bills = await Bill.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBills = await Bill.find({ createdAt: { $gte: today } });

    const summary = {
      totalMedicines: medicines.length,
      lowStockMedicines: medicines.filter(m => m.stockStatus === 'low').length,
      totalBills: bills.length,
      todaysSales: todayBills.reduce((sum, bill) => sum + bill.grandTotal, 0),
      todaysBills: todayBills.length,
      inventory: {
        high: medicines.filter(m => m.stockStatus === 'high').length,
        medium: medicines.filter(m => m.stockStatus === 'medium').length,
        low: medicines.filter(m => m.stockStatus === 'low').length,
      },
    };

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    log('ERROR', 'Get dashboard summary error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message,
    });
  }
};
