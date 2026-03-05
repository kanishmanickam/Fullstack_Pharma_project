import express from 'express';
import { protect, ownerOnly, restrictStaffFrom } from '../middleware/auth.js';
import {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getDemandForecast,
  getStockClassification,
  getDashboardSummary,
  getDashboardAnalytics,
} from '../controllers/reportController.js';

const router = express.Router();

// Dashboard - All authenticated users
router.get('/dashboard/summary', protect, getDashboardSummary);

// Dashboard analytics - Owner only (contains financial data)
router.get('/dashboard/analytics', protect, ownerOnly, getDashboardAnalytics);

// Financial reports - Owner only
router.get('/sales', protect, ownerOnly, getSalesReport);
router.get('/purchase', protect, ownerOnly, getPurchaseReport);

// Inventory reports - All staff can view
router.get('/inventory', protect, getInventoryReport);
router.get('/forecast', protect, getDemandForecast);
router.get('/demand', protect, getDemandForecast);
router.get('/classification', protect, getStockClassification);

export default router;

