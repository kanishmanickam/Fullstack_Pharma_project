import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  getLowStockMedicines,
  getNearExpiryMedicines,
  getExpiredMedicines,
  adjustQuantity,
  getInventoryHistory,
} from '../controllers/inventoryController.js';

const router = express.Router();

// Protected routes - all inventory routes require authentication
router.get('/', protect, getAllMedicines);
router.get('/search', protect, searchMedicines);
router.get('/low-stock', protect, getLowStockMedicines);
router.get('/near-expiry', protect, getNearExpiryMedicines);
router.get('/expired', protect, getExpiredMedicines);
router.get('/history', protect, authorize('owner', 'staff'), getInventoryHistory);
router.get('/:id', protect, getMedicine);

// Owner and Staff only
router.post('/', protect, authorize('owner', 'staff'), createMedicine);
router.put('/:id', protect, authorize('owner', 'staff'), updateMedicine);
router.delete('/:id', protect, authorize('owner'), deleteMedicine);
router.post('/:id/adjust-quantity', protect, authorize('owner', 'staff'), adjustQuantity);

export default router;
