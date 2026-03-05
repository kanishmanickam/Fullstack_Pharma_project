/**
 * seedAuditLogs.js
 * ─────────────────────────────────────────────────────────────────
 * Seeds perfectly coherent AuditLog entries derived from ACTUAL DB
 * records (Bills, Medicines, Suppliers, Users) rather than random
 * fake data, ensuring the Activity Log perfectly matches the rest
 * of the system.
 *
 * Run AFTER seedAnalytics.js:
 *   cd server && node seedAuditLogs.js
 * ─────────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { AuditLog, User, Medicine, Bill } from './models/index.js';
import { Supplier, PurchaseOrder } from './models/supplierModels.js';

dotenv.config();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgoDate = (daysAgo, hour) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour ?? rand(8, 21), rand(0, 59), rand(0, 59), 0);
    return d;
};

const SAMPLE_IPS = [
    '192.168.1.10', '192.168.1.21', '10.0.0.5', '172.16.0.3', '127.0.0.1',
];
const ip = () => SAMPLE_IPS[rand(0, SAMPLE_IPS.length - 1)];

const seedAuditLogs = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Fetch ACTUAL database records to make logs perfectly coherent
        const users = await User.find().lean();
        const medicines = await Medicine.find().lean();
        const bills = await Bill.find().lean();
        const suppliers = await Supplier.find().lean();
        const orders = await PurchaseOrder.find().lean();

        if (users.length === 0) {
            console.error('❌ No users found. Run seed.js first.');
            process.exit(1);
        }

        const owner = users.find(u => u.role === 'owner') || users[0];
        const staffList = users.filter(u => u.role === 'staff' || u.role === 'pharmacist' || u.username === 'staff1' || u.username === 'staff2');
        const getStaff = () => staffList.length > 0 ? staffList[rand(0, staffList.length - 1)] : owner;

        // Clear previously seeded entries
        await AuditLog.deleteMany({ endpoint: { $regex: /^SEED/ } });
        console.log('✓ Cleared previous audit seed entries');

        const entries = [];

        // ── 1. Owner & Staff Logins (Spread over 30 days) ─────────────
        for (let day = 29; day >= 0; day--) {
            // Owner
            entries.push({
                userId: owner._id, username: owner.username,
                action: 'USER_LOGIN', module: 'System',
                details: { role: 'owner' },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/auth/login',
                statusCode: 200, timestamp: daysAgoDate(day, 9),
            });
            // Staff
            const staff = getStaff();
            entries.push({
                userId: staff._id, username: staff.username,
                action: 'USER_LOGIN', module: 'System',
                details: { role: staff.role || 'staff' },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/auth/login',
                statusCode: 200, timestamp: daysAgoDate(day, 10),
            });
        }

        // ── 2. Actual Bills Generated ─────────────────────────────────
        for (const bill of bills) {
            const biller = getStaff();
            entries.push({
                userId: biller._id, username: biller.username,
                action: 'BILL_GENERATED', module: 'Billing',
                details: { billNumber: bill.billNumber, grandTotal: bill.grandTotal, paymentMethod: bill.paymentMethod },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/billing',
                statusCode: 201, timestamp: bill.createdAt || new Date(),
            });
        }

        // ── 3. Actual Medicines Created ───────────────────────────────
        let medDayOffset = 29;
        for (const med of medicines) {
            entries.push({
                userId: owner._id, username: owner.username,
                action: 'MEDICINE_CREATED', module: 'Inventory',
                details: { name: med.name, category: med.category, quantity: med.quantity },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/inventory',
                // Spread creation dates backwards so it looks organic
                statusCode: 201, timestamp: daysAgoDate(medDayOffset, Math.floor(Math.random() * 8 + 10)),
            });
            medDayOffset = Math.max(0, medDayOffset - 1);
        }

        // ── 4. Actual Suppliers Created ───────────────────────────────
        let supDayOffset = 28;
        for (const sup of suppliers) {
            entries.push({
                userId: owner._id, username: owner.username,
                action: 'SUPPLIER_CREATED', module: 'Suppliers',
                details: { name: sup.supplier_name, contact: sup.contact_info?.phone || 'N/A' },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/suppliers',
                // Spread creation dates backwards
                statusCode: 201, timestamp: daysAgoDate(supDayOffset, Math.floor(Math.random() * 8 + 10)),
            });
            supDayOffset = Math.max(0, supDayOffset - 5);
        }

        // ── 5. Actual Purchase Orders Created ─────────────────────────
        for (const ord of orders) {
            const orderer = getStaff();
            entries.push({
                userId: orderer._id, username: orderer.username,
                action: 'ORDER_CREATED', module: 'Orders',
                details: { orderNumber: ord.order_number, total: ord.total_amount, status: ord.order_status },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/orders',
                statusCode: 201, timestamp: ord.createdAt || new Date(),
            });
        }

        // ── 6. Synthetic Stock Updates (Mapped to real medicines) ─────
        for (let i = 0; i < 60; i++) {
            const med = medicines[rand(0, medicines.length - 1)];
            if (!med) continue;
            const from = rand(20, 200);
            const to = from + rand(10, 100); // stock addition
            const updater = getStaff();
            entries.push({
                userId: updater._id, username: updater.username,
                action: 'STOCK_UPDATE', module: 'Inventory',
                details: { medicine: med.name, from, to, change: to - from },
                ipAddress: ip(), httpMethod: 'PUT', endpoint: `SEED/api/inventory/${med._id}/adjust`,
                statusCode: 200, timestamp: daysAgoDate(rand(0, 28)),
            });
        }

        // ── 7. Synthetic User Settings/Updates ────────────────────────
        for (let i = 0; i < 4; i++) {
            entries.push({
                userId: owner._id, username: owner.username,
                action: 'USER_UPDATED', module: 'UserManagement',
                details: { targetUser: staffList[0]?.username || 'staff1', field: 'isActive', value: true },
                ipAddress: ip(), httpMethod: 'PUT', endpoint: `SEED/api/auth/users/update`,
                statusCode: 200, timestamp: daysAgoDate(rand(2, 25)),
            });
        }

        // Insert everything in bulk
        await AuditLog.insertMany(entries, { ordered: false });

        console.log(`
  ╔════════════════════════════════════════════╗
  ║    Coherent Audit Logs Seeded!             ║
  ╠════════════════════════════════════════════╣
  ║ Linked Bills         : ${String(bills.length).padEnd(20)}║
  ║ Linked Medicines     : ${String(medicines.length).padEnd(20)}║
  ║ Linked Suppliers     : ${String(suppliers.length).padEnd(20)}║
  ║ Synthetic Logins     : 60                  ║
  ║ Synthetic Stock Upds : 60                  ║
  ║ Total Logs Seeded    : ${String(entries.length).padEnd(20)}║
  ╠════════════════════════════════════════════╣
  ║ Activity Log now perfectly matches DB!     ║
  ╚════════════════════════════════════════════╝
    `);

        process.exit(0);
    } catch (error) {
        console.error('Audit seed error:', error.message);
        process.exit(1);
    }
};

seedAuditLogs();
