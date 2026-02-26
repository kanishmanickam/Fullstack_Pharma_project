// Seed script — populates 5 sample Suppliers
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Supplier } from './models/index.js';

dotenv.config();

const suppliers = [
    { name: 'Sun Pharma', contact: 'sunpharma@example.com' },
    { name: 'Cipla Ltd', contact: 'cipla@example.com' },
    { name: 'Dr. Reddy\'s Laboratories', contact: 'drreddy@example.com' },
    { name: 'Lupin Limited', contact: 'lupin@example.com' },
    { name: 'Aurobindo Pharma', contact: 'aurobindo@example.com' },
];

const seedSuppliers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        // Clear existing suppliers (optional)
        await Supplier.deleteMany({});
        console.log('Existing suppliers cleared');

        const created = await Supplier.insertMany(suppliers);
        console.log(`${created.length} suppliers seeded successfully:`);
        created.forEach((s) => console.log(`  - ${s.name} (${s._id})`));

        await mongoose.disconnect();
        console.log('Done. Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seedSuppliers();
