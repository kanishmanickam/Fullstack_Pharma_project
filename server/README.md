# MediStock Backend API

## Overview

MediStock Backend is a complete Node.js/Express.js REST API for the pharmacy inventory management system. It supports role-based access control (RBAC), inventory management with FEFO sorting, billing, reports, and more.

## Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm

### Installation

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:** (already created with defaults)
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medistock
JWT_SECRET=medistock_super_secret_jwt_key_2024_change_in_production
```

4. **Seed database with sample data:**
```bash
node seed.js
```

5. **Start the server:**
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

Server will run on `http://localhost:5000`

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check
```
GET /health
```
Returns server status

---

## Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### Auth Routes

#### Register User
```
POST /auth/register
Body: { username, email, password, role }
Response: { token, user }
```

#### Login
```
POST /auth/login
Body: { username, password }
Response: { token, user }
```

#### Get Current User
```
GET /auth/me
Response: { user }
```

---

## Inventory Management

### Get All Medicines (sorted by FEFO)
```
GET /inventory
Response: { medicines: [...] }
```

### Search Medicines
```
GET /inventory/search?query=aspirin
Response: { medicines: [...] }
```

### Get Low Stock Medicines
```
GET /inventory/low-stock
Response: { medicines: [...] }
```

### Get Near Expiry Medicines (7 days)
```
GET /inventory/near-expiry
Response: { medicines: [...] }
```

### Create Medicine
```
POST /inventory
Body: {
  name, category, batchNumber, expiryDate,
  quantity, purchasePrice, sellingPrice,
  rackNumber, reorderLevel
}
Response: { medicine }
```

### Update Medicine
```
PUT /inventory/:id
Body: { fields to update }
Response: { medicine }
```

### Adjust Quantity
```
POST /inventory/:id/adjust-quantity
Body: { quantityChanged, reason }
Response: { medicine }
```

### Get Inventory History
```
GET /inventory/history
Response: { history: [...] }
```

---

## Billing

### Create Bill (with FEFO batch selection)
```
POST /billing
Body: {
  customerId, customerName, customerType,
  items: [{ medicineId, quantity }, ...],
  paymentMethod
}
Response: { bill }
```

### Get All Bills
```
GET /billing
Response: { bills: [...] }
```

### Get Bill by ID
```
GET /billing/:id
Response: { bill }
```

### Get Bills by Date Range
```
GET /billing/date-range?startDate=2024-01-01&endDate=2024-01-31
Response: { bills: [...] }
```

### Confirm Payment
```
POST /billing/payment/confirm
Body: { billId, transactionId }
Response: { bill, transactionId }
```

### Get Sales Summary
```
GET /billing/summary?period=daily
(periods: daily, weekly, monthly)
Response: { summary: { totalSales, totalBills, avgBillValue } }
```

---

## Customers

### Get All Customers
```
GET /customers?customerType=regular
Response: { customers: [...] }
```

### Create Customer
```
POST /customers
Body: { name, phone, email, customerType, address, city }
Response: { customer }
```

### Update Customer
```
PUT /customers/:id
Body: { fields to update }
Response: { customer }
```

### Search Customers
```
GET /customers/search?query=rajesh
Response: { customers: [...] }
```

### Get Customer Stats
```
GET /customers/stats
Response: { stats: { totalCustomers, regularCustomers, walkingCustomers } }
```

---

## Alerts & Stock Intelligence

### Generate Alerts
```
POST /alerts/generate
Response: { alerts: [...] }
```

### Get All Alerts
```
GET /alerts?resolved=false
Response: { alerts: [...] }
```

### Get Critical Alerts
```
GET /alerts/critical
Response: { alerts: [...] }
```

### Resolve Alert
```
PUT /alerts/:id/resolve
Response: { alert }
```

### Get Medicine Recommendations
```
GET /alerts/recommendations
Response: { recommendations: [...] }
```

---

## Excel Upload

