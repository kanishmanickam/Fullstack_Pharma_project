import express from 'express';
import { protect } from '../middleware/auth.js';
import { chatbotQuery } from '../controllers/chatbotController.js';

const router = express.Router();

// Chatbot routes - requires authentication
router.post('/query', protect, chatbotQuery);

export default router;
