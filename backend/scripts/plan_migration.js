const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI ;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function parseRegistrationDate(doc) {
  let date = null;
  // 1. Try createdAt / created_at
  const raw = doc.createdAt || doc.created_at;
  if (raw) {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) date = parsed;
  }
  // 2. Try parsing timestamp from _id if it's an ObjectId
  if (!date && doc._id) {
    try {
      if (ObjectId.isValid(doc._id)) {
        const objId = new ObjectId(doc._id);
        const objDate = objId.getTimestamp();
        if (!isNaN(objDate.getTime())) date = objDate;
      }
    } catch (e) {}
  }
  // 3. Try parsing cust_ timestamp if _id or id starts with cust_
  if (!date) {
    const custIdStr = String(doc._id || doc.id || '');
    const match = custIdStr.match(/^cust_(\d{13})/);
    if (match) {
      const tsDate = new Date(parseInt(match[1], 10));
      if (!isNaN(tsDate.getTime())) date = tsDate;
    }
  }
  // 4. Default fallback if truly missing: use current date (October 2026)
  if (!date) {
    date = new Date();
  }
  return date;
}

async function run() {
  const client = new MongoClient(uri, { connectTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('test');

  const customers = await db.collection('customers').find({}).toArray();
  console.log(`Found ${customers.length} records in 'customers' collection:`);

  // Group by (MMM-YYYY)
  const grouped = {};
  for (const c of customers) {
    const date = parseRegistrationDate(c);
    const mmm = MONTHS[date.getUTCMonth()];
    const yyyy = date.getUTCFullYear();
    const period = `${mmm}-${yyyy}`;
    if (!grouped[period]) grouped[period] = [];
    grouped[period].push({ doc: c, date });
  }

  for (const [period, list] of Object.entries(grouped)) {
    console.log(`\nPeriod [${period}]: ${list.length} customers`);
    // Sort chronologically by date
    list.sort((a, b) => a.date.getTime() - b.date.getTime());
    let seq = 1;
    for (const item of list) {
      const padded = String(seq++).padStart(6, '0');
      const newId = `FIC-CUS-${period}-${padded}`;
      console.log(`  ${newId} <- Old custId: [${item.doc.customerId}], Old regId: [${item.doc.registrationId}], _id: [${item.doc._id}], name: [${item.doc.name}], email: [${item.doc.email}], phone: [${item.doc.phone}] (date: ${item.date.toISOString()})`);
    }
  }

  await client.close();
}

run().catch(console.error);
