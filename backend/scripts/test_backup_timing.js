const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI ;

async function testBackup() {
  const client = new MongoClient(uri, { connectTimeoutMS: 5000 });
  await client.connect();
  const db = client.db('test');
  
  console.log('Listing collections...');
  const colls = (await db.listCollections().toArray()).map(c => c.name);
  console.log('Collections count:', colls.length);

  for (const name of ['users', 'orders', 'wallets', 'wallet_transactions', 'membership_orders']) {
    console.log(`Checking [${name}]...`);
    const t0 = Date.now();
    const query = name === 'users' ? { role: { $in: ['customer', 'Customer'] } } : {};
    const count = await db.collection(name).countDocuments(query);
    console.log(`  Count [${name}]: ${count} (took ${Date.now() - t0}ms)`);
    const t1 = Date.now();
    const docs = await db.collection(name).find(query, { projection: { avatar: 0, photo: 0 } }).toArray();
    console.log(`  Fetched [${name}]: ${docs.length} docs (took ${Date.now() - t1}ms)`);
  }

  await client.close();
  console.log('Done testBackup!');
}

testBackup().catch(console.error);
