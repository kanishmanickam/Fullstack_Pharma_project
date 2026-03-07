# MediStock AI - Pharmacy Management System

Welcome to **MediStock AI**, a comprehensive Pharmacy Management System loaded with AI features, real-time analytics, and advanced stock intelligence.

---

## Highlight Features (100% Implemented)

1. **Voice Billing System** 🎤: Real-time speech recognition for finding medicines and setting quantities.
2. **Prescription Workflow** 📋: Upload, review, and approve customer prescriptions with email notifications.
3. **Advanced Order Management** 🛒: Order tracking (placed → delivered) with dynamic GST and delivery charge calculations.
4. **Real-time Notifications** 📱: WhatsApp (Twilio) and Email (Nodemailer) alerts for order status, GPay payments, and low stock.
5. **PDF Invoicing** 📄: Auto-generated, professional PDF bills with company branding and itemized GST.
6. **Financial Reports** 📊: Side-by-side purchase vs. sales comparison with profit margin calculations.
7. **Voice-Enabled AI Chatbot** 🤖: English & Tamil voice chatbot for stock queries and expiry info.
8. **Smart Stock Intelligence** 🎨: RED (Limit), YELLOW (Medium), and GREEN (Overstock) color-coded categorization.
9. **Automated Expiry Alerts** ⏰: 7-day warnings, near-expiry detection, and FEFO sorting algorithms.
10. **Excel Data Import** 📈: Bulk upload inventory via Excel with anomaly detection (negative quantities, expired dates).

---

## Quick Start Guide (Team Members)

The project currently uses **MongoDB Atlas** so all team members can connect to the same shared database without local setup.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kanishmanickam/Fullstack_Pharma_project.git
cd Fullstack_Pharma_project

# Install Frontend
npm install

# Install Backend
cd server
npm install
```

### 2. Environment Configuration

**Frontend** - Create `.env.local` in the root folder:
```env
VITE_GEMINI_API_KEY=AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend** - Create `.env` in the `server` folder:
```env
# MongoDB Atlas (Cloud Database - Shared)
MONGODB_URI=mongodb+srv://medistock:Medistock2026@complaintsystem.2kon3v8.mongodb.net/medistock?retryWrites=true&w=majority&appName=Complaintsystem

# JWT
JWT_SECRET=your-super-secret-key-12345

# Email (Gmail - Requires App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
OWNER_EMAIL=owner@medistock.ai

# Twilio (WhatsApp - Optional)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_NUMBER=+14155238886
OWNER_WHATSAPP_NUMBER=+919876543210

# App Settings
NODE_ENV=development
PORT=5000
```

### 3. Run the Application

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
*(Server runs on http://localhost:5000)*

**Terminal 2 - Frontend Application:**
```bash
npm run dev
```
*(Frontend runs on http://localhost:5173)*

---

## Default Test Credentials

The cloud database is already seeded. You do **not** need to run the `seedAll.js` script unless requested.

| Role | Username | Password |
|------|----------|----------|
| **Owner/Admin** | admin | admin123 |
| **Staff** | staff | staff123 |
| **Customer** | customer | customer123 |

---

## Core Architecture & Endpoints

### Order & Prescription Flow
- `POST /api/prescriptions/upload` (Customer) → `PUT /api/prescriptions/:id/review` (Owner)
- `POST /api/orders` (Order created & Stock reduced) → `PUT /api/orders/:id/status` (Staff updates)

### Reporting & Analytics
- **Financial Details:** Exportable purchases vs. sales summaries located at `src/pages/FinancialReports.jsx`.
- **System Limits:** 5MB max for prescription uploads.

### Integration Tests
A complete Jest & Supertest API suite secures the bulk Excel upload logic. Run via:
```bash
cd server
npm test
```

---

## Troubleshooting

- **MongoDB Connection Error:** Ensure your IP address is whitelisted in MongoDB Atlas (`Network Access` -> `Add IP Address` -> `0.0.0.0/0`).
- **Port 5000/5173 in use:** 
  - Linux/Mac: `lsof -i :5000` then `kill -9 <PID>`
  - Windows: `netstat -ano | findstr :5000` then `taskkill /F /PID <PID>`
- **Emails/WhatsApp not sending:** Verify Twilio Sandbox is joined and Gmail App Password is correct. Fallback logs print to the backend console.

**Built for the future of Pharmacy. Happy Coding!** 💊🤖
