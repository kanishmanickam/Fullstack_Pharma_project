import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Medicine, UploadLog } from '../models/index.js';
import { detectAnomalies } from '../utils/helpers.js';
import log from '../utils/logger.js';
import { createAuditEntry } from '../middleware/auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload Excel file
export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Read Excel file
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Detect anomalies
    const anomalies = detectAnomalies(data);

    let recordsSuccessful = 0;
    let recordsFailed = 0;

    // Process records
    for (const row of data) {
      try {
        // Check if medicine already exists
        const existingMedicine = await Medicine.findOne({
          name: row.name,
          batchNumber: row.batchNumber,
        });

        if (existingMedicine) {
          // Update existing
          existingMedicine.quantity += parseInt(row.quantity) || 0;
          await existingMedicine.save();
        } else {
          // Create new
          await Medicine.create({
            name: row.name,
            category: row.category,
            batchNumber: row.batchNumber,
            expiryDate: row.expiryDate,
            quantity: row.quantity,
            purchasePrice: row.purchasePrice,
            sellingPrice: row.sellingPrice,
            rackNumber: row.rackNumber,
            reorderLevel: row.reorderLevel || 50,
            supplier: row.supplier || 'Default',
          });
        }
        recordsSuccessful++;
      } catch (error) {
        recordsFailed++;
        log('WARN', 'Failed to process row', { error: error.message });
      }
    }

    // Log upload
    const uploadLog = await UploadLog.create({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      recordsProcessed: data.length,
      recordsSuccessful,
      recordsFailed,
      anomalies,
      uploadedBy: req.user.id,
      status: recordsFailed === 0 ? 'success' : 'partial',
    });

    // Clean up file
    fs.unlinkSync(filePath);

    // ── Explicit audit hook: captures file name + record counts ──
    // Must be called explicitly (not by global middleware) because we
    // need fine-grained details: fileName, success/fail counts, anomalies
    createAuditEntry({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'EXCEL_UPLOAD',
      module: 'DataImport',
      details: {
        fileName: req.file.originalname,
        fileSizeBytes: req.file.size,
        totalRecords: data.length,
        recordsSuccessful,
        recordsFailed,
        anomalyCount: anomalies.length,
        uploadLogId: uploadLog._id,
      },
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown',
      httpMethod: 'POST',
      endpoint: req.path,
      statusCode: 200,
    }); // fire-and-forget — intentionally not awaited

    log('INFO', 'Excel file uploaded and processed', {
      fileName: req.file.originalname,
      recordsSuccessful,
      recordsFailed,
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded and processed successfully',
      uploadLog,
    });
  } catch (error) {
    log('ERROR', 'Upload Excel error', { error: error.message });

    // Clean up file on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message,
    });
  }
};

// Get upload history
export const getUploadHistory = async (req, res) => {
  try {
    const uploadLogs = await UploadLog.find()
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: uploadLogs.length,
      uploadLogs,
    });
  } catch (error) {
    log('ERROR', 'Get upload history error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching upload history',
      error: error.message,
    });
  }
};

// Get single upload log
export const getUploadLog = async (req, res) => {
  try {
    const uploadLog = await UploadLog.findById(req.params.id).populate(
      'uploadedBy',
      'username email'
    );

    if (!uploadLog) {
      return res.status(404).json({
        success: false,
        message: 'Upload log not found',
      });
    }

    res.status(200).json({
      success: true,
      uploadLog,
    });
  } catch (error) {
    log('ERROR', 'Get upload log error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching upload log',
      error: error.message,
    });
  }
};

// Export inventory to Excel
export const exportExcel = async (req, res) => {
  try {
    const medicines = await Medicine.find().lean();

    const rows = medicines.map(m => ({
      name: m.name,
      category: m.category,
      batchNumber: m.batchNumber,
      expiryDate: m.expiryDate,
      quantity: m.quantity,
      purchasePrice: m.purchasePrice,
      sellingPrice: m.sellingPrice,
      rackNumber: m.rackNumber,
      reorderLevel: m.reorderLevel,
      supplier: m.supplier,
      stockStatus: m.stockStatus,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length, ...rows.map(r => String(r[key] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = `inventory_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

    log('INFO', 'Inventory exported to Excel', { rows: rows.length });
  } catch (error) {
    log('ERROR', 'Export Excel error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error exporting inventory',
      error: error.message,
    });
  }
};