### Upload Inventory File
```
POST /uploads
(multipart/form-data with Excel file)
Response: { uploadLog }
```

### Get Upload History
```
GET /uploads
Response: { uploadLogs: [...] }
```

---

## Reports & Analytics

### Get Dashboard Summary
```
GET /reports/dashboard/summary
Response: { summary: { totalMedicines, lowStockMedicines, ... } }
```

### Get Sales Report
```
GET /reports/sales?period=daily&startDate=...&endDate=...
Response: { report: { totalSales, totalBills, ... } }
```

### Get Purchase Report
```
GET /reports/purchase?period=monthly
Response: { report: { totalPurchaseValue, ... } }
```

### Get Demand Forecast
```
GET /reports/forecast?medicineId=...&days=7
Response: { forecast: [...] }
```

### Get Stock Classification
```
GET /reports/classification
Response: { classification: { fastMoving, slowMoving, normalMoving } }
```

---

## Chatbot

### Query Chatbot
```
POST /chatbot/query
Body: { message, language }
(language: 'en' or 'ta')
Response: { response, disclaimer, language }
```

---

## User Roles & Permissions

### Owner (Admin)
- Full access to all features
- Create/edit/delete medicines, customers, users
- View all reports
- Manage staff

### Staff (Pharmacist)
- Create bills
- View inventory
- Create customers
- Generate alerts
- No user management

### Customer
- View medicines
- Chat with chatbot
- Limited to customer portal

---

## Database Models

### User
- username, email, password (hashed)
- role (owner, staff, customer)
- isActive, timestamps

### Medicine
- name, category, batchNumber
- expiryDate (for FEFO sorting)
- quantity, reorderLevel
- purchasePrice, sellingPrice
- rackNumber, stockStatus
- supplier, timestamps

### Bill
- billNumber (unique)
- customerId, customerName, customerType
- items (array of line items)
- subtotal, tax, grandTotal
- paymentMethod, paymentStatus
- staffId, timestamps

### Customer
- name, phone (unique)
- email, customerType (regular/walking)
- address, city
- totalPurchases, totalSpent
- timestamps

### Alert
- medicineId, medicineName
- alertType (low_stock, near_expiry, expired, overstock)
- message, severity
- isResolved, timestamps

### UploadLog
- fileName, fileSize
- recordsProcessed, recordsSuccessful, recordsFailed
- anomalies array
- status, timestamps

---

## Error Handling

All endpoints return structured responses:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional details"
}
```

---

## Security Features

- JWT authentication with expiration
- Bcrypt password hashing
- Role-based authorization middleware
- Input validation
- CORS configuration
- Comprehensive error logging

---

## Development

### Available Scripts
```bash
npm start        # Start production server
npm run dev      # Start with nodemon (auto-reload)
node seed.js     # Seed database
```

### Project Structure
```
server/
├── config/           # Database configuration
├── models/           # Mongoose schemas
├── controllers/      # Business logic
├── routes/           # API endpoints
├── middleware/       # Auth, error handling
├── utils/            # Helpers, notifications, logger
├── uploads/          # Excel file uploads
├── logs/             # Application logs
├── server.js         # Main entry point
├── seed.js           # Database seeding
├── package.json
└── .env              # Environment variables
```

---

## Testing

### Login Credentials

**Owner:**
- Username: `admin`
- Password: `admin123`

**Staff:**
- Username: `staff`
- Password: `staff123`

**Customer:**
- Username: `customer`
- Password: `customer123`

---

## Logging

All actions are logged to `logs/app-YYYY-MM-DD.log`

Log levels:
- INFO: Successful operations
- WARN: Warnings
- ERROR: Errors

---

## Deployment

For production:
1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use a process manager (PM2)
4. Set up MongoDB Atlas or production database
5. Configure email service for notifications

```bash
pm2 start server.js --name "medistock-api"
```

---

## Support

For issues or questions, check the logs in `logs/` directory.

---

## License

ISC
