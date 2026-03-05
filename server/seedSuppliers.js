// Seed script — populates sample Suppliers from live DB snapshot
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Supplier } from './models/supplierModels.js';

dotenv.config();

const suppliers = [
    {
        "supplier_name": "MedSupply India",
        "contact_info": {
            "phone": "+919876543210",
            "email": "contact@medsupply.com",
            "address": "123 Medical Street, Anna Nagar",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600040"
        },
        "delivery_performance_score": 8.5,
        "total_orders": 45,
        "successful_deliveries": 42,
        "medicine_categories": [
            "Analgesic",
            "Antibiotic",
            "Anti-inflammatory"
        ],
        "is_active": true,
        "notes": "Reliable supplier with fast delivery"
    },
    {
        "supplier_name": "PharmaHub Distributors",
        "contact_info": {
            "phone": "+919988776655",
            "email": "sales@pharmahub.in",
            "address": "456 Healthcare Avenue, T Nagar",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600017"
        },
        "delivery_performance_score": 7.2,
        "total_orders": 32,
        "successful_deliveries": 28,
        "medicine_categories": [
            "Topical",
            "Antacid",
            "Vitamin"
        ],
        "is_active": true,
        "notes": "Specializes in injectable medicines"
    },
    {
        "supplier_name": "HealthCare Solutions",
        "contact_info": {
            "phone": "+918765432109",
            "email": "info@healthcaresol.com",
            "address": "789 Wellness Road, Velachery",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600042"
        },
        "delivery_performance_score": 9.1,
        "total_orders": 67,
        "successful_deliveries": 65,
        "medicine_categories": [
            "Cough Suppressant",
            "Antihistamine",
            "Analgesic"
        ],
        "is_active": true,
        "notes": "Premium quality medicines, excellent track record"
    },
    {
        "supplier_name": "Apollo MedSource",
        "contact_info": {
            "phone": "+917654321098",
            "email": "orders@apollomedsource.com",
            "address": "321 Medical Plaza, Adyar",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600020"
        },
        "delivery_performance_score": 8.8,
        "total_orders": 54,
        "successful_deliveries": 52,
        "medicine_categories": [
            "Tablet",
            "Injection",
            "Drops"
        ],
        "is_active": true,
        "notes": "Wide range of medicines, competitive pricing"
    },
    {
        "supplier_name": "MediCare Wholesale",
        "contact_info": {
            "phone": "+916543210987",
            "email": "support@medicarewholesale.in",
            "address": "555 Supply Chain Street, Porur",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600116"
        },
        "delivery_performance_score": 6.5,
        "total_orders": 28,
        "successful_deliveries": 22,
        "medicine_categories": [
            "Topical",
            "Antibiotic",
            "Antihistamine"
        ],
        "is_active": true,
        "notes": "Budget-friendly options, occasional delays"
    }
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
        created.forEach((s) => console.log(`  - ${s.supplier_name} (${s._id})`));

        await mongoose.disconnect();
        console.log('Done. Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seedSuppliers();
