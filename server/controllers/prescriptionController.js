// Prescription Controller

import { Prescription } from '../models/prescriptionModel.js';
import { User } from '../models/userModel.js';
import { sendEmailNotification } from '../utils/notifications.js';

// Upload prescription
export const uploadPrescription = async (req, res) => {
  try {
    const { customerId, customerName, customerPhone } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Prescription file is required' });
    }

    const prescription = new Prescription({
      customerId,
      customerName,
      customerPhone,
      prescriptionFile: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'pending',
    });

    await prescription.save();

    // Notify owner about new prescription
    const owner = await User.findOne({ role: 'owner' });
    if (owner) {
      await sendEmailNotification(
        owner.email,
        'New Prescription Uploaded',
        `A new prescription has been uploaded by ${customerName}. Please review it in your dashboard.`
      );
    }

    res.status(201).json({
      message: 'Prescription uploaded successfully',
      prescription,
    });
  } catch (error) {
    console.error('Upload prescription error:', error);
    res.status(500).json({ message: 'Failed to upload prescription', error: error.message });
  }
};

// Get all prescriptions (owner/staff)
export const getAllPrescriptions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const prescriptions = await Prescription.find(filter)
      .populate('customerId', 'name phone email')
      .populate('reviewedBy', 'username')
      .sort({ uploadDate: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions', error: error.message });
  }
};

// Get customer's prescriptions
export const getCustomerPrescriptions = async (req, res) => {
  try {
    const { customerId } = req.params;

    const prescriptions = await Prescription.find({ customerId })
      .populate('reviewedBy', 'username')
      .sort({ uploadDate: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get customer prescriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions', error: error.message });
  }
};

// Get single prescription
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate('customerId', 'name phone email')
      .populate('reviewedBy', 'username');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ message: 'Failed to fetch prescription', error: error.message });
  }
};

// Approve/Reject prescription (owner only)
export const reviewPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, prescribedMedicines } = req.body;
    const reviewerId = req.user.id; // From auth middleware

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const prescription = await Prescription.findById(id).populate('customerId');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.status = status;
    prescription.reviewedBy = reviewerId;
    prescription.reviewDate = new Date();
    prescription.reviewNotes = reviewNotes;

    if (status === 'approved' && prescribedMedicines) {
      prescription.prescribedMedicines = prescribedMedicines;
    }

    await prescription.save();

    // Notify customer
    const customer = prescription.customerId;
    if (customer && customer.email) {
      const subject = status === 'approved'
        ? 'Prescription Approved'
        : 'Prescription Rejected';
      const message = status === 'approved'
        ? `Your prescription has been approved. ${reviewNotes || 'You can now place your order.'}`
        : `Your prescription has been rejected. ${reviewNotes || 'Please contact us for more information.'}`;

      await sendEmailNotification(customer.email, subject, message);
    }

    res.json({
      message: `Prescription ${status} successfully`,
      prescription,
    });
  } catch (error) {
    console.error('Review prescription error:', error);
    res.status(500).json({ message: 'Failed to review prescription', error: error.message });
  }
};

// Delete prescription
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ message: 'Failed to delete prescription', error: error.message });
  }
};

// Get prescription statistics
export const getPrescriptionStats = async (req, res) => {
  try {
    const pending = await Prescription.countDocuments({ status: 'pending' });
    const approved = await Prescription.countDocuments({ status: 'approved' });
    const rejected = await Prescription.countDocuments({ status: 'rejected' });
    const fulfilled = await Prescription.countDocuments({ status: 'fulfilled' });

    res.json({
      pending,
      approved,
      rejected,
      fulfilled,
      total: pending + approved + rejected + fulfilled,
    });
  } catch (error) {
    console.error('Get prescription stats error:', error);
    res.status(500).json({ message: 'Failed to fetch prescription stats', error: error.message });
  }
};
