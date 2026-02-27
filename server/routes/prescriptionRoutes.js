// Prescription Routes

import express from 'express';
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

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/prescriptions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only images and PDFs
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
router.post('/upload', upload.single('prescription'), uploadPrescription);
router.get('/', getAllPrescriptions);
router.get('/stats', getPrescriptionStats);
router.get('/customer/:customerId', getCustomerPrescriptions);
router.get('/:id', getPrescriptionById);
router.put('/:id/review', reviewPrescription); // Owner only
router.delete('/:id', deletePrescription);

export default router;
