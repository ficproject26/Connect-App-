import { Router, Request, Response } from 'express';
import { db, Order, DeliveryPartner, DeliveryAssignment } from '../db';
import { socketManager } from '../socket';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';
import { eventPublisher, RealtimeEntities, RealtimeActions } from '../realtime';
const router = Router();

export function extractVendorTravelPoints(item: any): { boardingPoints: { id?: string; name: string; departureTime?: string; time: string; landmark?: string }[]; droppingPoints: { id?: string; name: string; arrivalTime?: string; time: string; landmark?: string }[] } {
  if (!item) return { boardingPoints: [], droppingPoints: [] };

  const parsePoints = (rawSingle: any, rawList: any, rawStoppings: any, defaultTime: string = '', isBoarding: boolean = true) => {
    const points: { id?: string; name: string; departureTime?: string; arrivalTime?: string; time: string; landmark?: string }[] = [];
    const seen = new Set<string>();

    const addPoint = (val: any, time: string = '', landmark: string = '', id?: string) => {
      if (!val || typeof val !== 'string') return;
      const clean = val.trim();
      if (!clean) return;
      if (clean.includes(',') || clean.includes('\n')) {
        const parts = clean.split(/[,\n]+/).map(p => p.trim()).filter(Boolean);
        for (const p of parts) addPoint(p, time, landmark, id);
        return;
      }
      const lower = clean.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        const finalTime = (time || defaultTime || '').trim();
        points.push({
          id,
          name: clean,
          departureTime: isBoarding ? finalTime : undefined,
          arrivalTime: !isBoarding ? finalTime : undefined,
          time: finalTime,
          landmark: (landmark || '').trim()
        });
      }
    };

    // Priority 1: Configured repeatable list from vendor route
    if (Array.isArray(rawList) && rawList.length > 0) {
      rawList.forEach(entry => {
        if (typeof entry === 'string') {
          addPoint(entry, defaultTime);
        } else if (entry && typeof entry === 'object' && entry.active !== false) {
          const name = entry.name || entry.point || entry.location || entry.stopName || entry.title || '';
          const time = entry.departureTime || entry.arrivalTime || entry.time || entry.timing || defaultTime || '';
          const landmark = entry.landmark || entry.address || '';
          const id = entry.id || entry._id || undefined;
          addPoint(name, time, landmark, id);
        }
      });
      return points;
    }

    // Priority 2: Fallback to legacy single point
    if (typeof rawSingle === 'string' && rawSingle.trim()) {
      addPoint(rawSingle, defaultTime);
    } else if (rawSingle && typeof rawSingle === 'object') {
      const timeVal = rawSingle.departureTime || rawSingle.arrivalTime || rawSingle.time || defaultTime;
      addPoint(rawSingle.name || rawSingle.point, timeVal, rawSingle.landmark || '', rawSingle.id);
    }

    // Priority 3: Fallback to route stoppings
    if (points.length === 0 && Array.isArray(rawStoppings) && rawStoppings.length > 0) {
      rawStoppings.forEach(stop => {
        if (typeof stop === 'string') {
          addPoint(stop);
        } else if (stop && typeof stop === 'object') {
          addPoint(stop.stopName || stop.name || stop.location, stop.time || '', '', stop.id);
        }
      });
    }

    return points;
  };

  const boardingPoints = parsePoints(
    item.boardingPoint || item.boarding_point || item.pickupPoint || item.pickup_point,
    item.boardingPoints || item.boarding_points || item.pickupPoints || item.pickup_points,
    null,
    item.boardingTime || item.busTiming || '',
    true
  );

  const droppingPoints = parsePoints(
    item.dropPoint || item.drop_point || item.droppingPoint || item.dropping_point || item.destination,
    item.droppingPoints || item.dropping_points || item.dropPoints || item.drop_points,
    null,
    item.arrivalTime || '',
    false
  );

  return { boardingPoints, droppingPoints };
}

