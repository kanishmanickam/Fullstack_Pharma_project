import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';
import log from './logger.js';

dotenv.config();

// Configure nodemailer transporter
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Configure Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Real email notification
export const sendEmailNotification = async (recipient, subject, message) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      log('WARN', 'Email credentials not configured, using mock notification');
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
    }

    const mailOptions = {
      from: `MediStock AI <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #3b82f6; margin-bottom: 20px;">MediStock AI</h2>
            <div style="color: #333; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated message from MediStock AI. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await emailTransporter.sendMail(mailOptions);

    log('INFO', 'Email notification sent successfully', { recipient, subject });
    return { success: true, message: 'Email notification sent' };
  } catch (error) {
    log('ERROR', 'Email notification failed', { error: error.message });
    // Fallback to console log
    console.log(`Email to ${recipient}: ${subject} - ${message}`);
    return { success: false, error: error.message };
  }
};

// Real WhatsApp notification via Twilio
export const sendWhatsAppNotification = async (phoneNumber, message) => {
  try {
    // Check if Twilio is configured
    if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
      log('WARN', 'Twilio WhatsApp not configured, using mock notification');
      console.log(`
      ╔════════════════════════════════════════╗
      ║      WHATSAPP NOTIFICATION (MOCK)      ║
      ╠════════════════════════════════════════╣
      ║ Phone: ${phoneNumber.padEnd(30)}║
      ║ Message: ${message.substring(0, 24).padEnd(24)}║
      ╚════════════════════════════════════════╝
    `);
      return { success: true, message: 'WhatsApp notification sent (mock)' };
    }

    // Format phone number for WhatsApp (must include country code)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    const twilioMessage = await twilioClient.messages.create({
      body: `*MediStock AI*\n\n${message}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`,
    });

    log('INFO', 'WhatsApp notification sent successfully', {
      phoneNumber: formattedPhone,
      messageSid: twilioMessage.sid,
    });

    return { success: true, message: 'WhatsApp notification sent', sid: twilioMessage.sid };
  } catch (error) {
    log('ERROR', 'WhatsApp notification failed', { error: error.message });
    // Fallback to console log
    console.log(`WhatsApp to ${phoneNumber}: ${message}`);
    return { success: false, error: error.message };
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
