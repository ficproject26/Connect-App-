const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI ;

async function run() {
  const client = new MongoClient(uri, { connectTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('test');

  const customerUsers = await db.collection('users').find({
    $or: [{ role: 'customer' }, { role: 'Customer' }]
  }).toArray();
  const customers = await db.collection('customers').find({}).toArray();

  console.log(`Users with role=customer: ${customerUsers.length}`);
  console.log(`Customers collection docs: ${customers.length}`);

  const customerIdsInCustomers = new Set(customers.map(c => String(c.id || c._id)));
  const unlinked = customerUsers.filter(u => !customerIdsInCustomers.has(String(u.id || u._id)));
  console.log(`Users with role=customer not in customers collection: ${unlinked.length}`);
  for (const u of unlinked) {
    console.log(`  Unlinked user: _id:${u._id} id:${u.id} phone:${u.phone} email:${u.email} name:${u.name} custId:${u.customerId}`);
  }

  await client.close();
}

run().catch(console.error);
