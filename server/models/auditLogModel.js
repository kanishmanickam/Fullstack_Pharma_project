/**
 * @file Schema and model for system AuditLogs.
 * @module models/auditLogModel
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    username: {
      type: String,
      default: 'system',
    },
    action: {
      type: String,
      enum: [
        'USER_LOGIN',
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DELETED',
        'STOCK_UPDATE',
        'MEDICINE_CREATED',
        'MEDICINE_DELETED',
        'BILL_GENERATED',
        'EXCEL_UPLOAD',
        'ALERT_RESOLVED',
        'SUPPLIER_CREATED',
        'ORDER_CREATED',
        'ORDER_STATUS_UPDATE',
        'REORDER_APPROVED',
        'FORECAST_RUN',
        'DELETE',
        'OTHER',
      ],
      default: 'OTHER',
    },
    module: {
      type: String,
      enum: [
        'Inventory',
        'Billing',
        'UserManagement',
        'DataImport',
        'Alerts',
        'Orders',
        'Suppliers',
        'System',
      ],
      default: 'System',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: 'unknown',
    },
    httpMethod: {
      type: String,
      default: '',
    },
    endpoint: {
      type: String,
      default: '',
    },
    statusCode: {
      type: Number,
      default: 200,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Index for fast filtering by common query patterns
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ module: 1, timestamp: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
