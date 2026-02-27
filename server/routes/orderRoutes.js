// Order Routes

import express from 'express';
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
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/stats', getOrderStats);
router.get('/customer/:customerId', getCustomerOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment', updatePaymentStatus);

export default router;
