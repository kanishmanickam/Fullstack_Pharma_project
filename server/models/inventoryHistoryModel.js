/**
 * @file Schema and model for Inventory transaction History.
 * @module models/inventoryHistoryModel
 */

import mongoose from 'mongoose';

const inventoryHistorySchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    medicineName: String,
    action: {
      type: String,
      enum: ['add', 'remove', 'sale', 'adjustment', 'return'],
      required: true,
    },
    quantityChanged: Number,
    previousQuantity: Number,
    newQuantity: Number,
    reason: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const InventoryHistory = mongoose.models.InventoryHistory || mongoose.model('InventoryHistory', inventoryHistorySchema);
