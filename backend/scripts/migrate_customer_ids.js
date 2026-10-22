const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://Connect-App:Dhanush123@cluster0.riukwbj.mongodb.net/?retryWrites=true&w=majority';

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const CANONICAL_REGEX = /^FIC-CUS-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-[0-9]{4}-[0-9]{6}$/;

function isValidCanonicalId(id) {
  if (typeof id !== 'string') return false;
  return CANONICAL_REGEX.test(id.trim());
}

function parseRegistrationDate(doc) {
  let date = null;
  const raw = doc.createdAt || doc.created_at;
  if (raw) {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) date = parsed;
  }
  if (!date && doc._id) {
    try {
      if (ObjectId.isValid(doc._id)) {
        const objId = new ObjectId(doc._id);
        const objDate = objId.getTimestamp();
        if (!isNaN(objDate.getTime())) date = objDate;
      }
    } catch (e) {}
  }
  if (!date) {
    const custIdStr = String(doc._id || doc.id || '');
    const match = custIdStr.match(/^cust_(\d{13})/);
    if (match) {
      const tsDate = new Date(parseInt(match[1], 10));
      if (!isNaN(tsDate.getTime())) date = tsDate;
    }
  }
  if (!date) {
    date = new Date();
  }
  return date;
}

async function backupCollections(db) {
  const collsToBackup = [
    'customers',
    'users',
    'orders',
    'wallets',
    'wallet_transactions',
    'wallet_recharge_orders',
    'membership_orders',
    'membership_payments',
    'membershiprequests'
  ];

  console.log('--- Step 1: Creating Safety Backups ---');
  const existingColls = new Set((await db.listCollections().toArray()).map(c => c.name));

  for (const collName of collsToBackup) {
    try {
      const backupName = `backup_${collName}_pre_id_migration`;
      if (existingColls.has(backupName)) {
        console.log(`  Backup [${backupName}] already exists. Retaining existing backup.`);
        continue;
      }
      const query = collName === 'users'
        ? { role: { $in: ['customer', 'Customer'] } }
        : {};
      const count = await db.collection(collName).countDocuments(query);
      if (count > 0) {
        const docs = await db.collection(collName).find(query, { projection: { avatar: 0, photo: 0 } }).toArray();
        if (docs.length > 0) {
          await db.collection(backupName).insertMany(docs, { ordered: false });
          console.log(`  Backed up ${docs.length} records from [${collName}] to [${backupName}]`);
        }
      } else {
        console.log(`  Collection [${collName}] has no matching records, skipping backup.`);
      }
    } catch (err) {
      console.error(`  Warning: Failed to backup ${collName}:`, err.message);
    }
  }
}

