import {
  Medicine,
  InventoryHistory,
  Alert,
} from '../models/index.js';
import {
  sortByFEFO,
  isNearExpiry,
  isExpired,
  getStockStatus,
} from '../utils/helpers.js';
import log from '../utils/logger.js';

// Get all medicines
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const sortedMedicines = sortByFEFO(medicines);

    res.status(200).json({
      success: true,
      count: sortedMedicines.length,
      medicines: sortedMedicines,
    });
  } catch (error) {
    log('ERROR', 'Get all medicines error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching medicines',
      error: error.message,
    });
  }
};

// Get single medicine
export const getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    res.status(200).json({
      success: true,
      medicine,
    });
  } catch (error) {
    log('ERROR', 'Get medicine error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine',
      error: error.message,
    });
  }
};

// Create medicine
export const createMedicine = async (req, res) => {
  try {
    const {
      name,
      category,
      batchNumber,
      expiryDate,
      quantity,
      purchasePrice,
      sellingPrice,
      rackNumber,
      reorderLevel,
      supplier,
    } = req.body;

    if (!name || !category || !batchNumber || !expiryDate || !purchasePrice || !sellingPrice || !rackNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const stockStatus = getStockStatus(quantity, reorderLevel || 50);

    const medicine = await Medicine.create({
      name,
      category,
      batchNumber,
      expiryDate,
      quantity,
      purchasePrice,
      sellingPrice,
      rackNumber,
      reorderLevel: reorderLevel || 50,
      stockStatus,
      supplier: supplier || 'Default Supplier',
    });

    log('INFO', 'Medicine created', { medicineId: medicine._id, name });

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      medicine,
    });
  } catch (error) {
    log('ERROR', 'Create medicine error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating medicine',
      error: error.message,
    });
  }
};

// Update medicine
export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const medicine = await Medicine.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Update stock status if quantity changed
    if (updates.quantity !== undefined) {
      medicine.stockStatus = getStockStatus(medicine.quantity, medicine.reorderLevel);
      await medicine.save();
    }

    log('INFO', 'Medicine updated', { medicineId: id });

    res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      medicine,
    });
  } catch (error) {
    log('ERROR', 'Update medicine error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error updating medicine',
      error: error.message,
    });
  }
};

// Delete medicine
export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findByIdAndDelete(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    log('INFO', 'Medicine deleted', { medicineId: id });

    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully',
    });
  } catch (error) {
    log('ERROR', 'Delete medicine error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error deleting medicine',
      error: error.message,
    });
  }
};

// Search medicines
export const searchMedicines = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { batchNumber: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines: sortByFEFO(medicines),
    });
  } catch (error) {
    log('ERROR', 'Search medicines error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error searching medicines',
      error: error.message,
    });
  }
};

// Get low stock medicines
export const getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    });

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines: sortByFEFO(medicines),
    });
  } catch (error) {
    log('ERROR', 'Get low stock medicines error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock medicines',
      error: error.message,
    });
  }
};

// Get near expiry medicines (within 7 days)
export const getNearExpiryMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const nearExpiryMedicines = medicines.filter(m => isNearExpiry(m.expiryDate, 7));

    res.status(200).json({
      success: true,
      count: nearExpiryMedicines.length,
      medicines: sortByFEFO(nearExpiryMedicines),
    });
  } catch (error) {
    log('ERROR', 'Get near expiry medicines error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching near expiry medicines',
      error: error.message,
    });
  }
};

// Get expired medicines
export const getExpiredMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const expiredMedicines = medicines.filter(m => isExpired(m.expiryDate));

    res.status(200).json({
      success: true,
      count: expiredMedicines.length,
      medicines: expiredMedicines,
    });
  } catch (error) {
    log('ERROR', 'Get expired medicines error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching expired medicines',
      error: error.message,
    });
  }
};

// Adjust medicine quantity
export const adjustQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChanged, reason } = req.body;

    if (!quantityChanged) {
      return res.status(400).json({
        success: false,
        message: 'quantityChanged is required',
      });
    }

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    const previousQuantity = medicine.quantity;
    medicine.quantity += quantityChanged;

    if (medicine.quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity',
      });
    }

    medicine.stockStatus = getStockStatus(medicine.quantity, medicine.reorderLevel);
    await medicine.save();

    // Log the adjustment
    await InventoryHistory.create({
      medicineId: id,
      medicineName: medicine.name,
      action: 'adjustment',
      quantityChanged,
      previousQuantity,
      newQuantity: medicine.quantity,
      reason,
      performedBy: req.user.id,
    });

    log('INFO', 'Inventory adjusted', { medicineId: id, quantityChanged });

    res.status(200).json({
      success: true,
      message: 'Quantity adjusted successfully',
      medicine,
    });
  } catch (error) {
    log('ERROR', 'Adjust quantity error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error adjusting quantity',
      error: error.message,
    });
  }
};

// Get inventory history
export const getInventoryHistory = async (req, res) => {
  try {
    const { medicineId, action } = req.query;
    const filter = {};

    if (medicineId) filter.medicineId = medicineId;
    if (action) filter.action = action;

    const history = await InventoryHistory.find(filter)
      .populate('medicineId', 'name category')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    log('ERROR', 'Get inventory history error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory history',
      error: error.message,
    });
  }
};
