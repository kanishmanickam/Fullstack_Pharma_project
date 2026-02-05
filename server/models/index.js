// Mongoose Schemas for MediStock Backend

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// ============ USER SCHEMA ============
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['owner', 'staff', 'customer'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// ============ MEDICINE SCHEMA ============
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 50,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    rackNumber: {
      type: String,
      required: true,
    },
    stockStatus: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    supplier: {
      type: String,
      default: 'Default Supplier',
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

// Index for FEFO sorting
medicineSchema.index({ expiryDate: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);

// ============ CUSTOMER SCHEMA ============
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

const Customer = mongoose.model('Customer', customerSchema);

// ============ BILL SCHEMA ============
const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerType: {
      type: String,
      enum: ['regular', 'walking'],
      default: 'walking',
    },
    items: [
      {
        medicineId: mongoose.Schema.Types.ObjectId,
        name: String,
        batchNumber: String,
        quantity: Number,
        price: Number,
        total: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'gpay', 'card', 'upi'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

const Bill = mongoose.model('Bill', billSchema);

// ============ ALERT SCHEMA ============
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

const Alert = mongoose.model('Alert', alertSchema);

// ============ INVENTORY HISTORY SCHEMA ============
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

const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);

// ============ UPLOAD LOG SCHEMA ============
const uploadLogSchema = new mongoose.Schema(
  {
    fileName: String,
    fileSize: Number,
    recordsProcessed: Number,
    recordsSuccessful: Number,
    recordsFailed: Number,
    anomalies: [
      {
        row: Number,
        field: String,
        issue: String,
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const UploadLog = mongoose.model('UploadLog', uploadLogSchema);

// ============ REPORT SCHEMA ============
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

const Report = mongoose.model('Report', reportSchema);

// ============ NOTIFICATION SCHEMA ============
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

const Notification = mongoose.model('Notification', notificationSchema);

export {
  User,
  Medicine,
  Customer,
  Bill,
  Alert,
  InventoryHistory,
  UploadLog,
  Report,
  Notification,
};
