import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createBill,
  getAllBills,
  getBill,
  getBillsByCustomer,
  getBillsByDateRange,
  confirmPayment,
  getSalesSummary,
} from '../controllers/billingController.js';

const router = express.Router();

// All billing routes require authentication
router.get('/', protect, getAllBills);
router.get('/summary', protect, getSalesSummary);
router.get('/date-range', protect, getBillsByDateRange);
router.get('/:id', protect, getBill);

// Customer bills
router.get('/customer/:customerId', protect, getBillsByCustomer);

// Staff and Owner only
router.post('/', protect, authorize('owner', 'staff'), createBill);
router.post('/payment/confirm', protect, authorize('owner', 'staff'), confirmPayment);

export default router;
