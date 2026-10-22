const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://Connect-App:Dhanush123@cluster0.riukwbj.mongodb.net/?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri, { connectTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('test');

  console.log('Testing users cursor iteration with batchSize 20:');
  const cursor = db.collection('users').find({}).batchSize(20);
  let count = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    count++;
    const str = JSON.stringify(doc);
    if (str.length > 50000 || count % 20 === 0) {
      console.log(`Doc #${count}: id=${doc._id || doc.id}, role=${doc.role}, name=${doc.name}, size=${str.length} chars`);
    }
  }
  console.log(`Finished iterating ${count} users successfully!`);
  await client.close();
}

run().catch(console.error);
