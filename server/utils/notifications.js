import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import log from './logger.js';

dotenv.config();

// Mock email notification
export const sendEmailNotification = async (recipient, subject, message) => {
  try {
    log('INFO', 'Email notification queued', {
      recipient,
      subject,
    });

    // Mock implementation - just log for now
    // In production, configure nodemailer with actual email service
    console.log(`
      ╔════════════════════════════════════════╗
      ║        EMAIL NOTIFICATION (MOCK)       ║
      ╠════════════════════════════════════════╣
      ║ To: ${recipient.padEnd(30)}║
      ║ Subject: ${subject.padEnd(24)}║
      ║ Message: ${message.substring(0, 24).padEnd(24)}║
      ╚════════════════════════════════════════╝
    `);

    return { success: true, message: 'Email notification sent (mock)' };
  } catch (error) {
    log('ERROR', 'Email notification failed', { error: error.message });
    throw error;
  }
};

// Mock WhatsApp notification
export const sendWhatsAppNotification = async (phoneNumber, message) => {
  try {
    log('INFO', 'WhatsApp notification queued', {
      phoneNumber,
    });

    // Mock implementation
    console.log(`
      ╔════════════════════════════════════════╗
      ║      WHATSAPP NOTIFICATION (MOCK)      ║
      ╠════════════════════════════════════════╣
      ║ Phone: ${phoneNumber.padEnd(30)}║
      ║ Message: ${message.substring(0, 24).padEnd(24)}║
      ╚════════════════════════════════════════╝
    `);

    return { success: true, message: 'WhatsApp notification sent (mock)' };
  } catch (error) {
    log('ERROR', 'WhatsApp notification failed', { error: error.message });
    throw error;
  }
};

// Send bill notification
export const sendBillNotification = async (bill, customerPhone, customerEmail) => {
  const message = `
Bill Number: ${bill.billNumber}
Customer: ${bill.customerName}
Total Amount: ₹${bill.grandTotal}
Date: ${new Date(bill.createdAt).toLocaleString()}
Payment Method: ${bill.paymentMethod}
  `.trim();

  try {
    if (customerEmail) {
      await sendEmailNotification(
        customerEmail,
        `Bill ${bill.billNumber} - MediStock`,
        message
      );
    }

    if (customerPhone) {
      await sendWhatsAppNotification(customerPhone, message);
    }

    return { success: true };
  } catch (error) {
    log('ERROR', 'Failed to send bill notification', { error: error.message });
    throw error;
  }
};

// Send alert notification
export const sendAlertNotification = async (alert, email) => {
  const message = `
Alert: ${alert.alertType.toUpperCase()}
Medicine: ${alert.medicineName}
Message: ${alert.message}
Severity: ${alert.severity}
  `.trim();

  try {
    await sendEmailNotification(
      email,
      `Alert: ${alert.alertType} - ${alert.medicineName}`,
      message
    );

    return { success: true };
  } catch (error) {
    log('ERROR', 'Failed to send alert notification', { error: error.message });
    throw error;
  }
};
