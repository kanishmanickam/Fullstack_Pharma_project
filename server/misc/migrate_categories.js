import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medistock';

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const medicinesCol = db.collection('medicines');
        const categoriesCol = db.collection('categories');

        const medicines = await medicinesCol.find({}).toArray();
        console.log(`Found ${medicines.length} medicines.`);

        const categoryMap = {}; // name -> _id

        for (const med of medicines) {
            if (typeof med.category === 'string') {
                let categoryId;
                if (categoryMap[med.category]) {
                    categoryId = categoryMap[med.category];
                } else {
                    // Check if exists in DB
                    let catDoc = await categoriesCol.findOne({ name: med.category });
                    if (!catDoc) {
                        console.log(`Creating category: ${med.category}`);
                        const res = await categoriesCol.insertOne({
                            name: med.category,
                            description: `${med.category} category`,
                            isApproved: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        categoryId = res.insertedId;
                    } else {
                        categoryId = catDoc._id;
                    }
                    categoryMap[med.category] = categoryId;
                }

                // Update medicine
                await medicinesCol.updateOne(
                    { _id: med._id },
                    { $set: { category: categoryId } }
                );
                console.log(`Updated ${med.name}: category set to ${categoryId} (${med.category})`);
            }
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