// Distance utility function (Haversine formula in km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Auto Assignment Logistics Logic
export async function runAutoAssignment(orderId: string): Promise<DeliveryPartner | null> {
  const order = await db.getOrder(orderId);
  if (!order) return null;

  console.log(`[AutoAssign]: Starting auto-assignment for Order #${order.order_number}`);

  // Default Vendor coordinates (center of search)
  const vendorLat = 12.9348;
  const vendorLng = 77.6189;

  // 1. Fetch available partners belonging to the SAME vendor
  const partners = await db.getDeliveryPartners(order.vendor_id);
  const availablePartners = partners.filter(
    p => p.status === 'Available' && p.availability === true
  );

  console.log(`[AutoAssign]: Found ${availablePartners.length} online, available partners for vendor ${order.vendor_id}`);

  if (availablePartners.length === 0) {
    console.log(`[AutoAssign]: No partners available. Queuing order and notifying vendor.`);
    // Notify vendor
    socketManager.emitToVendor(order.vendor_id, 'no_partners_available', {
      orderId: order.id,
      orderNumber: order.order_number,
      message: 'No available delivery partners are online. Order has been queued.'
    });
    return null;
  }

  // 2. Calculate distance between vendor and partner coordinates
  const partnersWithDistance = availablePartners.map(p => {
    // If partner doesn't have coordinates, default to vendor location
    const lat = p.current_latitude || vendorLat;
    const lng = p.current_longitude || vendorLng;
    const distance = calculateDistance(vendorLat, vendorLng, lat, lng);
    return { partner: p, distance };
  });

  // 3. Sort by nearest distance
  partnersWithDistance.sort((a, b) => a.distance - b.distance);
  const nearest = partnersWithDistance[0];

  console.log(`[AutoAssign]: Nearest partner is ${nearest.partner.name} at a distance of ${nearest.distance.toFixed(2)} km`);

  // 4. Assign Automatically
  const partner = nearest.partner;
  const assignmentId = 'asg_' + Math.floor(1000 + Math.random() * 9000);
  
  const assignment: DeliveryAssignment = {
    id: assignmentId,
    order_id: order.id,
    delivery_partner_id: partner.id,
    status: 'Pending',
    assigned_at: new Date().toISOString()
  };

  await db.createAssignment(assignment);

  // Update order status to Assigned To Delivery Partner
  await db.updateOrderStatus(order.id, 'Assigned To Delivery Partner');
  await db.logStatusHistory({
    order_id: order.id,
    status: 'Assigned To Delivery Partner',
    updated_by: 'System',
    notes: `Automatically assigned closest partner: ${partner.name} (${nearest.distance.toFixed(2)} km away)`
  });

  // Set partner status to Busy temporarily while assignment is pending acceptance
  await db.updateDeliveryPartner(partner.id, {
    status: 'Busy',
    availability: false
  });

  // 5. Notify Delivery Partner via socket
  socketManager.emitToUser('delivery', partner.id, 'order_assigned', {
    assignmentId,
    order,
    distance: nearest.distance
  });

  // Notify vendor
  socketManager.emitToVendor(order.vendor_id, 'order_assigned', {
    orderId: order.id,
    partnerId: partner.id,
    partnerName: partner.name,
    distance: nearest.distance
  });

  // Notify customer
  socketManager.emitToOrder(order.id, 'order_status_updated', {
    status: 'Assigned To Delivery Partner',
    partner: {
      id: partner.id,
      name: partner.name,
      photo: partner.photo,
      mobile: partner.mobile
    }
  });

  return partner;
}

// GET: /api/orders
router.get('/', async (req: Request, res: Response) => {
  const vendorId = req.query.vendorId as string;
  const customerId = req.query.customerId as string;
  try {
    const orders = await db.getOrders(vendorId, customerId);
    res.json({
      status: 'success',
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve orders: ' + error.message
    });
  }
});

// GET: /api/orders/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const order = await db.getOrder(id);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.'
      });
    }

    const timeline = await db.getStatusHistory(id);
    const assignment = await db.getAssignmentForOrder(id);
    
    let partner = null;
    let tracking = null;
    if (assignment) {
      partner = await db.getDeliveryPartner(assignment.delivery_partner_id);
      tracking = await db.getLatestTracking(id);
    }

    res.json({
      status: 'success',
      data: {
        order,
        timeline,
        assignment,
        partner,
        tracking
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve order details: ' + error.message
    });
  }
});

