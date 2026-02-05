import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getDemandForecast,
  getStockClassification,
  getDashboardSummary,
} from '../controllers/reportController.js';

const router = express.Router();

// All routes require authentication
router.get('/dashboard/summary', protect, getDashboardSummary);
router.get('/sales', protect, getSalesReport);
router.get('/purchase', protect, getPurchaseReport);
router.get('/inventory', protect, getInventoryReport);
router.get('/forecast', protect, getDemandForecast);
router.get('/classification', protect, getStockClassification);

export default router;
