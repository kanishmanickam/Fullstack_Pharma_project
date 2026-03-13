# MediStock AI

A full-stack pharmacy inventory management system built with React, Node.js, Express, and MongoDB. It brings together day-to-day pharmacy operations — billing, stock tracking, prescription handling, supplier management — under one roof, with AI-powered demand forecasting and a voice-enabled chatbot on top.

---

## What This Project Does

Running a pharmacy involves a lot of moving parts: medicines expiring, stock running low at the wrong time, bills to generate, prescriptions to verify, and suppliers to reorder from. MediStock AI handles all of that in one place. The owner gets full control over everything, while staff members can handle billing and customer-facing tasks without needing access to sensitive financial data.

---

## Tech Stack

**Frontend**
- React 18 with React Router v7
- Vite as the build tool
- Tailwind CSS for styling
- Material UI (MUI) for data grids and date pickers
- Recharts for charts and graphs
- Axios for HTTP communication

**Backend**
- Node.js with Express
- MongoDB via Mongoose (supports both Atlas and local Docker)
- JWT-based authentication with role-based access control
- Bcrypt for password hashing
- Multer for file uploads
- PDFKit for generating invoice PDFs
- Nodemailer for email alerts
- Twilio for WhatsApp notifications
- TensorFlow.js for LSTM-based demand forecasting

**Dev & Testing**
- Nodemon for backend hot reload
- Jest + Supertest for API testing
- Docker Compose for running MongoDB locally

---

## Project Structure

```
├── src/                          # React frontend
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   ├── Billing.jsx
│   │   ├── Customers.jsx
│   │   ├── Reports.jsx
│   │   ├── FinancialReports.jsx
│   │   ├── StockIntelligence.jsx
│   │   ├── MedicineInventory.jsx
│   │   ├── ExcelUpload.jsx
│   │   ├── ActivityLog.jsx
│   │   ├── admin/UserManagement.jsx
│   │   ├── ai/DemandSetup.jsx
│   │   ├── ai/ForecastReview.jsx
│   │   ├── reorder/SupplierManagement.jsx
│   │   └── reorder/ReorderReview.jsx
│   ├── components/               # Layout, Chatbot, ProtectedRoute, modals
│   ├── context/AuthContext.jsx   # Auth state (login/logout/user info)
│   └── utils/                   # Axios config, API helpers, Gemini client, Tamil TTS
│
├── server/                       # Express backend
│   ├── controllers/              # Business logic for every module
│   ├── routes/                   # Express route definitions
│   ├── models/index.js           # All Mongoose schemas (User, Medicine, Bill, etc.)
│   ├── middleware/               # Auth guard, audit logger, error handler, file upload
│   ├── ml/                       # LSTM + Holt-Winters demand forecasting logic
│   ├── utils/                    # Logger, notifications, PDF generator, helpers
│   ├── config/database.js        # MongoDB connection setup
│   └── server.js                 # App entry point, route mounting, CORS config
│
├── docker-compose.yml            # Spins up local MongoDB container
├── vite.config.js
└── tailwind.config.js
```

---

## Features

### Inventory Management
- Add medicines with batch numbers, expiry dates, rack numbers, and pricing
- Multi-batch support per medicine — each batch tracked independently
- FEFO (First Expired, First Out) sorting applied automatically when dispensing stock
- Stock status colour coding: RED (at or below reorder level), YELLOW (medium), GREEN (healthy)
- Near-expiry detection with configurable warning window

### Billing and Invoicing
- Create bills by searching medicines; voice input also supported
- GST calculated and itemised on every bill
- Generates a branded PDF invoice via PDFKit
- Bill history stored and linked to customer profiles
- Stock automatically deducted in FEFO order when a bill is saved

### Prescription Workflow
- Customers upload prescription images (max 5 MB)
- Owner reviews and approves or rejects prescriptions
- Email notification sent to the customer on status change

### Order Management
- Full order lifecycle: Placed → Confirmed → Dispatched → Delivered
- Dynamic GST and delivery charge calculation
- WhatsApp and email notifications triggered at each status update

### AI Demand Forecasting
- Pulls historical sales data from bills and inventory history
- Holt-Winters double exponential smoothing handles trend-adjusted forecasting
- LSTM neural network (TensorFlow.js) runs alongside for pattern recognition
- Month-by-month seasonal multipliers are configurable
- Automatically generates draft purchase orders based on forecast output
- Owner reviews and approves drafts before they are sent to suppliers

### Supplier Management
- Supplier profiles with the medicine categories they supply
- Raise and track purchase orders against suppliers
- Medicines linked back to their source supplier for reorder workflows

