/**
 * @file Schema and model for Customer profiles.
 * @module models/customerModel
 */

import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    customerType: {
      type: String,
      enum: ['regular', 'walking'],
      default: 'walking',
    },
    address: String,
    city: String,
    totalPurchases: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
