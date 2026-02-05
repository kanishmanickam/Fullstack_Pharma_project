import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  generateAlerts,
  getAllAlerts,
  getCriticalAlerts,
  resolveAlert,
  getMedicineRecommendations,
} from '../controllers/alertController.js';

const router = express.Router();

// All routes require authentication
router.get('/', protect, getAllAlerts);
router.get('/critical', protect, getCriticalAlerts);
router.get('/recommendations', protect, getMedicineRecommendations);
router.post('/generate', protect, authorize('owner', 'staff'), generateAlerts);
router.put('/:id/resolve', protect, authorize('owner', 'staff'), resolveAlert);

export default router;
