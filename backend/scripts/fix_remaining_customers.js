const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI ;

async function fixRemaining() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('test');

  const unassigned = await db.collection('customers').find({
    $or: [
      { customerId: { $exists: false } },
      { customerId: null },
      { customerId: { $not: /^FIC-CUS-/ } }
    ]
  }).toArray();

  console.log(`Found ${unassigned.length} unassigned customers in 'customers' collection:`);

  // Atomic increment for OCT-2026 counter
  for (const c of unassigned) {
    const counterDoc = await db.collection('counters').findOneAndUpdate(
      { _id: 'customer_seq_OCT_2026' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after' }
    );
    const seq = (counterDoc && counterDoc.seq) ? counterDoc.seq : counterDoc.value.seq;
    const newId = `FIC-CUS-OCT-2026-${String(seq).padStart(6, '0')}`;
    
    await db.collection('customers').updateOne(
      { _id: c._id },
      { $set: { customerId: newId, registrationId: newId, updatedAt: new Date().toISOString() } }
    );
    console.log(`Assigned ${newId} to customer _id:${c._id} (name: ${c.name})`);
  }

  // Also check users collection for any customer with missing or invalid customerId
  const unassignedUsers = await db.collection('users').find({
    role: { $in: ['customer', 'Customer'] },
    $or: [
      { customerId: { $exists: false } },
      { customerId: null },
      { customerId: { $not: /^FIC-CUS-/ } }
    ]
  }).toArray();

  console.log(`Found ${unassignedUsers.length} unassigned customer users in 'users' collection:`);
  for (const u of unassignedUsers) {
    // Check if matched customer has ID
    const match = await db.collection('customers').findOne({
      $or: [{ _id: u._id }, { id: u.id }, { phone: u.phone }, { email: u.email }]
    });
    let newId = match ? match.customerId : null;
    if (!newId || !newId.startsWith('FIC-CUS-')) {
      const counterDoc = await db.collection('counters').findOneAndUpdate(
        { _id: 'customer_seq_OCT_2026' },
        { $inc: { seq: 1 } },
        { returnDocument: 'after' }
      );
      const seq = (counterDoc && counterDoc.seq) ? counterDoc.seq : counterDoc.value.seq;
      newId = `FIC-CUS-OCT-2026-${String(seq).padStart(6, '0')}`;
    }
    await db.collection('users').updateOne(
      { _id: u._id },
      { $set: { customerId: newId, registrationId: newId, updatedAt: new Date().toISOString() } }
    );
    console.log(`Assigned ${newId} to user _id:${u._id} (name: ${u.name})`);
  }

  await client.close();
}

fixRemaining().catch(console.error);
