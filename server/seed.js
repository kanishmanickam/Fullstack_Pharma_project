import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Medicine, Customer, Bill, Category } from './models/index.js';
import connectDB from './config/database.js';
import { Supplier } from './models/supplierModels.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Medicine.deleteMany({});
    await Customer.deleteMany({});
    await Bill.deleteMany({});
    await Supplier.deleteMany({});
    console.log('Existing data cleared');

    // Create a predefined list of valid functional medical Categories
    const categoryNames = [
      'Analgesic',
      'Antibiotic',
      'Antacid',
      'Cough Suppressant',
      'Anti-inflammatory',
      'Vitamin',
      'Topical',
      'Antihistamine',
      'Antidiabetic',
      'Antihypertensive'
    ];

    const categoryDocs = await Category.insertMany(
      categoryNames.map(name => ({ name, description: `Standard ${name} Category`, isApproved: true }))
    );
    console.log(`${categoryDocs.length} Categories seeded`);

    // Build map for quick access
    const categoryMap = {};
    categoryDocs.forEach(c => { categoryMap[c.name] = c._id; });

    // Seed users
    const userData = [
      {
        username: 'admin',
        email: 'admin@medistock.com',
        password: 'admin123',
        role: 'owner',
      },
      {
        username: 'staff',
        email: 'staff@medistock.com',
        password: 'staff123',
        role: 'staff',
      },
      {
        username: 'pharmacist',
        email: 'pharmacist@medistock.com',
        password: 'pharmacist123',
        role: 'staff',
      },
    ];

    const users = [];
    for (const u of userData) {
      const createdUser = await User.create(u);
      users.push(createdUser);
    }

    console.log('✓ Users seeded');

    // Seed medicines
    const medicineData = [
      {
        name: 'Aspirin',
        category: 'Analgesic',
        batchNumber: 'ASP-001',
        expiryDate: new Date('2025-12-31'),
        quantity: 500,
        reorderLevel: 100,
        purchasePrice: 5,
        sellingPrice: 10,
        rackNumber: 'A1',
        stockStatus: 'high',
        supplier: 'Pharma Corp',
      },
      {
        name: 'Amoxicillin',
        category: 'Antibiotic',
        batchNumber: 'AMX-001',
        expiryDate: new Date('2026-06-30'),
        quantity: 45,
        reorderLevel: 100,
        purchasePrice: 15,
        sellingPrice: 30,
        rackNumber: 'B2',
        stockStatus: 'low',
        supplier: 'Pharma Corp',
      },
      {
        name: 'Paracetamol',
        category: 'Analgesic',
        batchNumber: 'PAR-001',
        expiryDate: new Date('2025-08-15'),
        quantity: 200,
        reorderLevel: 80,
        purchasePrice: 2,
        sellingPrice: 5,
        rackNumber: 'A2',
        stockStatus: 'high',
        supplier: 'MedChem',
      },
      {
        name: 'Omeprazole',
        category: 'Antacid',
        batchNumber: 'OMP-001',
        expiryDate: new Date('2026-02-10'),
        quantity: 80,
        reorderLevel: 100,
        purchasePrice: 8,
        sellingPrice: 18,
        rackNumber: 'C1',
        stockStatus: 'medium',
        supplier: 'GenMed',
      },
      {
        name: 'Cough Syrup',
        category: 'Cough Suppressant',
        batchNumber: 'CS-001',
        expiryDate: new Date('2025-05-20'),
        quantity: 120,
        reorderLevel: 50,
        purchasePrice: 12,
        sellingPrice: 25,
        rackNumber: 'D1',
        stockStatus: 'high',
        supplier: 'Breath Pharma',
      },
      {
        name: 'Ibuprofen',
        category: 'Anti-inflammatory',
        batchNumber: 'IBU-001',
        expiryDate: new Date('2026-11-30'),
        quantity: 30,
        reorderLevel: 100,
        purchasePrice: 6,
        sellingPrice: 12,
        rackNumber: 'A3',
        stockStatus: 'low',
        supplier: 'Relief Labs',
      },
      {
        name: 'Vitamin C',
        category: 'Vitamin',
        batchNumber: 'VIT-001',
        expiryDate: new Date('2027-01-31'),
        quantity: 300,
        reorderLevel: 100,
        purchasePrice: 3,
        sellingPrice: 8,
        rackNumber: 'E1',
        stockStatus: 'high',
        supplier: 'Health Plus',
      },
      {
        name: 'Antibiotic Cream',
        category: 'Topical',
        batchNumber: 'AC-001',
        expiryDate: new Date('2026-03-25'),
        quantity: 40,
        reorderLevel: 50,
        purchasePrice: 20,
        sellingPrice: 45,
        rackNumber: 'F1',
        stockStatus: 'low',
        supplier: 'Skin Care Inc',
      },
      {
        name: 'Cetirizine',
        category: 'Antihistamine',
        batchNumber: 'CET-001',
        expiryDate: new Date('2026-08-15'),
        quantity: 150,
        reorderLevel: 50,
        purchasePrice: 4,
        sellingPrice: 10,
        rackNumber: 'B1',
        stockStatus: 'high',
        supplier: 'Relief Labs',
      },
      {
        name: 'Metformin',
        category: 'Antidiabetic',
        batchNumber: 'MET-001',
        expiryDate: new Date('2027-04-10'),
        quantity: 500,
        reorderLevel: 100,
        purchasePrice: 15,
        sellingPrice: 35,
        rackNumber: 'C2',
        stockStatus: 'high',
        supplier: 'Health Plus',
      },
      {
        name: 'Amlodipine',
        category: 'Antihypertensive',
        batchNumber: 'AML-001',
        expiryDate: new Date('2026-10-05'),
        quantity: 250,
        reorderLevel: 80,
        purchasePrice: 12,
        sellingPrice: 28,
        rackNumber: 'D2',
        stockStatus: 'high',
        supplier: 'Pharma Corp',
      },
      {
        name: 'Azithromycin',
        category: 'Antibiotic',
        batchNumber: 'AZI-001',
        expiryDate: new Date('2025-11-20'),
        quantity: 60,
        reorderLevel: 30,
        purchasePrice: 40,
        sellingPrice: 85,
        rackNumber: 'E2',
        stockStatus: 'medium',
        supplier: 'GenMed',
      },
      {
        name: 'Pantoprazole',
        category: 'Antacid',
        batchNumber: 'PAN-001',
        expiryDate: new Date('2026-05-18'),
        quantity: 130,
        reorderLevel: 50,
        purchasePrice: 10,
        sellingPrice: 22,
        rackNumber: 'F2',
        stockStatus: 'medium',
        supplier: 'Allergy Care Associates',
      },
    ];

    // Swap category names for ObjectId references
    const populatedMedicines = medicineData.map(m => ({
      ...m,
      category: categoryMap[m.category] // Replace string with ObjectId
    }));

    const medicines = await Medicine.insertMany(populatedMedicines);

    console.log(`${medicines.length} medicines seeded successfully`);

    // Seed customers
    const customers = await Customer.insertMany([
      {
        name: 'Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh@email.com',
        customerType: 'regular',
        address: '123 Main St',
        city: 'Chennai',
        totalPurchases: 5,
        totalSpent: 2500,
      },
      {
        name: 'Priya Sharma',
        phone: '9876543211',
        email: 'priya@email.com',
        customerType: 'regular',
        address: '456 Oak Ave',
        city: 'Bangalore',
        totalPurchases: 8,
        totalSpent: 4200,
      },
      {
        name: 'Anita Patel',
        phone: '9876543212',
        email: 'anita@email.com',
        customerType: 'walking',
        address: 'Street 5',
        city: 'Hyderabad',
        totalPurchases: 1,
        totalSpent: 500,
      },
    ]);

    console.log('✓ Customers seeded');

    console.log(`
      ╔════════════════════════════════════════╗
      ║    Database Seeding Completed!         ║
      ╠════════════════════════════════════════╣
      ║ Users: ${users.length}                            ║
      ║ Medicines: ${medicines.length}                      ║
      ║ Customers: ${customers.length}                       ║
      ╠════════════════════════════════════════╣
      ║ Test Credentials:                      ║
      ║ Owner: admin / admin123                ║
      ║ Staff: staff / staff123                ║
      ║ Customer: customer / customer123       ║
      ╚════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
    console.log('Done. Disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
