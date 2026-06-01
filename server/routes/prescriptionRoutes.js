/**
 * @file Handles upload and management of customer prescriptions.
 * @module routes/prescription
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import {
  uploadPrescription,
  getAllPrescriptions,
  getCustomerPrescriptions,
  getPrescriptionById,
  reviewPrescription,
  deletePrescription,
  getPrescriptionStats,
} from '../controllers/prescriptionController.js';

const router = express.Router();

// Configures multer storage for prescription files.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/prescriptions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filters uploaded files to allow only images and PDFs.
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Routes
router.post('/upload', protect, upload.single('prescription'), uploadPrescription);
router.get('/', protect, getAllPrescriptions);
router.get('/stats', protect, getPrescriptionStats);
router.get('/customer/:customerId', protect, getCustomerPrescriptions);
router.get('/:id', protect, getPrescriptionById);
router.put('/:id/review', protect, authorize('owner'), reviewPrescription); // Owner only
router.delete('/:id', protect, authorize('owner'), deletePrescription);

export default router;
