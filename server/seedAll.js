import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { User, Medicine, Customer, Bill, Category, InventoryHistory, AuditLog } from './models/index.js';
import { Supplier, PurchaseOrder } from './models/supplierModels.js';

dotenv.config();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgoDate = (daysAgo, hour) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour ?? rand(8, 21), rand(0, 59), rand(0, 59), 0);
    return d;
};
let billSeq = 1000;
const nextBill = () => `BILL-SEED-${billSeq++}`;
const SAMPLE_IPS = ['192.168.1.10', '192.168.1.21', '10.0.0.5', '172.16.0.3', '127.0.0.1'];
const ip = () => SAMPLE_IPS[rand(0, SAMPLE_IPS.length - 1)];

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // ── 0. CLEAR EXISTING DATA ──────────────────────────────────────────
        console.log('Cleaning existing data...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Medicine.deleteMany({}),
            Customer.deleteMany({}),
            Bill.deleteMany({}),
            Supplier.deleteMany({}),
            InventoryHistory.deleteMany({}),
            AuditLog.deleteMany({}),
            PurchaseOrder.deleteMany({})
        ]);
        console.log('✓ Existing data cleared');

        // ── 1. SEED CATEGORIES ──────────────────────────────────────────────
        const categoryNames = [
            'Analgesic', 'Antibiotic', 'Antacid', 'Cough Suppressant',
            'Anti-inflammatory', 'Vitamin', 'Topical', 'Antihistamine',
            'Antidiabetic', 'Antihypertensive', 'Tablet', 'Injection', 'Drops'
        ];
        const categoryDocs = await Category.insertMany(
            categoryNames.map(name => ({ name, description: `Standard ${name} Category`, isApproved: true }))
        );
        const categoryMap = {};
        categoryDocs.forEach(c => { categoryMap[c.name] = c._id; });
        console.log(`✓ ${categoryDocs.length} Categories seeded`);

        // ── 2. SEED USERS ───────────────────────────────────────────────────
        const userData = [
            { username: 'admin', email: 'admin@medistock.com', password: 'admin123', role: 'owner' },
            { username: 'staff', email: 'staff@medistock.com', password: 'staff123', role: 'staff' },
            { username: 'pharmacist', email: 'pharmacist@medistock.com', password: 'pharmacist123', role: 'staff' },
        ];
        const users = await User.insertMany(userData);
        const owner = users.find(u => u.role === 'owner');
        const staffList = users.filter(u => u.role === 'staff');
        const getStaff = () => staffList.length > 0 ? staffList[rand(0, staffList.length - 1)] : owner;
        console.log('✓ Users seeded');

        // ── 3. SEED SUPPLIERS ───────────────────────────────────────────────
        const supplierData = [
            {
                supplier_name: "MedSupply India",
                contact_info: { phone: "+919876543210", email: "contact@medsupply.com", address: "123 Medical Street", city: "Chennai", state: "Tamil Nadu", pincode: "600040" },
                delivery_performance_score: 8.5, total_orders: 45, successful_deliveries: 42,
                medicine_categories: ["Analgesic", "Antibiotic", "Anti-inflammatory"], is_active: true
            },
            {
                supplier_name: "PharmaHub Distributors",
                contact_info: { phone: "+919988776655", email: "sales@pharmahub.in", address: "456 Healthcare Avenue", city: "Chennai", state: "Tamil Nadu", pincode: "600017" },
                delivery_performance_score: 7.2, total_orders: 32, successful_deliveries: 28,
                medicine_categories: ["Topical", "Antacid", "Vitamin"], is_active: true
            },
            {
                supplier_name: "HealthCare Solutions",
                contact_info: { phone: "+918765432109", email: "info@healthcaresol.com", address: "789 Wellness Road", city: "Chennai", state: "Tamil Nadu", pincode: "600042" },
                delivery_performance_score: 9.1, total_orders: 67, successful_deliveries: 65,
                medicine_categories: ["Cough Suppressant", "Antihistamine", "Analgesic"], is_active: true
            },
            {
                supplier_name: "Apollo MedSource",
                contact_info: { phone: "+917654321098", email: "orders@apollomedsource.com", address: "321 Medical Plaza", city: "Chennai", state: "Tamil Nadu", pincode: "600020" },
                delivery_performance_score: 8.8, total_orders: 54, successful_deliveries: 52,
                medicine_categories: ["Tablet", "Injection", "Drops"], is_active: true
            }
        ];
        // map categories to object ids
        const mappedSuppliers = supplierData.map(s => ({
            ...s,
            medicine_categories: s.medicine_categories.map(c => categoryMap[c]).filter(id => id)
        }));
        const suppliers = await Supplier.insertMany(mappedSuppliers);
        const supplierMap = {};
        suppliers.forEach(s => { supplierMap[s.supplier_name] = s._id; });
        console.log(`✓ ${suppliers.length} Suppliers seeded`);

        // ── 4. SEED CUSTOMERS ───────────────────────────────────────────────
        const customerData = [
            { name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh.k@example.com', customerType: 'regular', address: '123 Main St', city: 'Chennai', totalPurchases: 0, totalSpent: 0 },
            { name: 'Priya Sharma', phone: '9876543211', email: 'priya.sharma@example.com', customerType: 'regular', address: '456 Oak Avenue', city: 'Chennai', totalPurchases: 0, totalSpent: 0 },
            { name: 'Anita Patel', phone: '9876543212', email: 'anita.p@example.com', customerType: 'walking', address: '789 Pine Road', city: 'Chennai', totalPurchases: 0, totalSpent: 0 },
            { name: 'Mohammed Ali', phone: '9876543213', email: 'm.ali@example.com', customerType: 'regular', address: '321 Cedar Lane', city: 'Chennai', totalPurchases: 0, totalSpent: 0 },
            { name: 'Sneha Reddy', phone: '9876543214', email: 'sneha.r@example.com', customerType: 'walking', address: '654 Elm Street', city: 'Chennai', totalPurchases: 0, totalSpent: 0 },
            { name: 'Karthik Raja', phone: '9876543218', email: 'karthik.r@example.com', customerType: 'regular', address: '369 Ash Court', city: 'Chennai', totalPurchases: 0, totalSpent: 0 },
            { name: 'Meera Iyer', phone: '9876543221', email: 'meera.i@example.com', customerType: 'regular', address: '159 Poplar Road', city: 'Chennai', totalPurchases: 0, totalSpent: 0 }
        ];
        const customers = await Customer.insertMany(customerData);
        console.log(`✓ ${customers.length} Customers seeded`);

        // ── 5. SEED MEDICINES ───────────────────────────────────────────────
        const medicineData = [
            { name: 'Aspirin', category: 'Analgesic', batchNumber: 'ASP-001', expiryDate: new Date('2025-12-31'), quantity: 500, reorderLevel: 100, purchasePrice: 5, sellingPrice: 10, rackNumber: 'A1', stockStatus: 'high', supplier: 'MedSupply India' },
            { name: 'Amoxicillin', category: 'Antibiotic', batchNumber: 'AMX-001', expiryDate: new Date('2026-06-30'), quantity: 45, reorderLevel: 100, purchasePrice: 15, sellingPrice: 30, rackNumber: 'B2', stockStatus: 'low', supplier: 'MedSupply India' },
            { name: 'Paracetamol', category: 'Analgesic', batchNumber: 'PAR-001', expiryDate: new Date('2025-08-15'), quantity: 200, reorderLevel: 80, purchasePrice: 2, sellingPrice: 5, rackNumber: 'A2', stockStatus: 'high', supplier: 'HealthCare Solutions' },
            { name: 'Omeprazole', category: 'Antacid', batchNumber: 'OMP-001', expiryDate: new Date('2026-02-10'), quantity: 80, reorderLevel: 100, purchasePrice: 8, sellingPrice: 18, rackNumber: 'C1', stockStatus: 'medium', supplier: 'PharmaHub Distributors' },
            { name: 'Cough Syrup', category: 'Cough Suppressant', batchNumber: 'CS-001', expiryDate: new Date('2025-05-20'), quantity: 120, reorderLevel: 50, purchasePrice: 12, sellingPrice: 25, rackNumber: 'D1', stockStatus: 'high', supplier: 'HealthCare Solutions' },
            { name: 'Ibuprofen', category: 'Anti-inflammatory', batchNumber: 'IBU-001', expiryDate: new Date('2026-11-30'), quantity: 30, reorderLevel: 100, purchasePrice: 6, sellingPrice: 12, rackNumber: 'A3', stockStatus: 'low', supplier: 'MedSupply India' },
            { name: 'Vitamin C', category: 'Vitamin', batchNumber: 'VIT-001', expiryDate: new Date('2027-01-31'), quantity: 300, reorderLevel: 100, purchasePrice: 3, sellingPrice: 8, rackNumber: 'E1', stockStatus: 'high', supplier: 'PharmaHub Distributors' },
            { name: 'Antibiotic Cream', category: 'Topical', batchNumber: 'AC-001', expiryDate: new Date('2026-03-25'), quantity: 40, reorderLevel: 50, purchasePrice: 20, sellingPrice: 45, rackNumber: 'F1', stockStatus: 'low', supplier: 'PharmaHub Distributors' },
            { name: 'Cetirizine', category: 'Antihistamine', batchNumber: 'CET-001', expiryDate: new Date('2026-08-15'), quantity: 150, reorderLevel: 50, purchasePrice: 4, sellingPrice: 10, rackNumber: 'B1', stockStatus: 'high', supplier: 'HealthCare Solutions' },
            { name: 'Metformin', category: 'Antidiabetic', batchNumber: 'MET-001', expiryDate: new Date('2027-04-10'), quantity: 500, reorderLevel: 100, purchasePrice: 15, sellingPrice: 35, rackNumber: 'C2', stockStatus: 'high', supplier: 'Apollo MedSource' },
            { name: 'Amlodipine', category: 'Antihypertensive', batchNumber: 'AML-001', expiryDate: new Date('2026-10-05'), quantity: 250, reorderLevel: 80, purchasePrice: 12, sellingPrice: 28, rackNumber: 'D2', stockStatus: 'high', supplier: 'Apollo MedSource' },
            { name: 'Azithromycin', category: 'Antibiotic', batchNumber: 'AZI-001', expiryDate: new Date('2025-11-20'), quantity: 60, reorderLevel: 30, purchasePrice: 40, sellingPrice: 85, rackNumber: 'E2', stockStatus: 'medium', supplier: 'MedSupply India' }
        ];

        const mappedMedicines = medicineData.map(m => ({
            ...m,
            category: categoryMap[m.category] || null, // store reference
            supplier: supplierMap[m.supplier] ? String(supplierMap[m.supplier]) : m.supplier
        }));
        const medicines = await Medicine.insertMany(mappedMedicines);
        console.log(`✓ ${medicines.length} Medicines seeded`);

        // ── 6. SEED ANALYTICS (Bills & InventoryHistory) ───────────────────
        const bills = [];
        const historyRecords = [];
        for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
            const date = daysAgoDate(daysAgo);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const billsThisDay = isWeekend ? rand(8, 15) : rand(3, 8);

            for (let b = 0; b < billsThisDay; b++) {
                const numItems = rand(1, 4);
                const shuffled = [...medicines].sort(() => Math.random() - 0.5);
                const pickedMeds = shuffled.slice(0, numItems);

                const items = pickedMeds.map((m) => {
                    const quantity = rand(1, 6);
                    const price = m.sellingPrice;
                    return { medicineId: m._id, name: m.name, batchNumber: m.batchNumber, quantity, price, total: Math.round(price * quantity * 100) / 100 };
                });

                const subtotal = items.reduce((s, i) => s + i.total, 0);
                const tax = Math.round(subtotal * 0.05 * 100) / 100;
                const grandTotal = Math.round((subtotal + tax) * 100) / 100;
                const customer = customers[rand(0, customers.length - 1)];

                const bill = {
                    billNumber: nextBill(),
                    customerId: customer?._id || null,
                    customerName: customer?.name || 'Walk-in Customer',
                    customerType: customer?.customerType || 'walking',
                    items, subtotal, tax, grandTotal,
                    paymentMethod: ['cash', 'gpay', 'upi', 'card'][rand(0, 3)],
                    paymentStatus: 'completed',
                    createdAt: date, updatedAt: date,
                };
                bills.push(bill);

                items.forEach((item) => {
                    historyRecords.push({
                        medicineId: item.medicineId,
                        medicineName: item.name,
                        action: 'sale',
                        quantityChanged: -item.quantity,
                        previousQuantity: 999,
                        newQuantity: 999 - item.quantity,
                        reason: 'analytics-seed',
                        createdAt: date, updatedAt: date,
                    });
                });
            }
        }
        await Bill.insertMany(bills, { ordered: false });
        await InventoryHistory.insertMany(historyRecords, { ordered: false });
        console.log(`✓ Seeded ${bills.length} Bills and ${historyRecords.length} Inventory/Sales operations`);

        // Sync Customer totals natively via DB aggregation
        for (const c of customers) {
            const customerBills = bills.filter(b => String(b.customerId) === String(c._id));
            const totalPurchases = customerBills.length;
            const totalSpent = Math.round(customerBills.reduce((sum, b) => sum + b.grandTotal, 0) * 100) / 100;
            await Customer.updateOne({ _id: c._id }, { $set: { totalPurchases, totalSpent } });
        }
        console.log('✓ Customers Analytics synced natively');

        // ── 7. SEED AUDIT LOGS ─────────────────────────────────────────────
        const auditEntries = [];
        for (let day = 29; day >= 0; day--) {
            auditEntries.push({
                userId: owner._id, username: owner.username, action: 'USER_LOGIN', module: 'System', details: { role: 'owner' },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/auth/login', statusCode: 200, timestamp: daysAgoDate(day, 9)
            });
            const staff = getStaff();
            auditEntries.push({
                userId: staff._id, username: staff.username, action: 'USER_LOGIN', module: 'System', details: { role: staff.role || 'staff' },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/auth/login', statusCode: 200, timestamp: daysAgoDate(day, 10)
            });
        }
        for (const bill of bills) {
            const biller = getStaff();
            auditEntries.push({
                userId: biller._id, username: biller.username, action: 'BILL_GENERATED', module: 'Billing',
                details: { billNumber: bill.billNumber, grandTotal: bill.grandTotal, paymentMethod: bill.paymentMethod },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/billing', statusCode: 201, timestamp: bill.createdAt
            });
        }
        let medDayOffset = 29;
        for (const med of medicines) {
            auditEntries.push({
                userId: owner._id, username: owner.username, action: 'MEDICINE_CREATED', module: 'Inventory',
                details: { name: med.name, category: typeof med.category === 'object' ? med.category.name : med.category, quantity: med.quantity },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/inventory', statusCode: 201, timestamp: daysAgoDate(medDayOffset, rand(10, 18))
            });
            medDayOffset = Math.max(0, medDayOffset - 1);
        }
        let supDayOffset = 28;
        for (const sup of suppliers) {
            auditEntries.push({
                userId: owner._id, username: owner.username, action: 'SUPPLIER_CREATED', module: 'Suppliers', details: { name: sup.supplier_name, contact: sup.contact_info?.phone || 'N/A' },
                ipAddress: ip(), httpMethod: 'POST', endpoint: 'SEED/api/suppliers', statusCode: 201, timestamp: daysAgoDate(supDayOffset, rand(10, 18))
            });
            supDayOffset = Math.max(0, supDayOffset - 3);
        }

        // Random stock updates
        for (let i = 0; i < 40; i++) {
            const med = medicines[rand(0, medicines.length - 1)];
            const from = rand(20, 200);
            const to = from + rand(10, 100);
            const updater = getStaff();
            auditEntries.push({
                userId: updater._id, username: updater.username, action: 'STOCK_UPDATE', module: 'Inventory', details: { medicine: med.name, from, to, change: to - from },
                ipAddress: ip(), httpMethod: 'PUT', endpoint: `SEED/api/inventory/${med._id}/adjust`, statusCode: 200, timestamp: daysAgoDate(rand(0, 28))
            });
        }

        await AuditLog.insertMany(auditEntries, { ordered: false });
        console.log(`✓ Seeded ${auditEntries.length} coherent Audit Logs matching exact dataset events`);

        console.log(`
      ╔═════════════════════════════════════════════════════╗
      ║    Master Database Seeding Completed Successfully!  ║
      ╠═════════════════════════════════════════════════════╣
      ║ Users              : ${users.length}                            ║
      ║ Categories         : ${categoryDocs.length}                           ║
      ║ Suppliers          : ${suppliers.length}                            ║
      ║ Customers          : ${customers.length}                            ║
      ║ Medicines          : ${medicines.length}                           ║
      ║ Bills              : ${bills.length}                          ║
      ║ Audit Logs         : ${auditEntries.length}                          ║
      ╠═════════════════════════════════════════════════════╣
      ║ Test Credentials:                                   ║
      ║ Owner: admin / admin123                             ║
      ║ Staff: staff / staff123                             ║
      ╚═════════════════════════════════════════════════════╝
        `);

        await mongoose.disconnect();
        console.log('Database Connection Closed.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

seedDatabase();
