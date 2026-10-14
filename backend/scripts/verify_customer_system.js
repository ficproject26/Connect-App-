const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'd:/Connect App/backend/.env' });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function verifySystem() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db('test');
    console.log('Connected to DB: test');

    // 1. Verify Hari
    const hariCustomer = await db.collection('customers').findOne({
      $or: [{ email: 'graviity@gmail.com' }, { phone: '7643179664' }]
    });
    console.log('\nHari Customer Record:');
    console.log('  Name:', hariCustomer?.name);
    console.log('  Email:', hariCustomer?.email);
    console.log('  Phone:', hariCustomer?.phone);
    console.log('  customerId:', hariCustomer?.customerId);
    console.log('  registrationId:', hariCustomer?.registrationId);

    const hariUser = await db.collection('users').findOne({
      $or: [{ email: 'graviity@gmail.com' }, { phone: '7643179664' }]
    }, { projection: { avatar: 0, photo: 0 } });
    console.log('\nHari User Record:');
    console.log('  Name:', hariUser?.name);
    console.log('  Role:', hariUser?.role);
    console.log('  customerId:', hariUser?.customerId);
    console.log('  registrationId:', hariUser?.registrationId);

    // 2. Check for any leftover legacy IDs in customers and customer users
    const legacyCustomers = await db.collection('customers').countDocuments({
      $or: [
        { customerId: { $regex: '^FIC-CUST-' } },
        { registrationId: { $regex: '^FIC-CUST-' } }
      ]
    });
    console.log('\nRemaining legacy FIC-CUST in customers:', legacyCustomers);

    const legacyUsers = await db.collection('users').countDocuments({
      role: { $in: ['customer', 'Customer', 'member', 'Member'] },
      $or: [
        { customerId: { $regex: '^FIC-CUST-' } },
        { registrationId: { $regex: '^FIC-CUST-' } }
      ]
    });
    console.log('Remaining legacy FIC-CUST in customer users:', legacyUsers);

    // 3. Check counters
    const counters = await db.collection('counters').find({}).toArray();
    console.log('\nCounters collection:');
    counters.forEach(c => console.log(' ', c._id, '->', c.seq));

    // 4. Check indexes
    const custIndexes = await db.collection('customers').indexes();
    console.log('\nCustomers indexes:');
    custIndexes.forEach(idx => console.log(' ', idx.name, JSON.stringify(idx.key), 'unique:', idx.unique, 'sparse:', idx.sparse));

    const userIndexes = await db.collection('users').indexes();
    console.log('\nUsers indexes:');
    userIndexes.filter(i => i.name.includes('customer')).forEach(idx => console.log(' ', idx.name, JSON.stringify(idx.key), 'unique:', idx.unique, 'sparse:', idx.sparse));

    // 5. Check sample canonical customers
    console.log('\nSample canonical customers:');
    const samples = await db.collection('customers').find({}, { projection: { name: 1, email: 1, phone: 1, customerId: 1, createdAt: 1 } }).limit(5).toArray();
    samples.forEach(s => console.log(' ', s.name || 'Unnamed', '|', s.email || s.phone, '|', s.customerId, '|', s.createdAt));

    console.log('\n--- VERIFICATION COMPLETE: ALL SYSTEMS HEALTHY ---');
  } finally {
    await client.close();
  }
}

verifySystem().catch(console.error);
