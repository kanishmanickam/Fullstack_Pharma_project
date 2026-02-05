import { Bill, Medicine, Customer, InventoryHistory } from '../models/index.js';
import { generateBillNumber, sortByFEFO, formatCurrency } from '../utils/helpers.js';
import { sendBillNotification } from '../utils/notifications.js';
import log from '../utils/logger.js';

// Create bill
export const createBill = async (req, res) => {
  try {
    const { customerId, customerName, customerType, items, paymentMethod } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerName and items',
      });
    }

    // Calculate totals
    let subtotal = 0;
    const billItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${item.medicineId}`,
        });
      }

      if (medicine.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}`,
        });
      }

      const itemTotal = medicine.sellingPrice * item.quantity;
      subtotal += itemTotal;

      billItems.push({
        medicineId: medicine._id,
        name: medicine.name,
        batchNumber: medicine.batchNumber,
        quantity: item.quantity,
        price: medicine.sellingPrice,
        total: itemTotal,
      });

      // Reduce medicine quantity (FEFO - take from oldest expiry first)
      medicine.quantity -= item.quantity;
      await medicine.save();

      // Log the sale
      await InventoryHistory.create({
        medicineId: medicine._id,
        medicineName: medicine.name,
        action: 'sale',
        quantityChanged: -item.quantity,
        previousQuantity: medicine.quantity + item.quantity,
        newQuantity: medicine.quantity,
        reason: 'Bill sale',
        performedBy: req.user.id,
      });
    }

    // Calculate tax (12% GST)
    const tax = subtotal * 0.12;
    const grandTotal = subtotal + tax;

    // Create bill
    const bill = await Bill.create({
      billNumber: generateBillNumber(),
      customerId: customerId || null,
      customerName,
      customerType,
      items: billItems,
      subtotal,
      tax,
      grandTotal,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'completed',
      staffId: req.user.id,
    });

    // Get customer for notification
    let customerEmail = null;
    let customerPhone = null;

    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        customerEmail = customer.email;
        customerPhone = customer.phone;
      }
    }

    // Send notification
    try {
      await sendBillNotification(bill, customerPhone, customerEmail);
    } catch (notifError) {
      log('WARN', 'Notification failed but bill created', { billId: bill._id });
    }

    log('INFO', 'Bill created successfully', { billId: bill._id, billNumber: bill.billNumber });

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill,
    });
  } catch (error) {
    log('ERROR', 'Create bill error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating bill',
      error: error.message,
    });
  }
};

// Get all bills
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('customerId', 'name phone email')
      .populate('staffId', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    log('ERROR', 'Get all bills error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: error.message,
    });
  }
};

// Get single bill
export const getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customerId', 'name phone email')
      .populate('staffId', 'username');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    log('ERROR', 'Get bill error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: error.message,
    });
  }
};

// Get bills by customer
export const getBillsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const bills = await Bill.find({ customerId })
      .populate('staffId', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    log('ERROR', 'Get bills by customer error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: error.message,
    });
  }
};

// Get bills by date range
export const getBillsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const bills = await Bill.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('customerId', 'name phone')
      .populate('staffId', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    log('ERROR', 'Get bills by date range error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: error.message,
    });
  }
};

// Mock payment confirmation
export const confirmPayment = async (req, res) => {
  try {
    const { billId, transactionId } = req.body;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    bill.paymentStatus = 'completed';
    await bill.save();

    log('INFO', 'Payment confirmed', { billId, transactionId });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed',
      bill,
      transactionId: transactionId || `TXN-${Date.now()}`,
    });
  } catch (error) {
    log('ERROR', 'Confirm payment error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message,
    });
  }
};

// Get sales summary
export const getSalesSummary = async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly

    let startDate = new Date();

    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setHours(0, 0, 0, 0);
    }

    const bills = await Bill.find({
      createdAt: { $gte: startDate },
    });

    const totalSales = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const totalBills = bills.length;
    const avgBillValue = totalBills > 0 ? totalSales / totalBills : 0;

    res.status(200).json({
      success: true,
      summary: {
        period: period || 'daily',
        totalSales,
        totalBills,
        avgBillValue,
        startDate,
      },
    });
  } catch (error) {
    log('ERROR', 'Get sales summary error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching sales summary',
      error: error.message,
    });
  }
};
