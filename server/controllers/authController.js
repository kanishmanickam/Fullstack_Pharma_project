import { User } from '../models/index.js';
import { generateToken } from '../utils/helpers.js';
import log from '../utils/logger.js';
import { createAuditEntry } from '../middleware/auditLogger.js';

// Register new user (Owner only - for adding staff)
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    // Only owner can create new users
    if (req.user && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can register new users',
        errorCode: 'OWNER_ONLY'
      });
    }

    // Validate role
    const allowedRoles = ['owner', 'staff'];
    const userRole = role || 'staff';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`,
      });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Create user (password will be hashed by pre-save hook)
    user = await User.create({
      username,
      email,
      password,
      role: userRole,
    });

    log('INFO', 'User registered successfully', { 
      userId: user._id, 
      role: user.role,
      registeredBy: req.user?.id 
    });

    res.status(201).json({
      success: true,
      message: `${userRole === 'owner' ? 'Administrator' : 'Staff member'} registered successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleDisplay: user.role === 'owner' ? 'Admin' : 'Operational Staff',
        isActive: user.isActive,
        createdAt: user.createdAt
      },
    });
  } catch (error) {
    log('ERROR', 'Registration error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    // Generate token with complete user info
    const token = generateToken(user);

    // ── Explicit audit hook: USER_LOGIN ───────────────────────
    createAuditEntry({
      userId: user._id,
      username: user.username,
      action: 'USER_LOGIN',
      module: 'System',
      details: { role: user.role },
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown',
      httpMethod: 'POST',
      endpoint: '/api/auth/login',
      statusCode: 200,
    }); // fire-and-forget

    log('INFO', 'User logged in successfully', { userId: user._id, role: user.role });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleDisplay: user.role === 'owner' ? 'Admin' : 'Operational Staff',
        isActive: user.isActive,
        permissions: getPermissionsByRole(user.role)
      },
    });
  } catch (error) {
    log('ERROR', 'Login error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Helper function to get permissions by role
function getPermissionsByRole(role) {
  if (role === 'owner') {
    return {
      canViewFinancials: true,
      canManageUsers: true,
      canApprovePurchaseOrders: true,
      canModifySettings: true,
      canAccessAllModules: true,
      canPerformBilling: true,
      canUploadExcel: true,
      canUseChatbot: true
    };
  }
  
  // Staff permissions
  return {
    canViewFinancials: false,
    canManageUsers: false,
    canApprovePurchaseOrders: false,
    canModifySettings: false,
    canAccessAllModules: false,
    canPerformBilling: true,
    canUploadExcel: true,
    canUseChatbot: true
  };
}

// Get current user with permissions
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleDisplay: user.role === 'owner' ? 'Admin' : 'Operational Staff',
        isActive: user.isActive,
        createdAt: user.createdAt,
        permissions: getPermissionsByRole(user.role)
      },
    });
  } catch (error) {
    log('ERROR', 'Get current user error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// Get all users (Owner only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithDisplayInfo = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      roleDisplay: user.role === 'owner' ? 'Admin' : 'Operational Staff',
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      users: usersWithDisplayInfo,
    });
  } catch (error) {
    log('ERROR', 'Get all users error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// Update user (Owner only, with restrictions)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive, password } = req.body;

    // Prevent staff from modifying users
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can modify user accounts',
        errorCode: 'OWNER_ONLY'
      });
    }

    // Prevent owner from demoting themselves
    if (id === req.user.id && role && role !== 'owner') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    // If password is being updated, hash it
    if (password) {
      const bcryptjs = await import('bcryptjs');
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    log('INFO', 'User updated', { 
      updatedUserId: id,
      updatedBy: req.user.id,
      changes: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleDisplay: user.role === 'owner' ? 'Admin' : 'Operational Staff',
        isActive: user.isActive,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    log('ERROR', 'Update user error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

// Delete user (Owner only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    log('INFO', 'User deleted', { 
      deletedUserId: id,
      deletedBy: req.user.id,
      deletedUsername: user.username
    });

    res.status(200).json({
      success: true,
      message: `User ${user.username} deleted successfully`,
    });
  } catch (error) {
    log('ERROR', 'Delete user error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};
