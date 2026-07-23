const mongoose = require('d:/admin ConnectApp/backend/node_modules/mongoose');

mongoose.connect('mongodb+srv://Connect_App:Connect123@cluster0.k1s5dbl.mongodb.net/connect_db?appName=Cluster0')
.then(async () => {
  const User = mongoose.connection.db.collection('users');
  const Product = mongoose.connection.db.collection('products');

  const approvedVendors = await User.find({ role: 'Vendor' }).toArray();
  console.log('Total Vendors in DB:', approvedVendors.length);

  const vendorMap = {};
  approvedVendors.forEach(vendor => {
    const vendorIdStr = vendor._id.toString();
    vendorMap[vendorIdStr] = {
      name: vendor.businessName || vendor.name,
      baseVendorType: vendor.baseVendorType || vendor.vendorType,
      category: vendor.category
    };
    if (vendor.businesses && Array.isArray(vendor.businesses)) {
      vendor.businesses.forEach(biz => {
        if (biz._id) {
          vendorMap[biz._id.toString()] = {
            name: biz.businessName || vendor.businessName || vendor.name,
            baseVendorType: biz.baseVendorType || biz.vendorType || vendor.baseVendorType || vendor.vendorType,
            category: biz.category || vendor.category
          };
        }
      });
    }
  });

  const products = await Product.find({ status: { $ne: 'Unavailable' } }).toArray();
  console.log('Total Products in DB:', products.length);

  const mineralWater = products.find(p => p.name.toLowerCase().includes('mineral water'));
  console.log('Mineral Water raw product:', JSON.stringify(mineralWater, null, 2));

  if (mineralWater) {
    const vendorObj = vendorMap[mineralWater.vendorId];
    console.log('Mineral Water vendor mapped?:', !!vendorObj);
    console.log('Vendor Object:', vendorObj);
  }

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