// Razorpay Order Creation Endpoint
router.post('/create-razorpay-order', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('[Razorpay Error]: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variable is missing.');
      return res.status(503).json({
        success: false,
        code: 'PAYMENT_CONFIG_MISSING',
        error: 'Razorpay payment gateway credentials are not configured on this server.'
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const parsedAmount = Math.round((Number(amount) || 1) * 100);
    const options = {
      amount: parsedAmount,
      currency: "INR",
      receipt: "receipt_order_" + Math.floor(Math.random() * 1000000),
    };

    try {
      const order = await instance.orders.create(options);
      return res.json({ success: true, order_id: order.id, amount: options.amount, key_id: keyId });
    } catch (sdkError: any) {
      const errMsg = sdkError?.error?.description || sdkError?.message || 'Razorpay order creation failed';
      console.error('[Razorpay Error]: Order initialization failed:', errMsg);
      if (process.env.NODE_ENV === 'production') {
        return res.status(502).json({
          success: false,
          code: 'PAYMENT_GATEWAY_ERROR',
          error: `Razorpay rejected order creation: ${errMsg}`
        });
      }
      // Non-production sandbox fallback only
      console.warn('[Razorpay Warning]: Using dev sandbox order fallback in non-production environment');
      return res.json({
        success: true,
        order_id: 'order_test_' + Math.floor(Math.random() * 1000000),
        amount: options.amount,
        key_id: keyId,
        isTestMode: true
      });
    }
  } catch (error: any) {
    console.error('[Razorpay Error]: Internal error in Razorpay order creation:', error?.message || error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      error: 'An internal error occurred while initializing payment.'
    });
  }
});

// Throttled logging for vendor backend order synchronization
let lastVendorSyncErrorTime = 0;
let suppressedVendorSyncErrors = 0;
function logVendorSyncThrottled(msg: string) {
  const now = Date.now();
  if (now - lastVendorSyncErrorTime > 60000) {
    if (suppressedVendorSyncErrors > 0) {
      console.warn(`[Sync Order Warning]: (Suppressed ${suppressedVendorSyncErrors} repeated warnings) ${msg}`);
    } else {
      console.warn(`[Sync Order Warning]: ${msg}`);
    }
    lastVendorSyncErrorTime = now;
    suppressedVendorSyncErrors = 0;
  } else {
    suppressedVendorSyncErrors++;
  }
}

