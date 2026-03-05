/**
 * seedAuditLogs.js
 * ─────────────────────────────────────────────────────────────────
 * Seeds realistic AuditLog entries across all action types for the
 * Activity Log page demo.
 *
 * Run:  cd server && node seedAuditLogs.js
 * Safe to re-run: clears only previously seeded entries first.
 * ─────────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { AuditLog, User, Medicine } from './models/index.js';

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

        // Fetch real users and medicines for realistic entries
        const users = await User.find().lean();
        const medicines = await Medicine.find().lean();

        if (users.length === 0) {
            console.error('❌ No users found. Run seed.js first.');
            process.exit(1);
        }

        const owner = users.find(u => u.role === 'owner') || users[0];
        const staff = users.find(u => u.username === 'staff1' || u.role === 'staff') || users[0];
        const staff2 = users.find(u => u.username === 'staff2' || u.role === 'pharmacist');

        // Clear previously seeded entries
        await AuditLog.deleteMany({ endpoint: { $regex: /^SEED/ } });
        console.log('✓ Cleared previous audit seed entries');

        const entries = [];

        // ── Generate 30 days of realistic activities ──────────────────
        for (let day = 29; day >= 0; day--) {
            const date = daysAgoDate(day);

            // 1. Owner logins (once per day)
            entries.push({
                userId: owner._id, username: owner.username,
                action: 'USER_LOGIN', module: 'System',
                details: { role: 'owner' },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/auth/login',
                statusCode: 200, timestamp: daysAgoDate(day, 9),
            });

            // 2. Staff logins (once or twice per day)
            entries.push({
                userId: staff._id, username: staff.username,
                action: 'USER_LOGIN', module: 'System',
                details: { role: 'staff' },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/auth/login',
                statusCode: 200, timestamp: daysAgoDate(day, 10),
            });

            // 3. Stock updates (2–4 per day by staff/staff2)
            const numUpdates = rand(2, 4);
            for (let i = 0; i < numUpdates; i++) {
                const med = medicines[rand(0, medicines.length - 1)];
                const from = rand(10, 200);
                const to = from + rand(10, 100);
                const updater = (staff2 && rand(0, 1) === 1) ? staff2 : staff;
                entries.push({
                    userId: updater._id, username: updater.username,
                    action: 'STOCK_UPDATE', module: 'Inventory',
                    details: { medicine: med?.name || 'Paracetamol', from, to, change: to - from },
                    ipAddress: ip(), httpMethod: 'PUT', endpoint: `SEED/api/inventory/${med?._id || 'id'}/adjust`,
                    statusCode: 200, timestamp: new Date(date.getTime() + rand(3600000, 28800000)),
                });
            }

            // 4. Bills generated (3–8 per day)
            const numBills = rand(3, 8);
            for (let i = 0; i < numBills; i++) {
                const amount = rand(150, 2500);
                const biller = (staff2 && rand(0, 1) === 1) ? staff2 : staff;
                entries.push({
                    userId: biller._id, username: biller.username,
                    action: 'BILL_GENERATED', module: 'Billing',
                    details: { billNumber: `BILL-${rand(1000, 9999)}`, grandTotal: amount, paymentMethod: ['cash', 'gpay', 'card'][rand(0, 2)] },
                    ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/billing',
                    statusCode: 201, timestamp: new Date(date.getTime() + rand(7200000, 50400000)),
                });
            }

            // 5. Alerts resolved (every 3 days by owner)
            if (day % 3 === 0) {
                entries.push({
                    userId: owner._id, username: owner.username,
                    action: 'ALERT_RESOLVED', module: 'Alerts',
                    details: { alertType: ['low_stock', 'near_expiry', 'overstock'][rand(0, 2)], medicine: medicines[rand(0, medicines.length - 1)]?.name || 'Aspirin' },
                    ipAddress: ip(), httpMethod: 'PUT', endpoint: `SEED/api/alerts/${rand(1000, 9999)}/resolve`,
                    statusCode: 200, timestamp: new Date(date.getTime() + rand(3600000, 43200000)),
                });
            }

            // 6. Excel uploads (twice a week, on Mon/Thu simulation)
            if (day % 7 === 0 || day % 7 === 4) {
                const success = rand(30, 80);
                const failed = rand(0, 5);
                entries.push({
                    userId: staff._id, username: staff.username,
                    action: 'EXCEL_UPLOAD', module: 'DataImport',
                    details: {
                        fileName: `inventory_batch_${date.toISOString().split('T')[0]}.xlsx`,
                        fileSizeBytes: rand(12000, 80000),
                        totalRecords: success + failed,
                        recordsSuccessful: success,
                        recordsFailed: failed,
                        anomalyCount: rand(0, 3),
                    },
                    ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/uploads',
                    statusCode: 200, timestamp: new Date(date.getTime() + rand(3600000, 14400000)),
                });
            }

            // 7. Medicine created (once every 5 days by owner)
            if (day % 5 === 0) {
                const newMedName = ['Atorvastatin', 'Losartan', 'Metoprolol', 'Gabapentin', 'Lisinopril'][rand(0, 4)];
                entries.push({
                    userId: owner._id, username: owner.username,
                    action: 'MEDICINE_CREATED', module: 'Inventory',
                    details: { name: newMedName, category: 'New Addition', quantity: rand(50, 200) },
                    ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/inventory',
                    statusCode: 201, timestamp: new Date(date.getTime() + rand(14400000, 36000000)),
                });
            }

            // 8. Supplier created (once every 10 days by owner)
            if (day % 10 === 0) {
                entries.push({
                    userId: owner._id, username: owner.username,
                    action: 'SUPPLIER_CREATED', module: 'Suppliers',
                    details: { name: ['BioPharm Ltd', 'HealWell Distributors', 'CureMed Pvt'][rand(0, 2)], contact: `+91${rand(7000000000, 9999999999)}` },
                    ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/suppliers',
                    statusCode: 201, timestamp: new Date(date.getTime() + rand(7200000, 28800000)),
                });
            }

            // 9. Order created (daily)
            const orderer = (staff2 && rand(0, 1) === 1) ? staff2 : staff;
            entries.push({
                userId: orderer._id, username: orderer.username,
                action: 'ORDER_CREATED', module: 'Orders',
                details: { orderNumber: `ORD-${rand(100, 999)}`, itemCount: rand(1, 5), total: rand(200, 3000) },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/orders',
                statusCode: 201, timestamp: new Date(date.getTime() + rand(18000000, 50400000)),
            });

            // 10. User management events (once a week by owner)
            if (day % 7 === 0) {
                entries.push({
                    userId: owner._id, username: owner.username,
                    action: 'USER_UPDATED', module: 'UserManagement',
                    details: { targetUser: staff.username, field: 'isActive', value: true },
                    ipAddress: ip(), httpMethod: 'PUT', endpoint: `SEED/api/auth/users/${staff._id}`,
                    statusCode: 200, timestamp: new Date(date.getTime() + rand(28800000, 57600000)),
                });
            }
        }

        await AuditLog.insertMany(entries, { ordered: false });

        console.log(`
  ╔════════════════════════════════════════════╗
  ║    Audit Log Seeding Completed!            ║
  ╠════════════════════════════════════════════╣
  ║ Total entries seeded : ${String(entries.length).padEnd(19)}║
  ║ Days covered         : 30                  ║
  ║ Action types used    : 10                  ║
  ╠════════════════════════════════════════════╣
  ║ Visit /activity-log to view the entries.   ║
  ╚════════════════════════════════════════════╝
    `);

        process.exit(0);
    } catch (error) {
        console.error('Audit seed error:', error.message);
        process.exit(1);
    }
};

seedAuditLogs();
