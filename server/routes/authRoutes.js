import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/users', protect, authorize('owner'), getAllUsers);
router.put('/users/:id', protect, authorize('owner'), updateUser);
router.delete('/users/:id', protect, authorize('owner'), deleteUser);

export default router;
