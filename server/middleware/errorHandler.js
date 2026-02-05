import log from '../utils/logger.js';

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  log('ERROR', 'API Error', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
  });

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found middleware
export const notFound = (req, res, next) => {
  log('WARN', 'Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  log('INFO', `${req.method} ${req.path}`, {
    userId: req.user?.id,
    userRole: req.user?.role,
  });
  next();
};
