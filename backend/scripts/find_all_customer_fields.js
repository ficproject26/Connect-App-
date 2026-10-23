const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI ;

async function run() {
  const client = new MongoClient(uri, { connectTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('test');
  
  const collections = await db.listCollections().toArray();
  console.log('Checking all collections for customerId / customer_id / registrationId...');
  
  for (const coll of collections) {
    const name = coll.name;
    const countCustId = await db.collection(name).countDocuments({
      $or: [
        { customerId: { $exists: true, $ne: null } },
        { customer_id: { $exists: true, $ne: null } },
        { registrationId: { $exists: true, $ne: null } },
        { memberId: { $regex: /cust|CUST|FIC-/i } }
      ]
    }).catch(() => 0);

    if (countCustId > 0) {
      console.log(`Collection [${name}]: ${countCustId} documents match customer ID fields.`);
      const sample = await db.collection(name).find({
        $or: [
          { customerId: { $exists: true, $ne: null } },
          { customer_id: { $exists: true, $ne: null } },
          { registrationId: { $exists: true, $ne: null } },
          { memberId: { $regex: /cust|CUST|FIC-/i } }
        ]
      }).limit(2).toArray();
      console.log(`  Sample from [${name}]:`, sample.map(s => {
        return { _id: s._id, customerId: s.customerId, customer_id: s.customer_id, registrationId: s.registrationId, memberId: s.memberId, name: s.name || s.customer_name };
      }));
    }
  }

  await client.close();
}

run().catch(console.error);
