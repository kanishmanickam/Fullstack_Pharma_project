import { Category } from '../models/index.js';
import log from '../utils/logger.js';
import { createAuditEntry } from '../middleware/auditLogger.js';

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const { isApproved } = req.query;
        let query = {};
        if (isApproved !== undefined) {
            query.isApproved = isApproved === 'true';
        }

        const categories = await Category.find(query).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        log('ERROR', 'Get categories error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message,
        });
    }
};

// Create a new category (Manual)
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists',
            });
        }

        const category = await Category.create({
            name,
            description,
            isApproved: true, // Manually created categories are approved by default
        });

        log('INFO', 'Category created', { categoryId: category._id, name: category.name });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category,
        });
    } catch (error) {
        log('ERROR', 'Create category error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message,
        });
    }
};

// Approve an anomalous category
export const approveCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        category.isApproved = true;
        await category.save();

        // Explicit Audit hook for approval
        createAuditEntry({
            userId: req.user?.id,
            username: req.user?.username,
            action: 'CATEGORY_APPROVE',
            module: 'Category Management',
            details: {
                categoryId: category._id,
                categoryName: category.name,
                message: 'Admin approved anomalous imported category',
            },
            ipAddress: req.ip,
            httpMethod: req.method,
            endpoint: req.originalUrl,
            statusCode: 200,
        });

        log('INFO', 'Category approved', { categoryId: category._id, approvedBy: req.user.id });

        res.status(200).json({
            success: true,
            message: 'Category approved successfully',
            category,
        });
    } catch (error) {
        log('ERROR', 'Approve category error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error approving category',
            error: error.message,
        });
    }
};
