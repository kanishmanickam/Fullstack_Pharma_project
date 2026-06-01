/**
 * @file Schema and model for customer uploaded Prescriptions.
 * @module models/prescriptionModel
 */

import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: String,
    prescriptionFile: {
      type: String,
      required: true,
    },
    fileName: String,
    fileSize: Number,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'fulfilled'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewDate: Date,
    reviewNotes: String,
    prescribedMedicines: [
      {
        medicineName: String,
        dosage: String,
        quantity: Number,
        instructions: String,
      },
    ],
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  { timestamps: true }
);

export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
