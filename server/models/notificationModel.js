/**
 * @file Schema and model for dispatched Notifications.
 * @module models/notificationModel
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipientType: {
      type: String,
      enum: ['email', 'whatsapp', 'sms'],
      default: 'email',
    },
    recipient: String,
    subject: String,
    message: String,
    relatedBillId: mongoose.Schema.Types.ObjectId,
    relatedAlertId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
