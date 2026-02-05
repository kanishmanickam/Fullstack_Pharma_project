import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import log from '../utils/logger.js';

dotenv.config();

// Protect routes - verify JWT token
export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    log('WARN', 'No token provided for protected route', { path: req.path });
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    log('INFO', 'Token verified', { userId: decoded.id, role: decoded.role });
    next();
  } catch (error) {
    log('ERROR', 'Token verification failed', { error: error.message });
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      log('WARN', 'User not authenticated', { path: req.path });
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      log('WARN', 'Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};
