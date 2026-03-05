import express from 'express';
import { getCategories, createCategory, approveCategory } from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, getCategories)
    .post(protect, authorize('owner', 'staff'), createCategory);

router.route('/:id/approve')
    .patch(protect, authorize('owner'), approveCategory);

export default router;
