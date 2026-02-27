import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/medistock')
  .then(async () => {
    console.log('\n📊 MongoDB Database Status:\n');
    console.log('Database: medistock');
    console.log('Status: Connected ✅\n');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`Total Collections: ${collections.length}\n`);
    
    if (collections.length === 0) {
      console.log('⚠️  No collections found. Database is empty.');
      console.log('\nTo populate the database, run: node seed.js');
    } else {
      console.log('Collections found:');
      
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
      }
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
