import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/fileUpload.js';
import {
  uploadExcel,
  getUploadHistory,
  getUploadLog,
  exportExcel,
} from '../controllers/uploadController.js';

const router = express.Router();

// All routes require authentication
router.post('/excel', protect, authorize('owner', 'staff'), upload.single('file'), uploadExcel);
router.get('/', protect, getUploadHistory);
router.get('/export', protect, exportExcel);
router.get('/:id', protect, getUploadLog);

export default router;
