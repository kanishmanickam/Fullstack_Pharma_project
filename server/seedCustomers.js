/**
 * seedCustomers.js
 * ─────────────────────────────────────────────────────────────────
 * Seeds realistic Customer entries for the Customers page.
 * Replaces existing dummy customers with richer, realistic data.
 *
 * Run:  cd server && node seedCustomers.js
 * ─────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer } from './models/index.js';

dotenv.config();

const customers = [
    {
        name: 'Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh.k@example.com',
        customerType: 'regular',
        address: '123 Main St, Anna Nagar',
        city: 'Chennai',
        totalPurchases: 12,
        totalSpent: 4500,
    },
    {
        name: 'Priya Sharma',
        phone: '9876543211',
        email: 'priya.sharma99@example.com',
        customerType: 'regular',
        address: '456 Oak Avenue, T Nagar',
        city: 'Chennai',
        totalPurchases: 8,
        totalSpent: 3200,
    },
    {
        name: 'Anita Patel',
        phone: '9876543212',
        email: 'anita.p@example.com',
        customerType: 'walking',
        address: '789 Pine Road, Velachery',
        city: 'Chennai',
        totalPurchases: 2,
        totalSpent: 850,
    },
    {
        name: 'Mohammed Ali',
        phone: '9876543213',
        email: 'm.ali@example.com',
        customerType: 'regular',
        address: '321 Cedar Lane, Adyar',
        city: 'Chennai',
        totalPurchases: 24,
        totalSpent: 12450,
    },
    {
        name: 'Sneha Reddy',
        phone: '9876543214',
        email: 'sneha.r@example.com',
        customerType: 'walking',
        address: '654 Elm Street, OMR',
        city: 'Chennai',
        totalPurchases: 1,
        totalSpent: 230,
    },
    {
        name: 'Vikram Singh',
        phone: '9876543215',
        email: 'vikram.s@example.com',
        customerType: 'regular',
        address: '987 Birch Blvd, Guindy',
        city: 'Chennai',
        totalPurchases: 15,
        totalSpent: 8900,
    },
    {
        name: 'Lakshmi Nair',
        phone: '9876543216',
        email: 'lakshmi.nair@example.com',
        customerType: 'regular',
        address: '147 Maple Drive, Mylapore',
        city: 'Chennai',
        totalPurchases: 32,
        totalSpent: 18750,
    },
    {
        name: 'Suresh Menon',
        phone: '9876543217',
        email: 'suresh.m@example.com',
        customerType: 'walking',
        address: '258 Walnut Way, Nungambakkam',
        city: 'Chennai',
        totalPurchases: 3,
        totalSpent: 1120,
    },
    {
        name: 'Karthik Raja',
        phone: '9876543218',
        email: 'karthik.r@example.com',
        customerType: 'regular',
        address: '369 Ash Court, Porur',
        city: 'Chennai',
        totalPurchases: 19,
        totalSpent: 7640,
    },
    {
        name: 'Deepa Krishnan',
        phone: '9876543219',
        email: 'deepa.k@example.com',
        customerType: 'walking',
        address: '753 Spruce Circle, Tambaram',
        city: 'Chennai',
        totalPurchases: 4,
        totalSpent: 1580,
    },
    {
        name: 'Arjun Desai',
        phone: '9876543220',
        email: 'arjun.d@example.com',
        customerType: 'regular',
        address: '951 Fir Place, Chromepet',
        city: 'Chennai',
        totalPurchases: 11,
        totalSpent: 4200,
    },
    {
        name: 'Meera Iyer',
        phone: '9876543221',
        email: 'meera.i@example.com',
        customerType: 'regular',
        address: '159 Poplar Road, Pallavaram',
        city: 'Chennai',
        totalPurchases: 27,
        totalSpent: 14300,
    },
    {
        name: 'Rahul Verma',
        phone: '9876543222',
        email: 'rahul.v@example.com',
        customerType: 'walking',
        address: '357 Willow Ave, Alandur',
        city: 'Chennai',
        totalPurchases: 2,
        totalSpent: 640,
    },
    {
        name: 'Pooja Bhatt',
        phone: '9876543223',
        email: 'pooja.b@example.com',
        customerType: 'regular',
        address: '852 Chestnut Blvd, Egmore',
        city: 'Chennai',
        totalPurchases: 16,
        totalSpent: 6850,
    },
    {
        name: 'Ravi Shankar',
        phone: '9876543224',
        email: 'ravi.s@example.com',
        customerType: 'walking',
        address: '456 Sycamore Lane, Kilpauk',
        city: 'Chennai',
        totalPurchases: 1,
        totalSpent: 150,
    }
];

const seedCustomers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        // Clear existing customers
        await Customer.deleteMany({});
        console.log('Existing customers cleared');

        const created = await Customer.insertMany(customers);
        console.log(`${created.length} customers seeded successfully:`);
        created.forEach((c) => console.log(`  - ${c.name} (${c.customerType})`));

        await mongoose.disconnect();
        console.log('Done. Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seedCustomers();
