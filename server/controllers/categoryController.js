import { Medicine } from '../models/index.js';
import log from '../utils/logger.js';
import { createAuditEntry } from '../middleware/auditLogger.js';

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Medicine.distinct('category');

        const formattedCategories = categories.filter(Boolean).map(name => ({
            _id: name,
            name: name,
            isApproved: true
        })).sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json({
            success: true,
            count: formattedCategories.length,
            categories: formattedCategories,
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

// Create a new category 
export const createCategory = async (req, res) => {
    res.status(201).json({
        success: true,
        message: 'Category will be created automatically when a Medicine is assigned to it.',
        category: { name: req.body.name, _id: req.body.name, isApproved: true }
    });
};

// Approve an anomalous category
export const approveCategory = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Categories no longer require approval',
    });
};
