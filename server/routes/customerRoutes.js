import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerStats,
} from '../controllers/customerController.js';

const router = express.Router();

// All routes require authentication
router.get('/', protect, getAllCustomers);
router.get('/stats', protect, getCustomerStats);
router.get('/search', protect, searchCustomers);
router.get('/:id', protect, getCustomer);

// Staff and Owner can create/update/delete
router.post('/', protect, authorize('owner', 'staff'), createCustomer);
router.put('/:id', protect, authorize('owner', 'staff'), updateCustomer);
router.delete('/:id', protect, authorize('owner'), deleteCustomer);

export default router;
