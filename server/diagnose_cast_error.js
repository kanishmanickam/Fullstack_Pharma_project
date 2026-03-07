import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Medicine, Category } from './models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medistock';

async function diagnose() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const medicines = await Medicine.find();
        console.log(`Checking ${medicines.length} medicines...`);

        for (const med of medicines) {
            try {
                console.log(`Checking medicine: ${med.name} (ID: ${med._id}, Cat ID: ${med.category})`);
                await Medicine.findById(med._id).populate('category');
                console.log(`✓ ${med.name} settled.`);
            } catch (err) {
                console.error(`❌ ERROR on medicine: ${med.name}`);
                console.error(err.message);
            }
        }

        console.log('Diagnosis complete.');
        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
