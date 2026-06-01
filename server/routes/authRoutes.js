/**
 * @file Handles routing and authentication for user accounts.
 * @module routes/auth
 */

import express from 'express';
import { protect, ownerOnly, stampUserAction } from '../middleware/auth.js';
import {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser,
  setup2FA,
  verify2FASetup,
  verify2FALogin
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/login/verify-2fa', verify2FALogin);

// Protected routes - User registration requires owner authentication
router.post('/register', protect, ownerOnly, stampUserAction, register);

// User profile and management
router.get('/me', protect, getCurrentUser);
router.get('/users', protect, ownerOnly, getAllUsers);
router.put('/users/:id', protect, ownerOnly, stampUserAction, updateUser);
router.delete('/users/:id', protect, ownerOnly, stampUserAction, deleteUser);

// 2FA routes
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify-setup', protect, verify2FASetup);

export default router;
