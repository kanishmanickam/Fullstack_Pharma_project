import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { Supplier } from '../models/index.js';
import log from '../utils/logger.js';

const router = express.Router();

// GET all suppliers
router.get('/', protect, async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ name: 1 });
        res.status(200).json({ success: true, count: suppliers.length, suppliers });
    } catch (error) {
        log('ERROR', 'Get suppliers error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error fetching suppliers', error: error.message });
    }
});

// POST create supplier
router.post('/', protect, authorize('owner', 'staff'), async (req, res) => {
    try {
        const { name, contact } = req.body;
        if (!name || !contact) {
            return res.status(400).json({ success: false, message: 'Name and contact are required' });
        }
        const supplier = await Supplier.create({ name, contact });
        res.status(201).json({ success: true, message: 'Supplier created', supplier });
    } catch (error) {
        log('ERROR', 'Create supplier error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error creating supplier', error: error.message });
    }
});

export default router;
