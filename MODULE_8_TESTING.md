# Module 8: User & Role Management - Testing Guide

## 🧪 Test Scenarios

### Test 1: Owner (Admin) Access - Full Permissions
**Login Credentials**: `admin` / `admin123`

#### Backend Tests (Use Postman/Thunder Client):
1. **Login as Owner**
   ```
   POST http://localhost:5000/api/auth/login
   Body: {"username": "admin", "password": "admin123"}
   ```
   ✅ Should return: `role: "owner"`, `roleDisplay: "Admin"`, and full `permissions` object

2. **View All Users**
   ```
   GET http://localhost:5000/api/auth/users
   Headers: Authorization: Bearer <owner_token>
   ```
   ✅ Should return: All users with roleDisplay mappings

3. **Create New Staff User**
   ```
   POST http://localhost:5000/api/auth/register
   Headers: Authorization: Bearer <owner_token>
   Body: {
     "username": "nurse01",
     "email": "nurse@clinic.com",
     "password": "nurse123",
     "role": "staff"
   }
   ```
   ✅ Should succeed: Returns user with roleDisplay "Operational Staff"

4. **View Financial Reports**
   ```
   GET http://localhost:5000/api/reports/sales
   Headers: Authorization: Bearer <owner_token>
   ```
   ✅ Should succeed: Returns sales report data

5. **Create Purchase Order**
   ```
   POST http://localhost:5000/api/suppliers/purchase-orders
   Headers: Authorization: Bearer <owner_token>
   Body: {
     "supplier": "<supplier_id>",
     "items": [{"medicine": "<medicine_id>", "quantity": 100, "unitPrice": 10}]
   }
   ```
   ✅ Should succeed: Creates purchase order

#### Frontend Tests:
1. **Login**: Navigate to http://localhost:5173 → Login with `admin/admin123`
   ✅ Should see: All menu items including "User Management"

2. **User Management Page**: Click "User Management" in sidebar
   ✅ Should see: 
   - User registration form
   - List of all users with role badges
   - Edit/Delete buttons on all users
   - Permission Matrix showing role capabilities

3. **Create Staff User**: Fill form (username: nurse01, email: nurse@clinic.com, password: nurse123, role: staff) → Click "Register User"
   ✅ Should see: New user appears in list with blue "Operational Staff" badge

4. **Edit User**: Click edit icon on any user → Change email → Save
   ✅ Should succeed: User updated, can't change own role (warning appears)

5. **Delete User**: Click delete icon on staff user → Confirm
   ✅ Should succeed: User removed, can't delete self (warning appears)

6. **Financial Dashboard**: Navigate to Dashboard
   ✅ Should see: All widgets including revenue, profit, sales analytics

---

### Test 2: Staff (Operational) Access - Restricted Permissions
**Login Credentials**: `staff` / `staff123`

#### Backend Tests:
1. **Login as Staff**
   ```
   POST http://localhost:5000/api/auth/login
   Body: {"username": "staff", "password": "staff123"}
   ```
   ✅ Should return: `role: "staff"`, `roleDisplay: "Operational Staff"`, and restricted `permissions` object:
   ```json
   {
     "canViewFinancials": false,
     "canManageUsers": false,
     "canApprovePurchaseOrders": false,
     "canModifySettings": false,
     "canAccessAllModules": false,
     "canPerformBilling": true,
     "canUploadExcel": true,
     "canUseChatbot": true
   }
   ```

2. **Attempt to View Users** (Should FAIL)
   ```
   GET http://localhost:5000/api/auth/users
   Headers: Authorization: Bearer <staff_token>
   ```
   ❌ Should return: `403 Forbidden` with `errorCode: "OWNER_ONLY"`, message: "This action is restricted to Admin users only"

3. **Attempt to Create User** (Should FAIL)
   ```
   POST http://localhost:5000/api/auth/register
   Headers: Authorization: Bearer <staff_token>
   Body: {"username": "test", "email": "test@test.com", "password": "test123", "role": "staff"}
   ```
   ❌ Should return: `403 Forbidden` with `errorCode: "OWNER_ONLY"`

4. **Attempt to View Financial Reports** (Should FAIL)
   ```
   GET http://localhost:5000/api/reports/sales
   Headers: Authorization: Bearer <staff_token>
   ```
   ❌ Should return: `403 Forbidden` with `errorCode: "OWNER_ONLY"`, message: "This action is restricted to Admin users only"