// POST: /api/orders
router.post('/', async (req: Request, res: Response) => {
  const {
    vendor_id, customer_id, customerId, customer_email, customer_name, customer_phone, customer_address,
    product_details, amount, customer_latitude, customer_longitude,
    type, appointmentDate, appointmentTimeSlot, doctorName,
    tableNumber, roomNumber, prescriptionUrl, candidateEmail, candidateResume, items,
    experience, candidateEducation, memberId, boardingPoint, droppingPoint,
    adults, children, guestDetails,
    checkInDate, checkInTime, checkOutDate, checkOutTime, guestList, vehicleDetails, roomsCount, nightsCount, specialRequests,
    paymentMethod, payment_method, paymentStatus, payment_status, transactionId, paidAt, paymentId
  } = req.body;

  if (!customer_name || !customer_phone || !customer_address || amount === undefined || amount === null) {
    return res.status(400).json({
      status: 'error',
      message: 'Customer name, phone, address, and amount are required.'
    });
  }

  try {
    if (vendor_id) {
      const isVendorActive = await db.isVendorActive(vendor_id);
      if (!isVendorActive) {
        return res.status(403).json({
          status: 'error',
          message: 'This vendor is currently suspended and cannot receive new orders or bookings.'
        });
      }
    }

    const isBookingType = ['Booking', 'Stay', 'Travel', 'Services'].includes(type);
    const isJobType = ['Job', 'Jobs'].includes(type);
    const prefix = isBookingType ? 'BKG' : isJobType ? 'JOB' : 'ORD';
    const orderId = prefix + Math.floor(1000 + Math.random() * 9000);
    const orderNo = prefix + Math.floor(100000 + Math.random() * 900000);
    const resolvedCustId = (customer_id || customerId || memberId || req.body.user_id || '').trim();
    const resolvedEmail = (customer_email || candidateEmail || '').trim();

    let finalOrderAmount = typeof amount === 'number' ? amount : (parseFloat(amount) || 0);
    let validatedBoardingPoint: any = undefined;
    if (typeof boardingPoint === 'string' && boardingPoint.trim()) {
      validatedBoardingPoint = { name: boardingPoint.trim(), departureTime: '', time: '', landmark: '' };
    } else if (boardingPoint && typeof boardingPoint === 'object') {
      const bTime = (boardingPoint.departureTime || boardingPoint.time || '').trim();
      validatedBoardingPoint = {
        id: boardingPoint.id || boardingPoint._id || undefined,
        name: (boardingPoint.name || '').trim(),
        departureTime: bTime,
        time: bTime,
        landmark: (boardingPoint.landmark || '').trim()
      };
    }

    let validatedDroppingPoint: any = undefined;
    if (typeof droppingPoint === 'string' && droppingPoint.trim()) {
      validatedDroppingPoint = { name: droppingPoint.trim(), arrivalTime: '', time: '', landmark: '' };
    } else if (droppingPoint && typeof droppingPoint === 'object') {
      const dTime = (droppingPoint.arrivalTime || droppingPoint.time || '').trim();
      validatedDroppingPoint = {
        id: droppingPoint.id || droppingPoint._id || undefined,
        name: (droppingPoint.name || '').trim(),
        arrivalTime: dTime,
        time: dTime,
        landmark: (droppingPoint.landmark || '').trim()
      };
    }

    let numAdults = typeof adults === 'number' ? adults : parseInt(adults, 10);
    if (isNaN(numAdults) || numAdults < 0) numAdults = 1;
    let numChildren = typeof children === 'number' ? children : parseInt(children, 10);
    if (isNaN(numChildren) || numChildren < 0) numChildren = 0;

    const mongoDb = db.getDb();
    const firstItem = Array.isArray(items) && items.length > 0 ? items[0] : null;
    const targetProdId = firstItem?.productId || firstItem?.id || req.body.productId;

    let travelProduct: any = null;
    if (mongoDb && targetProdId) {
      const queries: any[] = [{ id: String(targetProdId) }, { _id: String(targetProdId) }];
      try {
        if (ObjectId.isValid(String(targetProdId))) {
          queries.push({ _id: new ObjectId(String(targetProdId)) });
        }
      } catch (e) {}
      travelProduct = await mongoDb.collection('products').findOne({ $or: queries });
    }

    const isTravelOrder = type === 'Travel' || (type || '').toLowerCase() === 'travel' || 
      travelProduct?.subNavbarCategory === 'Travel' || travelProduct?.mainCategory === 'Travel' ||
      firstItem?.type === 'Travel' || firstItem?.subNavbarCategory === 'Travel';

    if (isTravelOrder) {
      if (numAdults + numChildren < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'At least 1 passenger is required for travel booking.'
        });
      }

      if (travelProduct) {
        // Enforce vendor configured unit fare
        const unitFare = typeof travelProduct.price === 'number' ? travelProduct.price : (parseFloat(travelProduct.price) || 0);
        const adultFare = typeof travelProduct.adultPrice === 'number' && travelProduct.adultPrice > 0 ? travelProduct.adultPrice : unitFare;
        const childFare = typeof travelProduct.childPrice === 'number' && travelProduct.childPrice > 0 ? travelProduct.childPrice : adultFare;
        const expectedTotalFare = (numAdults * adultFare) + (numChildren * childFare);
        
        // Strict pricing integrity: The vendor configured unit fare is the source of truth
        finalOrderAmount = expectedTotalFare;

        // Boarding and Dropping point validation against real vendor configuration
        const { boardingPoints: allowedBps, droppingPoints: allowedDps } = extractVendorTravelPoints(travelProduct);

        if (allowedBps.length > 0) {
          if (!validatedBoardingPoint || !validatedBoardingPoint.name) {
            return res.status(400).json({
              status: 'error',
              message: 'Boarding point is required. Please select one of the vendor-provided boarding points.'
            });
          }
          const matchedBp = allowedBps.find(pt => pt.name.toLowerCase().trim() === validatedBoardingPoint.name.toLowerCase().trim());
          if (!matchedBp) {
            return res.status(400).json({
              status: 'error',
              message: `Invalid boarding point "${validatedBoardingPoint.name}". Please select one of the vendor-provided boarding points: ${allowedBps.map(p => p.name).join(', ')}.`
            });
          }
          if (!validatedBoardingPoint.time) validatedBoardingPoint.time = matchedBp.time || '';
          if (!validatedBoardingPoint.landmark) validatedBoardingPoint.landmark = matchedBp.landmark || '';
        }

        if (allowedDps.length > 0) {
          if (!validatedDroppingPoint || !validatedDroppingPoint.name) {
            return res.status(400).json({
              status: 'error',
              message: 'Dropping point is required. Please select one of the vendor-provided dropping points.'
            });
          }
          const matchedDp = allowedDps.find(pt => pt.name.toLowerCase().trim() === validatedDroppingPoint.name.toLowerCase().trim());
          if (!matchedDp) {
            return res.status(400).json({
              status: 'error',
              message: `Invalid dropping point "${validatedDroppingPoint.name}". Please select one of the vendor-provided dropping points: ${allowedDps.map(p => p.name).join(', ')}.`
            });
          }
          if (!validatedDroppingPoint.time) validatedDroppingPoint.time = matchedDp.time || '';
          if (!validatedDroppingPoint.landmark) validatedDroppingPoint.landmark = matchedDp.landmark || '';
        }
      }
    }
    
    // Normalize payment details
    const rawMethod = paymentMethod || payment_method || (req.body.isCOD ? 'Cash on Delivery' : 'Connect Wallet');
    const lowerMethod = String(rawMethod).toLowerCase();
    let resolvedPaymentMethod = 'Connect Wallet';
    if (lowerMethod.includes('cash') || lowerMethod.includes('cod')) {
      resolvedPaymentMethod = 'Cash on Delivery';
    } else if (lowerMethod.includes('wallet')) {
      resolvedPaymentMethod = 'Connect Wallet';
    } else if (lowerMethod === 'upi') {
      resolvedPaymentMethod = 'UPI';
    } else if (lowerMethod === 'card') {
      resolvedPaymentMethod = 'Card';
    } else if (lowerMethod.includes('bank')) {
      resolvedPaymentMethod = 'Net Banking';
    } else if (lowerMethod.includes('razorpay') || lowerMethod.includes('online')) {
      resolvedPaymentMethod = 'Online (Razorpay)';
    } else {
      resolvedPaymentMethod = rawMethod;
    }

    const isCod = resolvedPaymentMethod === 'Cash on Delivery';
    let resolvedPaymentStatus = paymentStatus || payment_status;
    if (!resolvedPaymentStatus) {
      resolvedPaymentStatus = isCod ? 'Pending' : 'Paid';
    } else if (['SUCCESS', 'PAID', 'COMPLETED'].includes(String(resolvedPaymentStatus).toUpperCase())) {
      resolvedPaymentStatus = 'Paid';
    }

    const resolvedTxnId = transactionId || paymentId || (!isCod ? ('TXN_' + orderNo) : undefined);
    const resolvedPaidAt = resolvedPaymentStatus === 'Paid' ? (paidAt || new Date().toISOString()) : undefined;

    const newOrder = await db.createOrder({
      id: orderId,
      order_number: orderNo,
      vendor_id: vendor_id || travelProduct?.vendorId || 'v1',
      vendorId: vendor_id || travelProduct?.vendorId || 'v1',
      customer_id: resolvedCustId,
      customerId: resolvedCustId,
      memberId: resolvedCustId,
      customer_name,
      memberName: customer_name,
      customer_email: resolvedEmail,
      customer_phone,
      customer_address,
      customer_latitude: customer_latitude || 12.9400,
      customer_longitude: customer_longitude || 77.6250,
      product_details: product_details || travelProduct?.name || 'Generic Connect Item',
      amount: finalOrderAmount,
      totalAmount: finalOrderAmount,
      finalAmount: finalOrderAmount,
      status: 'Order Received',
      type: type || 'Order',
      paymentMethod: resolvedPaymentMethod,
      payment_method: resolvedPaymentMethod,
      paymentStatus: resolvedPaymentStatus,
      payment_status: resolvedPaymentStatus,
      ...(resolvedTxnId && { transactionId: resolvedTxnId }),
      ...(resolvedPaidAt && { paidAt: resolvedPaidAt }),
      appointmentDate,
      appointmentTimeSlot,
      doctorName,
      tableNumber,
      roomNumber,
      prescriptionUrl,
      candidateEmail: resolvedEmail || candidateEmail,
      candidateResume,
      experience,
      candidateEducation,
      boardingPoint: validatedBoardingPoint,
      droppingPoint: validatedDroppingPoint,
      adults: numAdults,
      children: numChildren,
      guestDetails: Array.isArray(guestDetails) ? guestDetails : (Array.isArray(guestList) ? guestList : undefined),
      guestList: Array.isArray(guestList) ? guestList : (Array.isArray(guestDetails) ? guestDetails : undefined),
      checkInDate: checkInDate || req.body.check_in_date || appointmentDate,
      checkInTime: checkInTime || req.body.check_in_time,
      checkOutDate: checkOutDate || req.body.check_out_date,
      checkOutTime: checkOutTime || req.body.check_out_time,
      roomsCount: roomsCount || req.body.numberOfRooms,
      nightsCount: nightsCount || req.body.numberOfNights,
      vehicleDetails: vehicleDetails || null,
      specialRequests: specialRequests || req.body.notes || null,
      items: items || []
    });

    // Log status history
    await db.logStatusHistory({
      order_id: orderId,
      status: 'Order Placed',
      updated_by: 'Customer',
      notes: `Order placed successfully by ${customer_name}`
    });

    // Notify vendor and broadcast
    socketManager.emitToVendor(newOrder.vendor_id, 'new_order_received', newOrder);
    socketManager.broadcast('new_order_placed', newOrder);

    // Publish structured event to Redis message broker & WebSockets
    await eventPublisher.publishEvent(
      RealtimeEntities.ORDER,
      RealtimeActions.CREATED,
      newOrder.id,
      newOrder,
      { role: 'vendor', userId: newOrder.vendor_id }
    );

    // Auto Assign algorithm
    setTimeout(async () => {
      await runAutoAssignment(orderId);
    }, 1500);

    // Forward order details to vendor backend
    try {
      const syncData = JSON.stringify({
        id: orderId,
        order_number: orderNo,
        vendorId: vendor_id || travelProduct?.vendorId || 'v1',
        memberId: resolvedCustId || 'cust_dhanush',
        memberName: customer_name,
        type: type || 'Order',
        items: items || [{
          productId: targetProdId || '',
          name: product_details || travelProduct?.name || 'Generic Connect Item',
          price: finalOrderAmount,
          quantity: 1
        }],
        totalAmount: finalOrderAmount,
        discountApplied: 0,
        finalAmount: finalOrderAmount,
        paymentMethod: resolvedPaymentMethod,
        payment_method: resolvedPaymentMethod,
        paymentStatus: resolvedPaymentStatus,
        payment_status: resolvedPaymentStatus,
        ...(resolvedTxnId && { transactionId: resolvedTxnId }),
        ...(resolvedPaidAt && { paidAt: resolvedPaidAt }),
        boardingPoint: validatedBoardingPoint,
        droppingPoint: validatedDroppingPoint,
        adults: numAdults,
        children: numChildren,
        guestDetails: Array.isArray(guestDetails) ? guestDetails : (Array.isArray(guestList) ? guestList : undefined),
        guestList: Array.isArray(guestList) ? guestList : (Array.isArray(guestDetails) ? guestDetails : undefined),
        checkInDate: checkInDate || req.body.check_in_date || appointmentDate,
        checkInTime: checkInTime || req.body.check_in_time,
        checkOutDate: checkOutDate || req.body.check_out_date,
        checkOutTime: checkOutTime || req.body.check_out_time,
        roomsCount: roomsCount || req.body.numberOfRooms,
        nightsCount: nightsCount || req.body.numberOfNights,
        vehicleDetails: vehicleDetails || null,
        specialRequests: specialRequests || req.body.notes || null,
        candidateEmail: candidateEmail || req.body.candidateEmail,
        candidateResume: candidateResume || req.body.candidateResume,
        experience: experience || req.body.experience,
        candidateEducation: candidateEducation || req.body.candidateEducation,
        appointmentDate,
        appointmentTimeSlot,
        doctorName,
        tableNumber,
        roomNumber,
        prescriptionUrl
      });

      // Forward order to vendor backend (configurable endpoint with throttled error reporting)
      if (process.env.ENABLE_VENDOR_SYNC !== 'false') {
        const vendorUrlRaw = process.env.VENDOR_BACKEND_URL || process.env.VENDOR_API_URL || 'http://127.0.0.1:8002';
        let vendorUrl: URL;
        try {
          vendorUrl = new URL('/api/public/orders', vendorUrlRaw);
        } catch {
          vendorUrl = new URL('http://127.0.0.1:8002/api/public/orders');
        }

        const client = vendorUrl.protocol === 'https:' ? require('https') : require('http');
        const reqPost = client.request({
          protocol: vendorUrl.protocol,
          hostname: vendorUrl.hostname,
          port: vendorUrl.port || (vendorUrl.protocol === 'https:' ? 443 : 80),
          path: vendorUrl.pathname + vendorUrl.search,
          method: 'POST',
          timeout: 4000,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(syncData)
          }
        }, (resPost: any) => {
          let respData = '';
          resPost.on('data', (d: any) => { respData += d.toString(); });
          resPost.on('end', () => {
            if (resPost.statusCode >= 200 && resPost.statusCode < 300) {
              console.log('[Sync Order]: Vendor backend accepted order.');
            } else {
              logVendorSyncThrottled(`Vendor backend (${vendorUrl.origin}) returned status ${resPost.statusCode}: ${respData.slice(0, 100)}`);
            }
          });
        });

        reqPost.on('timeout', () => {
          reqPost.destroy(new Error('Connection timed out'));
        });

        reqPost.on('error', (e: any) => {
          logVendorSyncThrottled(`Failed to forward order to vendor backend (${vendorUrl.origin}): ${e.message}`);
        });

        reqPost.write(syncData);
        reqPost.end();
      }
    } catch (err: any) {
      logVendorSyncThrottled(err.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully.',
      data: newOrder
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create order: ' + error.message
    });
  }
});

