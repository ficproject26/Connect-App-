const mongoose = require('d:/admin ConnectApp/backend/node_modules/mongoose');

mongoose.connect('mongodb+srv://Connect_App:Connect123@cluster0.k1s5dbl.mongodb.net/connect_db?appName=Cluster0')
.then(async () => {
  const collection = mongoose.connection.db.collection('products');
  
  // Patch Mineral water specifically
  const res1 = await collection.updateMany(
    { name: { $regex: /mineral water/i } },
    { $set: { subNavbarCategory: 'Products', category: 'Products', subcategory: 'Waterbottle' } }
  );
  console.log('Mineral water patched count:', res1.modifiedCount);

  // Patch all products missing subNavbarCategory
  const allProds = await collection.find({}).toArray();
  let updatedCount = 0;
  for (const p of allProds) {
    if (!p.subNavbarCategory) {
      let subNav = 'Products';
      const cat = (p.category || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      
      if (['hospital', 'doctor', 'service', 'developer', 'repair', 'recharge', 'consulting', 'taxi', 'cab'].some(k => cat.includes(k) || name.includes(k))) {
        subNav = 'Services';
      } else if (['burger', 'pizza', 'dosa', 'idli', 'biryani', 'food', 'restaurant', 'cafe'].some(k => cat.includes(k) || name.includes(k))) {
        subNav = 'Food';
      } else if (['hotel', 'room', 'resort', 'stay'].some(k => cat.includes(k) || name.includes(k))) {
        subNav = 'Stay';
      } else if (['bus', 'travel', 'flight'].some(k => cat.includes(k) || name.includes(k))) {
        subNav = 'Travel';
      } else if (['job', 'developer', 'hiring'].some(k => cat.includes(k) || name.includes(k))) {
        subNav = 'Jobs';
      } else if (['grocery', 'rice', 'egg', 'vegetable', 'fruit', 'dairy'].some(k => cat.includes(k) || name.includes(k))) {
        subNav = 'Daily Needs';
      }
      
      await collection.updateOne({ _id: p._id }, { $set: { subNavbarCategory: subNav } });
      updatedCount++;
    }
  }
  console.log('Total products patched with subNavbarCategory:', updatedCount);
  process.exit(0);
}).catch(err => {
  console.error('Patch Error:', err);
  process.exit(1);
});