### Reports and Analytics
- Daily, weekly, and monthly sales reports
- Purchase vs. sales side-by-side comparison with profit margin calculations
- Financial summaries exportable
- Alert history and full audit trail available

### AI Chatbot
- Powered by Google Gemini 2.0 Flash
- Injected with a live snapshot of the current inventory at query time
- Answers questions about stock levels, expiry dates, and low-stock warnings
- Supports English and Tamil
- Voice input and Tamil TTS (text-to-speech) available in the browser

### Notifications
- Email via Nodemailer (Gmail with App Password)
- WhatsApp via Twilio sandbox
- Falls back gracefully to console mock logs if credentials are not configured

### Security and Audit
- JWT authentication; tokens verified on every protected request
- Two-factor authentication using TOTP (Speakeasy, QR code setup flow)
- Role-based access: `owner` has full access, `staff` is limited to operational tasks
- Every significant action is logged to an audit trail
- Audit logs visible to owners in the Activity Log page

### Excel Bulk Upload
- Upload inventory in bulk from an Excel (.xlsx) file
- Anomaly detection catches negative quantities, past expiry dates, and missing fields
- Covered by Jest + Supertest integration tests

---

## Getting Started

### Prerequisites
- Node.js 18 or later
- npm
- MongoDB Atlas account, or Docker for running MongoDB locally

### 1. Clone and Install

```bash
git clone https://github.com/kanishmanickam/Fullstack_Pharma_project.git
cd Fullstack_Pharma_project

# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Environment Variables

**Root directory — create `.env.local`:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

**`server/` directory — create `.env`:**
```env
# MongoDB (Atlas URI or local connection string)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medistock

# Auth
JWT_SECRET=your_jwt_secret_here

# Email — Gmail App Password required (not your regular account password)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
OWNER_EMAIL=owner@yourdomain.com

# Twilio WhatsApp (optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
OWNER_WHATSAPP_NUMBER=+91xxxxxxxxxx

# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

If email or Twilio credentials are missing, the app logs mock notifications to the console and keeps running normally.

### 3. Start the App

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev
# Runs at http://localhost:5000
```

```bash
# Terminal 2 — Frontend
npm run dev
# Runs at http://localhost:5173
```

### 4. (Optional) Local MongoDB with Docker

If you prefer not to use Atlas:

```bash
# Add MONGO_ROOT_USER and MONGO_ROOT_PASSWORD to a .env in the root directory first
docker-compose up -d
```

Then update `MONGODB_URI` in `server/.env` to `mongodb://localhost:27017/medistock`.

### 5. Seed the Database

Only needed when starting with an empty database:

```bash
cd server
npm run seed
```

---

## API Routes

The backend runs at `http://localhost:5000`. All protected routes require the header `Authorization: Bearer <token>`.

| Route | Description |
|-------|-------------|
| `POST /api/auth/login` | Login, returns JWT |
| `POST /api/auth/register` | Register a user (owner only) |
| `GET /api/inventory` | List all medicines, FEFO sorted |
| `POST /api/billing` | Create a bill, deducts stock |
| `GET /api/reports/sales` | Sales report (daily / weekly / monthly) |
| `POST /api/prescriptions/upload` | Upload prescription image |
| `POST /api/forecast/run` | Run AI forecast, generate draft POs |
| `GET /api/suppliers` | List suppliers |
| `GET /api/orders` | List orders |
| `GET /api/customers` | List customers |
| `GET /api/alerts` | Stock and expiry alerts |
| `POST /api/chatbot` | Query the AI chatbot |
| `GET /api/audit` | Audit log entries |
| `GET /api/notifications` | Notification history |

---

## Running Tests

```bash
cd server
npm test
```

Tests cover billing controller logic, billing math helpers, and the bulk Excel upload endpoint. Uses Jest and Supertest.

---

## Troubleshooting

**MongoDB connection fails**
If you are using Atlas, make sure your current IP is whitelisted. Go to Network Access in the Atlas dashboard and add `0.0.0.0/0` for development.

**Port already in use (Windows)**
```bash
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

**Emails not sending**
Gmail requires an App Password, not your regular account password. Generate one under Google Account → Security → 2-Step Verification → App Passwords.

**WhatsApp messages not arriving**
You need to first join the Twilio sandbox by sending the sandbox join message from your phone to the Twilio WhatsApp number. After that, outbound messages will work.

**2FA QR code not appearing**
Make sure `JWT_SECRET` is set in `server/.env`. The TOTP secret is generated server-side when the user starts setup from the Security Settings modal in the frontend.

