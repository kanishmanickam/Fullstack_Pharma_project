import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import log from './utils/logger.js';
import { errorHandler, notFound, requestLogger } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
await connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  log('INFO', `Server running on port ${PORT}`);
  console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║   MediStock Backend Server Started Successfully   ║
    ╠═══════════════════════════════════════════════════╣
    ║ API Server:  http://localhost:${PORT}                  ║
    ║ Health:      http://localhost:${PORT}/api/health       ║
    ║ Environment: ${process.env.NODE_ENV || 'development'             }       ║
    ║ Database:    ${process.env.MONGODB_URI || 'Not configured'} ║
    ╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