5. **Attempt to Create Purchase Order** (Should FAIL)
   ```
   POST http://localhost:5000/api/suppliers/purchase-orders
   Headers: Authorization: Bearer <staff_token>
   ```
   ❌ Should return: `403 Forbidden` with `errorCode: "OWNER_ONLY"`

6. **View Inventory Reports** (Should SUCCEED)
   ```
   GET http://localhost:5000/api/reports/inventory
   Headers: Authorization: Bearer <staff_token>
   ```
   ✅ Should succeed: Returns inventory data (staff can view non-financial reports)

7. **View Suppliers** (Should SUCCEED)
   ```
   GET http://localhost:5000/api/suppliers/suppliers
   Headers: Authorization: Bearer <staff_token>
   ```
   ✅ Should succeed: Returns supplier list (staff can view suppliers)

#### Frontend Tests:
1. **Login**: Navigate to http://localhost:5173 → Login with `staff/staff123`
   ✅ Should see: Limited menu items, NO "User Management" option

2. **User Management Access**: Try to manually navigate to http://localhost:5173/user-management
   ❌ Should redirect: Back to dashboard or show "Unauthorized" message

3. **Financial Dashboard**: Navigate to Dashboard
   ⚠️ Should see: Limited widgets (no financial data if frontend properly implements permission checks)

4. **Billing Module**: Navigate to Billing
   ✅ Should succeed: Staff can perform billing operations

5. **Excel Upload**: Navigate to Excel Upload
   ✅ Should succeed: Staff can upload Excel files

6. **Stock Intelligence (Chatbot)**: Navigate to Stock Intelligence
   ✅ Should succeed: Staff can use AI chatbot

---

## 🔑 Test Accounts

| Username | Password | Role | Display Name | Access Level |
|----------|----------|------|--------------|--------------|
| admin | admin123 | owner | Admin | Full Access |
| staff | staff123 | staff | Operational Staff | Limited Access |
| pharmacist | pharmacist123 | staff | Operational Staff | Limited Access |

---

## 📊 Permission Matrix

| Permission | Owner (Admin) | Staff (Operational) |
|------------|---------------|---------------------|
| View Financials (Revenue/Sales/Purchase Reports) | ✅ | ❌ |
| Manage Users (Create/Update/Delete) | ✅ | ❌ |
| Approve Purchase Orders | ✅ | ❌ |
| Modify System Settings | ✅ | ❌ |
| Create/Update Suppliers | ✅ | ❌ |
| Perform Billing | ✅ | ✅ |
| Upload Excel Files | ✅ | ✅ |
| Use AI Chatbot | ✅ | ✅ |
| View Inventory Reports | ✅ | ✅ |
| View Suppliers | ✅ | ✅ |
| Generate Reorder Suggestions | ✅ | ✅ |
| View Purchase Orders | ✅ | ✅ |

---

## 🚨 Error Code Reference

| Error Code | HTTP Status | Meaning | Solution |
|------------|-------------|---------|----------|
| `NOT_AUTHENTICATED` | 401 | No token provided | Login first |
| `INVALID_TOKEN` | 401 | Token expired or malformed | Re-login to get new token |
| `UNAUTHORIZED_ACCESS` | 403 | User role not allowed | Contact admin for access |
| `OWNER_ONLY` | 403 | Action restricted to Admin | Only owner can perform this |
| `STAFF_RESTRICTED` | 403 | Staff cannot perform action | Restricted operation |

---

## 🧪 Quick Test Commands (VS Code REST Client)

Create a file `test.http` in your project root:

```http
### Owner Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

### Staff Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "staff",
  "password": "staff123"
}

### Get All Users (Owner Only)
GET http://localhost:5000/api/auth/users
Authorization: Bearer YOUR_OWNER_TOKEN_HERE

### Get Financial Reports (Owner Only)
GET http://localhost:5000/api/reports/sales
Authorization: Bearer YOUR_OWNER_TOKEN_HERE

### Try to Get Users as Staff (Should Fail)
GET http://localhost:5000/api/auth/users
Authorization: Bearer YOUR_STAFF_TOKEN_HERE
```

---

## ✅ Success Criteria

Module 8 is working correctly if:
1. ✅ Owner can access all routes and see "User Management" menu
2. ✅ Staff cannot access user management, financial reports, or create purchase orders
3. ✅ Staff CAN access billing, Excel upload, chatbot, inventory reports
4. ✅ Login responses include `permissions` object and `roleDisplay` field
5. ✅ Error messages are clear with appropriate error codes (401/403)
6. ✅ Users cannot delete themselves or change their own role
7. ✅ Password hashing works (can login with new users)
8. ✅ Role badges display correctly (Admin/Operational Staff)
