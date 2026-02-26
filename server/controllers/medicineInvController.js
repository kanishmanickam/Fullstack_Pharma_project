import { MedicineInventory, Supplier } from '../models/index.js';
import log from '../utils/logger.js';

// Get all medicine inventory records
export const getAllMedicineInv = async (req, res) => {
    try {
        const medicines = await MedicineInventory.find().populate('supplierId', 'name contact');
        res.status(200).json({ success: true, count: medicines.length, medicines });
    } catch (error) {
        log('ERROR', 'Get all medicine inventory error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error fetching medicine inventory', error: error.message });
    }
};

// Get single medicine inventory by medicineId (user-entered string PK)
export const getMedicineInvById = async (req, res) => {
    try {
        const medicine = await MedicineInventory.findOne({ medicineId: req.params.medicineId }).populate('supplierId', 'name contact');
        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }
        res.status(200).json({ success: true, medicine });
    } catch (error) {
        log('ERROR', 'Get medicine inventory error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error fetching medicine', error: error.message });
    }
};

// Search by medicineId
export const searchByMedicineId = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }
        const medicines = await MedicineInventory.find({
            medicineId: { $regex: query, $options: 'i' },
        }).populate('supplierId', 'name contact');
        res.status(200).json({ success: true, count: medicines.length, medicines });
    } catch (error) {
        log('ERROR', 'Search medicine inventory error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error searching medicines', error: error.message });
    }
};

// Create medicine inventory record
export const createMedicineInv = async (req, res) => {
    try {
        const { medicineId, name, category, unitPrice, stockQuantity, expiryDate, supplierId } = req.body;

        if (!medicineId || !name || !category || !unitPrice || stockQuantity === undefined || !expiryDate || !supplierId) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Verify supplier exists
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return res.status(400).json({ success: false, message: 'Invalid Supplier ID' });
        }

        // Check for duplicate medicineId
        const existing = await MedicineInventory.findOne({ medicineId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Medicine ID already exists' });
        }

        const medicine = await MedicineInventory.create({
            medicineId, name, category, unitPrice, stockQuantity, expiryDate, supplierId,
        });

        const populated = await medicine.populate('supplierId', 'name contact');
        log('INFO', 'Medicine inventory created', { medicineId });
        res.status(201).json({ success: true, message: 'Medicine created successfully', medicine: populated });
    } catch (error) {
        log('ERROR', 'Create medicine inventory error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error creating medicine', error: error.message });
    }
};

// Update medicine inventory record by medicineId
export const updateMedicineInv = async (req, res) => {
    try {
        const { medicineId } = req.params;
        const updates = req.body;

        // If supplierId is being updated, verify it exists
        if (updates.supplierId) {
            const supplier = await Supplier.findById(updates.supplierId);
            if (!supplier) {
                return res.status(400).json({ success: false, message: 'Invalid Supplier ID' });
            }
        }

        const medicine = await MedicineInventory.findOneAndUpdate(
            { medicineId },
            updates,
            { new: true, runValidators: true }
        ).populate('supplierId', 'name contact');

        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        log('INFO', 'Medicine inventory updated', { medicineId });
        res.status(200).json({ success: true, message: 'Medicine updated successfully', medicine });
    } catch (error) {
        log('ERROR', 'Update medicine inventory error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error updating medicine', error: error.message });
    }
};

// Delete medicine inventory record by medicineId
export const deleteMedicineInv = async (req, res) => {
    try {
        const { medicineId } = req.params;
        const medicine = await MedicineInventory.findOneAndDelete({ medicineId });

        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        log('INFO', 'Medicine inventory deleted', { medicineId });
        res.status(200).json({ success: true, message: 'Medicine deleted successfully' });
    } catch (error) {
        log('ERROR', 'Delete medicine inventory error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error deleting medicine', error: error.message });
    }
};
