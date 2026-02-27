# 🚀 Quick Setup Guide - MediStock AI

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally or cloud connection
- Gmail account (for email notifications)
- Twilio account (optional, for WhatsApp)

## 1️⃣ Installation

### Clone & Install Dependencies
```bash
# Navigate to project
cd fullstack_pharmacy

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..
npm install
```

## 2️⃣ Database Setup

### Start MongoDB
```bash
# Windows (if installed locally)
mongod

# Or use MongoDB Atlas cloud connection
```

### Seed Database
```bash
cd server
node seed.js
```

**Test Credentials Created:**
- **Owner:** admin / admin123
- **Staff:** staff / staff123
- **Customer:** customer / customer123

## 3️⃣ Environment Configuration

### Create .env file
```bash
cd server
copy .env.example .env
```

### Edit .env with your credentials:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/medistock

# JWT
JWT_SECRET=your-super-secret-key-12345

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Twilio WhatsApp (Optional)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Owner Notifications
OWNER_EMAIL=owner@medistock.ai
OWNER_WHATSAPP_NUMBER=+919876543210
```

## 4️⃣ Gmail Setup (for Email Notifications)

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy password to `EMAIL_PASSWORD` in .env

## 5️⃣ Twilio Setup (for WhatsApp - Optional)

1. Sign up at https://www.twilio.com/
2. Get credentials from console
3. Go to https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
4. Activate WhatsApp Sandbox
5. Send "join <keyword>" to sandbox number from your WhatsApp
6. Add credentials to .env

## 6️⃣ Start Application

### Terminal 1 - Backend Server
```bash
cd server
npm start
```
Server runs on: http://localhost:5000

### Terminal 2 - Frontend Server
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

## 7️⃣ Access Application

1. Open browser: http://localhost:5173
2. Login with test credentials:
   - **Owner:** admin / admin123
   - **Staff:** staff / staff123
   - **Customer:** customer / customer123

## ✅ Verify Features

### Voice Billing
1. Login as staff
2. Go to Billing
3. Click microphone icon
4. Speak medicine name
5. Speak quantity

### Financial Reports
1. Login as owner (admin/admin123)
2. Click "Financial Reports" in sidebar
3. View purchase vs sales comparison

### Voice Chatbot
1. Click robot icon (bottom right)
2. Click microphone to speak
3. Bot responds with voice
4. Switch to Tamil language

### Notifications
1. Create a bill with GPay payment
2. Check owner email for payment notification
3. If WhatsApp configured, check owner WhatsApp

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
net start MongoDB
```

### Port Already in Use
```bash
# Backend (5000)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Frontend (5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Email Not Sending
- Verify Gmail app password is correct
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Look for errors in server console
- Emails will log to console if not configured

### WhatsApp Not Sending
- Verify Twilio credentials
- Check if sandbox is active
- Verify you sent "join <keyword>" message
- Messages will log to console if not configured

### Voice Features Not Working
- Use Chrome or Edge browser (best support)
- Allow microphone permissions
- Check browser console for errors

## 📚 Documentation

- **Full Implementation:** See IMPLEMENTATION.md
- **API Endpoints:** See server/routes/*.js
- **Database Schema:** See server/models/index.js

## 🎯 Default Features

### Already Working (No Configuration Needed)
- ✅ Dashboard with KPIs
- ✅ Inventory management
- ✅ Text-based billing
- ✅ Customer management
- ✅ Stock intelligence
- ✅ Reports & analytics
- ✅ Excel upload
- ✅ Stock categorization (RED/YELLOW/GREEN)
- ✅ Expiry alerts (7-day warning)
- ✅ FEFO sorting
- ✅ Role-based access

### Requires Configuration
- 📧 Email notifications (Gmail setup)
- 📱 WhatsApp notifications (Twilio setup)
- 🎤 Voice features (browser permissions)

## 🔒 Security Notes

- Never commit .env file to Git
- Change JWT_SECRET in production
- Use strong passwords
- Enable HTTPS in production
- Rotate API keys regularly

## ✨ Success!

If you see:
- ✅ Backend: "MongoDB Connected" and "Server running on port 5000"
- ✅ Frontend: Application loads at http://localhost:5173
- ✅ Login: Successfully login with test credentials

**You're all set! 🎉**

## 📞 Need Help?

Check:
1. Console logs for errors
2. MongoDB is running
3. All npm packages installed
4. .env file configured correctly
5. Ports 5000 and 5173 are free

---

**Happy coding with MediStock AI!** 💊🤖
