import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createSupplier,
  getAllSuppliers,
  updateSupplier,
  generateReorderSuggestions,
  getReorderSuggestions,
  createPurchaseOrder,
  getAllPurchaseOrders,
  updatePurchaseOrderStatus,
} from '../controllers/supplierController.js';

const router = express.Router();

// Supplier routes (Owner/Staff only)
router.post('/suppliers', protect, authorize('owner', 'staff'), createSupplier);
router.get('/suppliers', protect, authorize('owner', 'staff'), getAllSuppliers);
router.put('/suppliers/:id', protect, authorize('owner', 'staff'), updateSupplier);

// Reorder suggestion routes
router.post('/reorder/generate', protect, authorize('owner', 'staff'), generateReorderSuggestions);
router.get('/reorder/suggestions', protect, authorize('owner', 'staff'), getReorderSuggestions);

// Purchase order routes
router.post('/purchase-orders', protect, authorize('owner', 'staff'), createPurchaseOrder);
router.get('/purchase-orders', protect, authorize('owner', 'staff'), getAllPurchaseOrders);
router.put('/purchase-orders/:id', protect, authorize('owner', 'staff'), updatePurchaseOrderStatus);

// Legacy routes for backwards compatibility
router.get('/', protect, getAllSuppliers);
router.post('/', protect, authorize('owner', 'staff'), createSupplier);

export default router;
