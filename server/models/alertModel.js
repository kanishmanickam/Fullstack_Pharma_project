/**
 * @file Schema and model for inventory Alerts.
 * @module models/alertModel
 */

import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    medicineName: String,
    alertType: {
      type: String,
      enum: ['low_stock', 'near_expiry', 'expired', 'overstock'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      default: 'warning',
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
