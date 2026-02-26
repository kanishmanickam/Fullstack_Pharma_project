import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getAllMedicineInv,
    getMedicineInvById,
    searchByMedicineId,
    createMedicineInv,
    updateMedicineInv,
    deleteMedicineInv,
} from '../controllers/medicineInvController.js';

const router = express.Router();

// All routes require authentication + owner/staff role
router.get('/', protect, authorize('owner', 'staff'), getAllMedicineInv);
router.get('/search', protect, authorize('owner', 'staff'), searchByMedicineId);
router.get('/:medicineId', protect, authorize('owner', 'staff'), getMedicineInvById);
router.post('/', protect, authorize('owner', 'staff'), createMedicineInv);
router.put('/:medicineId', protect, authorize('owner', 'staff'), updateMedicineInv);
router.delete('/:medicineId', protect, authorize('owner', 'staff'), deleteMedicineInv);

export default router;