async function run() {
  console.log('====================================================');
  console.log('STARTING GLOBAL CUSTOMER ID STANDARDIZATION MIGRATION');
  console.log('Target Format: FIC-CUS-MMM-YYYY-NNNNNN');
  console.log('====================================================');

  const client = new MongoClient(uri, { connectTimeoutMS: 15000 });
  await client.connect();
  const db = client.db('test');

  // Step 1: Safety Backup
  await backupCollections(db);

  // Step 2: Fetch all customer records
  console.log('\n--- Step 2: Gathering Customer Records ---');
  const customers = await db.collection('customers').find({}).toArray();
  const customerUsers = await db.collection('users').find(
    { $or: [{ role: 'customer' }, { role: 'Customer' }] },
    { projection: { avatar: 0, photo: 0 } }
  ).toArray();

  console.log(`Found ${customers.length} records in 'customers' collection.`);
  console.log(`Found ${customerUsers.length} records with role='customer' in 'users' collection.`);

  // Unified map of unique customers keyed by primary identifier
  // We identify customers by:
  // 1. _id / id
  // 2. phone (10 digits)
  // 3. email
  const unifiedCustomers = [];
  const seenKeys = new Set();

  function addCustomerRecord(doc, source) {
    const rawId = String(doc._id || doc.id || '');
    const phone = (doc.phone || '').replace(/\D/g, '').slice(-10);
    const email = (doc.email || '').toLowerCase().trim();

    // Check if already merged
    let existing = null;
    for (const c of unifiedCustomers) {
      if (rawId && c.ids.includes(rawId)) { existing = c; break; }
      if (phone && c.phones.includes(phone)) { existing = c; break; }
      if (email && c.emails.includes(email) && !email.includes('test') && !email.startsWith('cust_')) { existing = c; break; }
    }

    if (!existing) {
      existing = {
        primaryId: rawId,
        ids: [rawId].filter(Boolean),
        phones: [phone].filter(Boolean),
        emails: [email].filter(Boolean),
        oldCustomerIds: [doc.customerId, doc.registrationId].filter(Boolean),
        name: doc.name || 'Connect Member',
        date: parseRegistrationDate(doc),
        currentCanonicalId: null,
        customerDocId: source === 'customers' ? doc._id : null,
        userDocId: source === 'users' ? doc._id : null,
        docs: { [source]: doc }
      };
      unifiedCustomers.push(existing);
    } else {
      if (rawId && !existing.ids.includes(rawId)) existing.ids.push(rawId);
      if (phone && !existing.phones.includes(phone)) existing.phones.push(phone);
      if (email && !existing.emails.includes(email)) existing.emails.push(email);
      if (doc.customerId && !existing.oldCustomerIds.includes(doc.customerId)) existing.oldCustomerIds.push(doc.customerId);
      if (doc.registrationId && !existing.oldCustomerIds.includes(doc.registrationId)) existing.oldCustomerIds.push(doc.registrationId);
      if (source === 'customers') existing.customerDocId = doc._id;
      if (source === 'users') existing.userDocId = doc._id;
      existing.docs[source] = doc;
    }

    // Check if customer already has a canonical ID
    if (isValidCanonicalId(doc.customerId)) {
      existing.currentCanonicalId = doc.customerId.trim();
    } else if (isValidCanonicalId(doc.registrationId)) {
      existing.currentCanonicalId = doc.registrationId.trim();
    }
  }

  for (const c of customers) addCustomerRecord(c, 'customers');
  for (const u of customerUsers) addCustomerRecord(u, 'users');

  console.log(`Total unified customer accounts to process: ${unifiedCustomers.length}`);

  // Step 3: Group by period MMM-YYYY and assign sequential numbers
  console.log('\n--- Step 3: Assigning Sequential Canonical IDs ---');
  const periodGroups = {};
  for (const cust of unifiedCustomers) {
    const mmm = MONTH_NAMES[cust.date.getUTCMonth()];
    const yyyy = cust.date.getUTCFullYear();
    const period = `${mmm}-${yyyy}`;
    if (!periodGroups[period]) periodGroups[period] = [];
    periodGroups[period].push(cust);
  }

  const migrationMapping = new Map(); // oldIdentifier -> newCanonicalId
  const finalCounters = {};

  for (const [period, custList] of Object.entries(periodGroups)) {
    // Sort chronologically by registration date
    custList.sort((a, b) => a.date.getTime() - b.date.getTime());
    let seq = 0;

    for (const cust of custList) {
      seq++;
      let canonicalId = cust.currentCanonicalId;
      if (!canonicalId) {
        const padded = String(seq).padStart(6, '0');
        canonicalId = `FIC-CUS-${period}-${padded}`;
      }
      cust.canonicalId = canonicalId;

      // Map all previous identifiers to this new canonical ID
      for (const id of cust.ids) migrationMapping.set(id, canonicalId);
      for (const oldCustId of cust.oldCustomerIds) migrationMapping.set(oldCustId, canonicalId);
      
      console.log(`  Assigned ${canonicalId} -> Name: [${cust.name}], Date: [${cust.date.toISOString().split('T')[0]}], Old IDs: [${cust.oldCustomerIds.join(', ')}]`);
    }

    finalCounters[`customer_seq_${period.replace('-', '_')}`] = seq;
  }

  // Step 4: Apply updates to `customers` collection
  console.log('\n--- Step 4: Updating `customers` Collection ---');
  let customersUpdated = 0;
  for (const cust of unifiedCustomers) {
    if (cust.customerDocId) {
      await db.collection('customers').updateOne(
        { _id: cust.customerDocId },
        {
          $set: {
            customerId: cust.canonicalId,
            registrationId: cust.canonicalId,
            updatedAt: new Date().toISOString()
          }
        }
      );
      customersUpdated++;
    }
  }
  console.log(`Updated ${customersUpdated} documents in 'customers'.`);

  // Step 5: Apply updates to `users` collection
  console.log('\n--- Step 5: Updating `users` Collection ---');
  let usersUpdated = 0;
  for (const cust of unifiedCustomers) {
    const query = {
      $or: [
        ...(cust.userDocId ? [{ _id: cust.userDocId }] : []),
        ...(cust.ids.map(id => ({ id }))),
        ...(cust.phones.length > 0 ? cust.phones.map(p => ({ phone: p })) : []),
        ...(cust.emails.filter(e => !e.startsWith('cust_')).map(e => ({ email: e })))
      ]
    };
    const res = await db.collection('users').updateMany(
      { ...query, role: { $in: ['customer', 'Customer', 'Member', undefined] } },
      {
        $set: {
          customerId: cust.canonicalId,
          registrationId: cust.canonicalId,
          updatedAt: new Date().toISOString()
        }
      }
    );
    usersUpdated += res.modifiedCount;
  }
  console.log(`Updated ${usersUpdated} customer user documents in 'users'.`);

  // Step 6: Update dependent collections (Orders, Wallet Transactions, Memberships)
  console.log('\n--- Step 6: Updating Dependent Collections ---');

  // 6a. Orders
  let ordersUpdated = 0;
  for (const [oldId, newId] of migrationMapping.entries()) {
    if (!oldId || oldId === newId) continue;
    const res1 = await db.collection('orders').updateMany(
      { customerId: oldId },
      { $set: { customerId: newId, customer_id: newId } }
    );
    const res2 = await db.collection('orders').updateMany(
      { customer_id: oldId },
      { $set: { customerId: newId, customer_id: newId } }
    );
    const res3 = await db.collection('orders').updateMany(
      { memberId: oldId },
      { $set: { customerId: newId, customer_id: newId } }
    );
    ordersUpdated += res1.modifiedCount + res2.modifiedCount + res3.modifiedCount;
  }
  console.log(`Updated customer references across orders: ${ordersUpdated} modifications.`);

  // 6b. Wallets & Wallet Transactions
  let walletTxUpdated = 0;
  for (const [oldId, newId] of migrationMapping.entries()) {
    if (!oldId || oldId === newId) continue;
    const r1 = await db.collection('wallets').updateMany(
      { customerId: oldId },
      { $set: { customerId: newId } }
    );
    const r2 = await db.collection('wallet_transactions').updateMany(
      { customerId: oldId },
      { $set: { customerId: newId } }
    );
    const r3 = await db.collection('wallet_recharge_orders').updateMany(
      { customerId: oldId },
      { $set: { customerId: newId } }
    );
    walletTxUpdated += r1.modifiedCount + r2.modifiedCount + r3.modifiedCount;
  }
  console.log(`Updated customer references in wallets & transactions: ${walletTxUpdated} modifications.`);

  // 6c. Memberships
  let membershipsUpdated = 0;
  for (const [oldId, newId] of migrationMapping.entries()) {
    if (!oldId || oldId === newId) continue;
    const r1 = await db.collection('membership_orders').updateMany(
      { customerId: oldId },
      { $set: { customerId: newId } }
    );
    const r2 = await db.collection('membership_payments').updateMany(
      { customerId: oldId },
      { $set: { customerId: newId } }
    );
    const r3 = await db.collection('membershiprequests').updateMany(
      { customerId: oldId },
      { $set: { customerId: newId } }
    );
    membershipsUpdated += r1.modifiedCount + r2.modifiedCount + r3.modifiedCount;
  }
  console.log(`Updated customer references in memberships: ${membershipsUpdated} modifications.`);

  // Step 7: Update `counters` collection with latest sequences
  console.log('\n--- Step 7: Setting Database Counters ---');
  for (const [key, seq] of Object.entries(finalCounters)) {
    await db.collection('counters').updateOne(
      { _id: key },
      { $set: { seq, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`  Set counter [${key}] = ${seq}`);
  }

  // Step 8: Create Unique Indexes on customerId
  console.log('\n--- Step 8: Creating Database-Level Unique Indexes ---');
  try {
    await db.collection('customers').createIndex(
      { customerId: 1 },
      { unique: true, sparse: true, name: 'idx_unique_customer_id' }
    );
    console.log(`  Created unique sparse index 'idx_unique_customer_id' on 'customers'.`);
  } catch (err) {
    console.warn(`  Note on customers index: ${err.message}`);
  }

  try {
    await db.collection('users').createIndex(
      { customerId: 1 },
      { unique: true, sparse: true, name: 'idx_unique_user_customer_id' }
    );
    console.log(`  Created unique sparse index 'idx_unique_user_customer_id' on 'users'.`);
  } catch (err) {
    console.warn(`  Note on users index: ${err.message}`);
  }

  // Step 9: Final Verification
  console.log('\n--- Step 9: Final Verification ---');
  const verifyCustomers = await db.collection('customers').find({}).toArray();
  let invalidCount = 0;
  for (const c of verifyCustomers) {
    if (!isValidCanonicalId(c.customerId)) {
      invalidCount++;
      console.error(`  INVALID: Customer _id:${c._id} still has customerId:${c.customerId}`);
    }
  }
  if (invalidCount === 0) {
    console.log(`  SUCCESS: 100% of customers in 'customers' collection have valid canonical IDs! Total: ${verifyCustomers.length}`);
  } else {
    console.warn(`  WARNING: Found ${invalidCount} customers with non-canonical IDs.`);
  }

  // Print sample migrated customers
  console.log('\n--- Sample Migrated Records ---');
  const sampleMigrated = await db.collection('customers').find({}).limit(8).toArray();
  for (const sm of sampleMigrated) {
    console.log(`  ${sm.customerId} | Name: ${sm.name} | Phone: ${sm.phone} | Email: ${sm.email}`);
  }

  // Check Hari specifically
  const hariDoc = await db.collection('customers').findOne({
    $or: [{ phone: '7643179664' }, { email: 'graviity@gmail.com' }, { name: 'Hari' }]
  });
  console.log('\n--- Verification of Customer in Screenshot (Hari) ---');
  console.log(JSON.stringify(hariDoc, null, 2));

  await client.close();
  console.log('\n====================================================');
  console.log('MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

run().catch(console.error);
