const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://Connect-App:Dhanush123@cluster0.riukwbj.mongodb.net/?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri, { connectTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('test');
  
  const customerUsers = await db.collection('users').find({
    $or: [{ role: 'customer' }, { role: 'Customer' }, { role: 'Member' }, { customerId: { $exists: true, $ne: null } }]
  }).toArray();
  console.log('Customer users in `users` collection:', customerUsers.length);
  for (const u of customerUsers) {
    console.log(`[users] _id:${u._id} id:${u.id} phone:${u.phone} email:${u.email} name:${u.name} custId:${u.customerId} regId:${u.registrationId} createdAt:${u.createdAt}`);
  }

  const customersColl = await db.collection('customers').find({}).toArray();
  console.log('\nTotal in `customers` collection:', customersColl.length);
  for (const c of customersColl) {
    console.log(`[customers] _id:${c._id} id:${c.id} phone:${c.phone} email:${c.email} name:${c.name} custId:${c.customerId} regId:${c.registrationId} createdAt:${c.createdAt}`);
  }

  // Check how many orders have customerId or customer_id
  const ordersWithCustId = await db.collection('orders').find({
    $or: [{ customerId: { $exists: true, $ne: null } }, { customer_id: { $exists: true, $ne: null } }]
  }).toArray();
  console.log('\nOrders with customerId/customer_id:', ordersWithCustId.length);
  const distinctOrderCustIds = [...new Set(ordersWithCustId.map(o => o.customerId || o.customer_id).filter(Boolean))];
  console.log('Distinct customer IDs in orders:', distinctOrderCustIds);

  await client.close();
}

run().catch(console.error);