// POST: /api/orders/:id/prepare
router.post('/:id/prepare', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await db.updateOrderStatus(id, 'Preparing');
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    await db.logStatusHistory({
      order_id: id,
      status: 'Preparing',
      updated_by: 'Vendor',
      notes: 'Vendor is preparing your items'
    });

    socketManager.emitToOrder(id, 'order_status_updated', { status: 'Preparing' });
    await eventPublisher.publishEvent(
      RealtimeEntities.ORDER,
      RealtimeActions.STATUS_CHANGED,
      id,
      { orderId: id, status: 'Preparing', updated },
      { room: `order:${id}` }
    );

    res.json({
      status: 'success',
      message: 'Order status updated to Preparing.',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST: /api/orders/:id/ready
router.post('/:id/ready', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await db.updateOrderStatus(id, 'Ready For Pickup');
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    await db.logStatusHistory({
      order_id: id,
      status: 'Ready For Pickup',
      updated_by: 'Vendor',
      notes: 'Order is packed and ready for pickup'
    });

    socketManager.emitToOrder(id, 'order_status_updated', { status: 'Ready For Pickup' });
    await eventPublisher.publishEvent(
      RealtimeEntities.ORDER,
      RealtimeActions.STATUS_CHANGED,
      id,
      { orderId: id, status: 'Ready For Pickup', updated },
      { room: `order:${id}` }
    );

    // Trigger auto-assignment if not already assigned
    const currentAssignment = await db.getAssignmentForOrder(id);
    if (!currentAssignment || currentAssignment.status === 'Rejected') {
      setTimeout(async () => {
        await runAutoAssignment(id);
      }, 1000);
    }

    res.json({
      status: 'success',
      message: 'Order is ready. Triggered auto-assignment engine.',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST: /api/orders/:id/rate
router.post('/:id/rate', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment, role, partnerId } = req.body;

  if (!rating || !role) {
    return res.status(400).json({
      status: 'error',
      message: 'Rating value and rater role are required.'
    });
  }

  try {
    const rateId = 'r_' + Math.floor(1000 + Math.random() * 9000);
    const newRating = await db.createRating({
      id: rateId,
      order_id: id,
      rating_value: rating,
      comment: comment || '',
      rater_role: role,
      target_partner_id: partnerId,
      timestamp: new Date().toISOString()
    });

    // Recalculate average rating of delivery partner
    const ratings = await db.getRatings(partnerId);
    const avgRating = parseFloat((ratings.reduce((acc, r) => acc + r.rating_value, 0) / ratings.length).toFixed(1));
    await db.updateDeliveryPartner(partnerId, {
      rating: avgRating
    });

    res.json({
      status: 'success',
      message: 'Rating submitted successfully.',
      data: newRating
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to record rating: ' + error.message
    });
  }
});

// PUT: /api/orders/:id/status
router.put('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await db.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    await db.logStatusHistory({
      order_id: id,
      status,
      updated_by: 'Vendor',
      notes: `Order status updated to ${status} by Vendor`
    });

    socketManager.emitToOrder(id, 'order_status_updated', { status });
    await eventPublisher.publishEvent(
      RealtimeEntities.ORDER,
      RealtimeActions.STATUS_CHANGED,
      id,
      { orderId: id, status, updated },
      { room: `order:${id}` }
    );

    res.json({
      status: 'success',
      message: `Order status updated to ${status}.`,
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
