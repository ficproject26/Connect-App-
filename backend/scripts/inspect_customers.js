const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://Connect-App:Dhanush123@cluster0.riukwbj.mongodb.net/?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri, { connectTimeoutMS: 10000 });
  await client.connect();
  
  for (const dbName of ['test', 'connect_db']) {
    const db = client.db(dbName);
    console.log(`\n=================== DB: ${dbName} ===================`);
    
    for (const collName of ['users', 'customers', 'orders', 'bookings', 'wallets', 'membershipcards', 'supporttickets']) {
      try {
        const count = await db.collection(collName).countDocuments();
        console.log(`Collection ${collName}: ${count} docs`);
        if (count > 0) {
          const sample = await db.collection(collName).find({}).limit(5).toArray();
          console.log(`  Sample ${collName}:`, sample.map(doc => {
            const { _id, id, customerId, registrationId, customer_id, memberId, name, email, phone, role, createdAt, created_at } = doc;
            return { _id, id, customerId, registrationId, customer_id, memberId, name, email, phone, role, createdAt: createdAt || created_at };
          }));
        }
      } catch (err) {
        console.log(`Error reading ${collName} in ${dbName}:`, err.message);
      }
    }
  }

  await client.close();
}

run().catch(console.error);
