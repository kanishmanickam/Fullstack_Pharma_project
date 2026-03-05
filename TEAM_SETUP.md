# 🚀 Team Setup Guide - MongoDB Atlas

## ✅ MongoDB Atlas Setup Complete!

Your MediStock AI project is now using **MongoDB Atlas** (cloud database) so all team members can connect to the same database.

---

## 📋 For Team Members

### Step 1: Clone the Repository
```bash
git clone https://github.com/kanishmanickam/Fullstack_Pharma_project.git
cd Fullstack_Pharma_project
```

### Step 2: Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### Step 3: Environment Configuration

**Frontend** - Create `.env.local` in root folder:
```env
VITE_GEMINI_API_KEY=AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend** - Create `.env.local` in `server` folder:
```env
# MongoDB Atlas (Cloud Database - Shared)
MONGODB_URI=mongodb+srv://medistock:Medistock2026@complaintsystem.2kon3v8.mongodb.net/medistock?retryWrites=true&w=majority&appName=Complaintsystem

# Gemini API
GEMINI_API_KEY=AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE=your-twilio-phone

# App Settings
NODE_ENV=development
PORT=5000
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 5: Access the Application
- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:5000/api

---

## 🔐 Test Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Owner/Admin | admin | admin123 |
| Staff | staff | staff123 |
| Customer | customer | customer123 |

---

## 🌐 MongoDB Atlas Access

**Database**: `medistock`  
**Cluster**: `Complaintsystem`  
**Username**: `medistock`  
**Password**: `Medistock2026`

**Connection String:**
```
mongodb+srv://medistock:Medistock2026@complaintsystem.2kon3v8.mongodb.net/medistock?retryWrites=true&w=majority&appName=Complaintsystem
```

---

## ✅ Database Already Seeded

The database has been pre-populated with:
- ✓ 3 Users (owner, staff, customer)
- ✓ 8 Medicines (sample inventory)
- ✓ 3 Customers (sample data)

**No need to run `node seed.js` again!**

---

## 🔧 Troubleshooting

### Cannot connect to MongoDB Atlas?
1. Check if your IP is whitelisted in MongoDB Atlas
2. Go to: https://cloud.mongodb.com
3. Navigate to: Network Access → Add IP Address
4. Add your current IP or allow "0.0.0.0/0" for all IPs

### Port already in use?
```bash
# Kill process on port 5000 (Backend)
taskkill /F /IM node.exe

# Or change PORT in .env.local
PORT=5001
```

---

## 📞 Support

If you face any issues:
1. Check `.env.local` files are created correctly
2. Ensure MongoDB Atlas IP whitelist includes your IP
3. Verify all dependencies are installed (`npm install`)
4. Check if ports 5000 and 5173 are available

---

## 🎉 You're All Set!

All team members can now work on the same database simultaneously!
