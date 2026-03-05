import express from 'express';
import { protect, authorize, ownerOnly, stampUserAction } from '../middleware/auth.js';
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
router.post('/login', login);

// Protected routes - User registration requires owner authentication
router.post('/register', protect, ownerOnly, stampUserAction, register);

// User profile and management
router.get('/me', protect, getCurrentUser);
router.get('/users', protect, ownerOnly, getAllUsers);
router.put('/users/:id', protect, ownerOnly, stampUserAction, updateUser);
router.delete('/users/:id', protect, ownerOnly, stampUserAction, deleteUser);

export default router;
