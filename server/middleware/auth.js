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
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route',
      errorCode: 'INVALID_TOKEN' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
      email: decoded.email
    };
    log('INFO', 'Token verified', { userId: decoded.id, role: decoded.role });
    next();
  } catch (error) {
    log('ERROR', 'Token verification failed', { error: error.message });
    return res.status(401).json({ 
      success: false, 
      message: 'Token is not valid or expired',
      errorCode: 'INVALID_TOKEN' 
    });
  }
};

// Role-based authorization with clinic-specific logic
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      log('WARN', 'User not authenticated', { path: req.path });
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated',
        errorCode: 'NOT_AUTHENTICATED' 
      });
    }

    // Owner has access to everything
    if (req.user.role === 'owner') {
      log('INFO', 'Owner access granted', { 
        userId: req.user.id, 
        path: req.path 
      });
      return next();
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      log('WARN', 'Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        message: `Access denied. Your role (${getRoleDisplayName(req.user.role)}) is not authorized to access this resource.`,
        errorCode: 'UNAUTHORIZED_ACCESS',
        requiredRoles: roles.map(getRoleDisplayName)
      });
    }

    log('INFO', 'Role authorization successful', { 
      userId: req.user.id, 
      role: req.user.role,
      path: req.path 
    });
    next();
  };
};

// Restrict staff from specific sensitive routes
export const restrictStaffFrom = (...restrictedActions) => {
  return (req, res, next) => {
    // Owner can access everything
    if (req.user.role === 'owner') {
      return next();
    }

    // Check if staff is trying to access restricted action
    if (req.user.role === 'staff') {
      const currentAction = req.path + ':' + req.method;
      
      const isRestricted = restrictedActions.some(action => {
        if (typeof action === 'string') {
          return req.path.includes(action);
        }
        return action.path === req.path && action.method === req.method;
      });

      if (isRestricted) {
        log('WARN', 'Staff access restricted', {
          userId: req.user.id,
          path: req.path,
          method: req.method,
        });
        return res.status(403).json({
          success: false,
          message: 'Operational staff are not authorized to perform this action. Please contact the administrator.',
          errorCode: 'STAFF_RESTRICTED'
        });
      }
    }

    next();
  };
};

// Owner-only middleware for sensitive operations
export const ownerOnly = (req, res, next) => {
  if (req.user.role !== 'owner') {
    log('WARN', 'Owner-only access attempt by non-owner', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path,
    });
    return res.status(403).json({
      success: false,
      message: 'This action requires administrator (owner) privileges.',
      errorCode: 'OWNER_ONLY'
    });
  }
  next();
};

// Helper to map internal roles to display names
function getRoleDisplayName(role) {
  const roleMap = {
    'owner': 'Admin',
    'staff': 'Operational Staff'
  };
  return roleMap[role] || role;
}

// Middleware to stamp user action for audit logging
export const stampUserAction = (req, res, next) => {
  if (req.user) {
    req.auditData = {
      performedBy: req.user.id,
      performedByRole: req.user.role,
      performedByUsername: req.user.username,
      action: `${req.method} ${req.path}`,
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress
    };
  }
  next();
};
