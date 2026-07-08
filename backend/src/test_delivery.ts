import { db, Vendor, DeliveryPartner, Order, DeliveryAssignment } from './db';
import { runAutoAssignment } from './routes/orders';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  // Wait for database manager to asynchronously attempt PG connection/fallback
  console.log('[Test]: Waiting 4 seconds for database driver to initialize...');
  await sleep(4000);

  console.log('=== STARTING LOGISTICS MODULE INTEGRATION TESTS ===');
  console.log(`Database engine in use: ${db.getEngineType()}`);

  const testSuffix = Date.now().toString();
  const testVendorId = `v_test_${testSuffix}`;
  const testRider1Id = `dp_near_${testSuffix}`;
  const testRider2Id = `dp_far_${testSuffix}`;
  const testOrderId = `ORD_T99_${testSuffix}`;

  try {
    // 1. Test Vendor creation & retrieval
    console.log('\n[TEST 1]: Creating and retrieving Vendor...');
    const testVendor: Vendor = {
      id: testVendorId,
      name: 'Test Audiovisual Outlet',
      email: `test.vendor.${testSuffix}@connect.com`,
      phone: '+91 99999 99999',
      address: 'Test Vendor Address, Bangalore',
      rating: 5.0,
      active: true,
      created_at: new Date().toISOString()
    };
    
    await db.createVendor(testVendor);
    const fetchedVendor = await db.getVendor(testVendorId);
    if (!fetchedVendor || fetchedVendor.name !== testVendor.name) {
      throw new Error('Vendor creation or retrieval failed!');
    }
    console.log('✓ Vendor created & retrieved successfully.');

    // 2. Test Delivery Partners creation with locations & availability
    console.log('\n[TEST 2]: Creating test Delivery Partners...');
    // Vendor is centered at Koramangala Bangalore: (12.9348, 77.6189)
    const rider1: DeliveryPartner = {
      id: testRider1Id,
      name: 'Near Rider Dev',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      mobile: '+91 90000 00001',
      emergency_contact: '+91 90000 00000',
      address: 'Rider Close Address, Bangalore',
      vehicle_type: 'Electric Bike',
      vehicle_number: 'KA-03-HA-1111',
      driving_license: 'DL11111111',
      aadhaar: '1111 2222 3333',
      status: 'Available',
      availability: true,
      current_latitude: 12.9358, // ~110 meters away
      current_longitude: 77.6190,
      speed: 0,
      battery_level: 90,
      last_updated_time: new Date().toISOString(),
      vendor_id: testVendorId,
      joining_date: '2026-06-18'
    };

    const rider2: DeliveryPartner = {
      id: testRider2Id,
      name: 'Far Rider Rajesh',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      mobile: '+91 90000 00002',
      emergency_contact: '+91 90000 00000',
      address: 'Rider Far Address, Bangalore',
      vehicle_type: 'Scooter',
      vehicle_number: 'KA-03-HA-2222',
      driving_license: 'DL22222222',
      aadhaar: '2222 3333 4444',
      status: 'Available',
      availability: true,
      current_latitude: 12.9600, // ~3 km away
      current_longitude: 77.6300,
      speed: 0,
      battery_level: 80,
      last_updated_time: new Date().toISOString(),
      vendor_id: testVendorId,
      joining_date: '2026-06-18'
    };

    await db.createDeliveryPartner(rider1);
    await db.createDeliveryPartner(rider2);

    const partners = await db.getDeliveryPartners(testVendorId);
    if (partners.length < 2) {
      throw new Error(`Failed to retrieve hired delivery partners. Found: ${partners.length}`);
    }
    console.log(`✓ Delivery partners registered. Total for ${testVendorId}: ${partners.length}`);

    // 3. Test Order Creation
    console.log('\n[TEST 3]: Creating a customer order...');
    const testOrder: Order = {
      id: testOrderId,
      order_number: `OT-${testSuffix.slice(-6)}`,
      vendor_id: testVendorId,
      customer_name: 'Dhanush Customer',
      customer_phone: '+91 98888 88888',
      customer_address: 'Koramangala 4th Block, Bangalore',
      customer_latitude: 12.9300,
      customer_longitude: 77.6220,
      product_details: 'Connect Premium Earbuds x 1',
      amount: 1500.00,
      status: 'Order Received'
    };

    await db.createOrder(testOrder);
    const fetchedOrder = await db.getOrder(testOrderId);
    if (!fetchedOrder || fetchedOrder.status !== 'Order Received') {
      throw new Error('Order creation verification failed!');
    }
    console.log('✓ Order created successfully in state Order Received.');

    // 4. Test Auto-Assignment Closest Partner Logic
    console.log('\n[TEST 4]: Running auto-assignment engine...');
    const assignedRider = await runAutoAssignment(testOrderId);
    if (!assignedRider) {
      throw new Error('Auto-assignment failed to assign any rider!');
    }

    if (assignedRider.id !== testRider1Id) {
      throw new Error(`Auto-assignment chose wrong rider! Expected: ${testRider1Id}. Selected: ${assignedRider.id}`);
    }

    console.log(`✓ Auto-assignment successfully chose the closest rider: ${assignedRider.name} (${testRider1Id}).`);

    // Verify assignment state is Pending
    const assignment = await db.getAssignmentForOrder(testOrderId);
    if (!assignment || assignment.status !== 'Pending' || assignment.delivery_partner_id !== testRider1Id) {
      throw new Error('Delivery assignment creation or status mismatch!');
    }
    console.log('✓ Delivery assignment created in Pending state.');

    // 5. Test Rider accepts assignment
    console.log('\n[TEST 5]: Simulating rider acceptance of order...');
    await db.updateAssignmentStatus(assignment.id, 'Accepted');
    await db.updateOrderStatus(testOrderId, 'Delivery Partner Accepted');
    await db.logStatusHistory({
      order_id: testOrderId,
      status: 'Delivery Partner Accepted',
      updated_by: 'Delivery Partner',
      notes: `${assignedRider.name} accepted the delivery assignment.`
    });

    const acceptedAssignment = await db.getAssignmentForOrder(testOrderId);
    const updatedOrder = await db.getOrder(testOrderId);
    if (acceptedAssignment?.status !== 'Accepted' || updatedOrder?.status !== 'Delivery Partner Accepted') {
      throw new Error('Failed to update assignment acceptance status!');
    }
    console.log('✓ Rider accepted order. Order status changed to: Delivery Partner Accepted.');

    // 6. Test tracking coordinates logs
    console.log('\n[TEST 6]: Logging GPS tracking updates...');
    await db.logTracking({
      delivery_partner_id: testRider1Id,
      order_id: testOrderId,
      latitude: 12.9350,
      longitude: 77.6195,
      speed: 25,
      current_address: 'Koramangala 3rd Block Junction',
      battery_level: 89,
      updated_at: new Date().toISOString()
    });

    const latestTracking = await db.getLatestTracking(testOrderId);
    if (!latestTracking || latestTracking.latitude !== 12.9350) {
      throw new Error('Tracking coordinates logging verification failed!');
    }
    console.log(`✓ Coordinates logged. Lat: ${latestTracking.latitude}, Lng: ${latestTracking.longitude}, Speed: ${latestTracking.speed} km/h.`);

    // 7. Test complete delivery (Delivered milestone)
    console.log('\n[TEST 7]: Simulating delivery completion...');
    await db.updateOrderStatus(testOrderId, 'Delivered');
    await db.logStatusHistory({
      order_id: testOrderId,
      status: 'Delivered',
      updated_by: 'Delivery Partner',
      notes: 'Delivered to customer. OTP Verified.'
    });

    // Add earnings
    await db.createEarning({
      id: `e_test_${testSuffix}`,
      delivery_partner_id: testRider1Id,
      order_id: testOrderId,
      per_delivery_earning: 65.00,
      incentive: 10.00,
      bonus: 0,
      date: new Date().toISOString().split('T')[0]
    });

    const finishedOrder = await db.getOrder(testOrderId);
    const riderEarnings = await db.getEarnings(testRider1Id);
    if (finishedOrder?.status !== 'Delivered' || riderEarnings.length === 0) {
      throw new Error('Failed to complete order delivery and credit earnings!');
    }
    console.log(`✓ Order delivered. Earnings credited: ₹${Number(riderEarnings[0].per_delivery_earning) + Number(riderEarnings[0].incentive)}.`);

    // 8. Test Customer rating & average rating calculation
    console.log('\n[TEST 8]: Simulating customer post-delivery rating...');
    await db.createRating({
      id: `r_test_${testSuffix}`,
      order_id: testOrderId,
      rating_value: 5,
      comment: 'Excellent and polite delivery partner!',
      rater_role: 'Customer',
      target_partner_id: testRider1Id,
      timestamp: new Date().toISOString()
    });

    // Trigger average recalculation
    const ratings = await db.getRatings(testRider1Id);
    const avgRating = parseFloat((ratings.reduce((acc, r) => acc + r.rating_value, 0) / ratings.length).toFixed(1));
    await db.updateDeliveryPartner(testRider1Id, {
      rating: avgRating
    });

    const ratedRider = await db.getDeliveryPartner(testRider1Id);
    if (!ratedRider || ratedRider.rating !== 5.0) {
      throw new Error(`Rating calculation failed! Expected: 5.0. Found: ${ratedRider?.rating}`);
    }
    console.log(`✓ Rating submitted. Recalculated delivery partner average rating is: ${ratedRider.rating} stars.`);

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ TEST RUN COMPROMISED WITH ERROR:', error);
    process.exit(1);
  }
}

runTests();
