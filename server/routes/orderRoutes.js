/**
 * @file Handles routing and authorization for order-related operations.
 * @module routes/order
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createOrder,
  getAllOrders,
  getCustomerOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats,
} from '../controllers/orderController.js';

const router = express.Router();

// Routes
router.post('/', protect, authorize('owner', 'staff'), createOrder);
router.get('/', protect, authorize('owner', 'staff'), getAllOrders);
router.get('/stats', protect, authorize('owner', 'staff'), getOrderStats);
router.get('/customer/:customerId', protect, authorize('owner', 'staff'), getCustomerOrders);
router.get('/:id', protect, authorize('owner', 'staff'), getOrderById);
router.put('/:id/status', protect, authorize('owner', 'staff'), updateOrderStatus);
router.put('/:id/payment', protect, authorize('owner', 'staff'), updatePaymentStatus);

export default router;
