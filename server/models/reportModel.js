/**
 * @file Schema and model for system Reports.
 * @module models/reportModel
 */

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ['sales', 'purchase', 'inventory', 'alert'],
      required: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    date: Date,
    data: mongoose.Schema.Types.Mixed,
    generatedBy: {
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

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
