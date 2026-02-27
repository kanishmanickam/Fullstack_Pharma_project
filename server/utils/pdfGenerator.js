// PDF Generation Utility

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Generate bill PDF
export const generateBillPDF = async (bill) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads/bills directory if it doesn't exist
      const billsDir = 'uploads/bills';
      if (!fs.existsSync(billsDir)) {
        fs.mkdirSync(billsDir, { recursive: true });
      }

      const fileName = `bill-${bill.billNumber}-${Date.now()}.pdf`;
      const filePath = path.join(billsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(24)
        .fillColor('#3b82f6')
        .text('MediStock AI', 50, 50)
        .fontSize(10)
        .fillColor('#666')
        .text('Pharmacy Management System', 50, 80)
        .text('Phone: +91 98765 43210', 50, 95)
        .text('Email: support@medistock.ai', 50, 110);

      // Bill Title
      doc
        .fontSize(20)
        .fillColor('#000')
        .text('INVOICE', 400, 50, { align: 'right' })
        .fontSize(10)
        .fillColor('#666')
        .text(`Bill #: ${bill.billNumber}`, 400, 80, { align: 'right' })
        .text(`Date: ${new Date(bill.createdAt || Date.now()).toLocaleDateString()}`, 400, 95, { align: 'right' })
        .text(`Time: ${new Date(bill.createdAt || Date.now()).toLocaleTimeString()}`, 400, 110, { align: 'right' });

      // Customer Information
      doc
        .fontSize(12)
        .fillColor('#000')
        .text('Bill To:', 50, 150)
        .fontSize(10)
        .fillColor('#666')
        .text(bill.customerName || 'Walking Customer', 50, 170)
        .text(`Type: ${bill.customerType || 'walking'}`, 50, 185)
        .text(`Payment: ${bill.paymentMethod?.toUpperCase() || 'CASH'}`, 50, 200);

      // Line separator
      doc
        .moveTo(50, 230)
        .lineTo(550, 230)
        .stroke('#e5e5e5');

      // Table Header
      const tableTop = 250;
      doc
        .fontSize(10)
        .fillColor('#3b82f6')
        .text('Item', 50, tableTop, { width: 200 })
        .text('Batch', 260, tableTop, { width: 70 })
        .text('Qty', 340, tableTop, { width: 40, align: 'right' })
        .text('Price', 390, tableTop, { width: 60, align: 'right' })
        .text('Total', 460, tableTop, { width: 90, align: 'right' });

      // Line under header
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke('#e5e5e5');

      // Table Items
      let currentY = tableTop + 35;
      doc.fillColor('#000');

      (bill.items || []).forEach((item, index) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        doc
          .fontSize(9)
          .text(item.name || item.medicineName, 50, currentY, { width: 200 })
          .text(item.batchNo || item.batchNumber || 'N/A', 260, currentY, { width: 70 })
          .text(item.quantity.toString(), 340, currentY, { width: 40, align: 'right' })
          .text(`₹${item.price.toFixed(2)}`, 390, currentY, { width: 60, align: 'right' })
          .text(`₹${item.total.toFixed(2)}`, 460, currentY, { width: 90, align: 'right' });

        currentY += 25;
      });

      // Summary section
      currentY += 20;
      doc
        .moveTo(350, currentY)
        .lineTo(550, currentY)
        .stroke('#e5e5e5');

      currentY += 15;

      // Subtotal
      doc
        .fontSize(10)
        .fillColor('#666')
        .text('Subtotal:', 350, currentY)
        .fillColor('#000')
        .text(`₹${bill.subtotal.toFixed(2)}`, 460, currentY, { width: 90, align: 'right' });

      currentY += 20;

      // Tax
      doc
        .fillColor('#666')
        .text('GST (12%):', 350, currentY)
        .fillColor('#000')
        .text(`₹${bill.tax.toFixed(2)}`, 460, currentY, { width: 90, align: 'right' });

      currentY += 20;

      // Line before total
      doc
        .moveTo(350, currentY)
        .lineTo(550, currentY)
        .stroke('#3b82f6');

      currentY += 10;

      // Grand Total
      doc
        .fontSize(14)
        .fillColor('#3b82f6')
        .text('Grand Total:', 350, currentY)
        .text(`₹${(bill.grandTotal || bill.total).toFixed(2)}`, 460, currentY, { width: 90, align: 'right' });

      currentY += 40;

      // Payment Status
      const paymentStatusColor = bill.paymentStatus === 'paid' ? '#10b981' : '#f59e0b';
      doc
        .fontSize(10)
        .fillColor(paymentStatusColor)
        .text(`Payment Status: ${(bill.paymentStatus || 'pending').toUpperCase()}`, 350, currentY);

      // Footer
      doc
        .fontSize(8)
        .fillColor('#999')
        .text(
          'Thank you for your business! For queries, contact us at support@medistock.ai',
          50,
          750,
          { align: 'center', width: 500 }
        )
        .text('This is a computer-generated invoice.', 50, 765, {
          align: 'center',
          width: 500,
        });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Generate prescription PDF report
export const generatePrescriptionPDF = async (prescription) => {
  return new Promise((resolve, reject) => {
    try {
      const prescriptionsDir = 'uploads/prescription-reports';
      if (!fs.existsSync(prescriptionsDir)) {
        fs.mkdirSync(prescriptionsDir, { recursive: true });
      }

      const fileName = `prescription-report-${prescription._id}-${Date.now()}.pdf`;
      const filePath = path.join(prescriptionsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(24)
        .fillColor('#3b82f6')
        .text('MediStock AI', 50, 50)
        .fontSize(12)
        .fillColor('#666')
        .text('Prescription Report', 50, 80);

      // Prescription Details
      doc
        .fontSize(10)
        .fillColor('#000')
        .text(`Patient: ${prescription.customerName}`, 50, 120)
        .text(`Phone: ${prescription.customerPhone}`, 50, 140)
        .text(`Upload Date: ${new Date(prescription.uploadDate).toLocaleDateString()}`, 50, 160)
        .text(`Status: ${prescription.status.toUpperCase()}`, 50, 180);

      // Prescribed Medicines
      if (prescription.prescribedMedicines && prescription.prescribedMedicines.length > 0) {
        doc
          .fontSize(14)
          .fillColor('#3b82f6')
          .text('Prescribed Medicines', 50, 220);

        let currentY = 250;
        prescription.prescribedMedicines.forEach((med, index) => {
          doc
            .fontSize(10)
            .fillColor('#000')
            .text(`${index + 1}. ${med.medicineName}`, 50, currentY)
            .fontSize(9)
            .fillColor('#666')
            .text(`   Dosage: ${med.dosage}`, 50, currentY + 15)
            .text(`   Quantity: ${med.quantity}`, 50, currentY + 30)
            .text(`   Instructions: ${med.instructions}`, 50, currentY + 45);

          currentY += 80;
        });
      }

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
