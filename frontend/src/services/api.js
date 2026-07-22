import { getBackendUrl, getVendorBackendUrl } from './apiSetup';
const BACKEND_URL = `${getBackendUrl()}/api`;


// Haversine distance formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate intermediate coordinates for simulated maps
function generateMockRoute(lat1, lon1, lat2, lon2, steps = 15) {
  const path = [];
  const midLat = lat1 + (lat2 - lat1) * 0.45;
  const midLng = lon1 + (lon2 - lon1) * 0.65;

  const controlPoints = [
    [lat1, lon1],
    [midLat, lon1],
    [midLat, midLng],
    [lat2, midLng],
    [lat2, lon2]
  ];

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const start = controlPoints[i];
    const end = controlPoints[i + 1];
    const segSteps = Math.ceil(steps / 4);
    for (let j = 0; j < segSteps; j++) {
      const t = j / segSteps;
      const lt = start[0] + (end[0] - start[0]) * t;
      const ln = start[1] + (end[1] - start[1]) * t;
      // Curvature noise
      path.push([lt + Math.sin(j) * 0.0001, ln + Math.cos(j) * 0.0001]);
    }
  }
  path.push([lat2, lon2]);
  return path;
}

// Emulate DB in localStorage for Fallback Mode
const initMockDB = () => {
  if (!localStorage.getItem('connect_fallback_partners')) {
    const defaultPartners = [
      {
        id: 'dp1',
        name: 'Dev Singh',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        mobile: '+91 98989 89898',
        emergency_contact: '+91 91919 19191',
        address: 'Sector 15, Dwarka, Delhi',
        vehicle_type: 'Electric Bike',
        vehicle_number: 'DL-3C-AB-1234',
        driving_license: 'DL1234567890',
        aadhaar: '1234 5678 9012',
        status: 'Available',
        availability: true,
        current_latitude: 12.9398,
        current_longitude: 77.6239,
        speed: 0,
        battery_level: 92,
        joining_date: '2026-01-10',
        vendor_id: 'v1'
      },
      {
        id: 'dp2',
        name: 'Rajesh Kumar',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        mobile: '+91 97777 77777',
        emergency_contact: '+91 95555 55555',
        address: 'Koramangala, Bangalore',
        vehicle_type: 'Scooter',
        vehicle_number: 'KA-01-EF-5678',
        driving_license: 'KA1234567890',
        aadhaar: '9876 5432 1098',
        status: 'Offline',
        availability: false,
        current_latitude: 12.9268,
        current_longitude: 77.6129,
        speed: 0,
        battery_level: 45,
        joining_date: '2026-03-15',
        vendor_id: 'v1'
      }
    ];
    localStorage.setItem('connect_fallback_partners', JSON.stringify(defaultPartners));
  }

  if (!localStorage.getItem('connect_fallback_orders')) {
    const defaultOrders = [
      {
        id: 'ORD1245',
        order_number: 'ORD1245',
        vendor_id: 'v1',
        customer_name: 'Amit Verma',
        customer_phone: '+91 98888 88888',
        customer_address: 'Koramangala 5th Block, Bangalore',
        customer_latitude: 12.9498,
        customer_longitude: 77.6289,
        product_details: 'boAt Rockerz 450 x 1',
        amount: 2499,
        status: 'Delivered',
        created_at: new Date(Date.now() - 3600 * 3000).toISOString()
      },
      {
        id: 'ORD1244',
        order_number: 'ORD1244',
        vendor_id: 'v1',
        customer_name: 'Neha Singh',
        customer_phone: '+91 97777 66666',
        customer_address: 'HSR Layout Sector 2, Bangalore',
        customer_latitude: 12.9248,
        customer_longitude: 77.6389,
        product_details: 'OnePlus Nord Watch x 1',
        amount: 3999,
        status: 'Preparing',
        created_at: new Date(Date.now() - 1800 * 1000).toISOString()
      }
    ];
    localStorage.setItem('connect_fallback_orders', JSON.stringify(defaultOrders));
  }

  if (!localStorage.getItem('connect_fallback_earnings')) {
    const defaultEarnings = [
      {
        id: 'e1',
        delivery_partner_id: 'dp1',
        order_id: 'ORD1245',
        per_delivery_earning: 60,
        incentive: 10,
        bonus: 5,
        date: new Date().toISOString().split('T')[0]
      }
    ];
    localStorage.setItem('connect_fallback_earnings', JSON.stringify(defaultEarnings));
  }

  if (!localStorage.getItem('connect_fallback_ratings')) {
    const defaultRatings = [
      {
        id: 'r1',
        order_id: 'ORD1245',
        rating_value: 5,
        comment: 'Super fast delivery!',
        rater_role: 'Customer',
        target_partner_id: 'dp1',
        timestamp: new Date().toISOString()
      }
    ];
    localStorage.setItem('connect_fallback_ratings', JSON.stringify(defaultRatings));
  }

  if (!localStorage.getItem('connect_fallback_assignments')) {
    localStorage.setItem('connect_fallback_assignments', JSON.stringify([]));
  }
};

// Emulated Local API Handlers (when Server is Offline)
const handleFallbackRequest = async (endpoint, options = {}) => {
  initMockDB();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;
  const urlPath = endpoint.split('?')[0];

  console.log(`[Mock DB Fallback]: Processing ${method} ${endpoint} (path: ${urlPath})`);

  // 1. Auth routes
  if (urlPath.startsWith('/auth/login')) {
    const { email, role } = body;
    let displayName = email.split('@')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    if (role === 'vendor') {
      return {
        status: 'success',
        data: { id: 'v1', name: 'ABC Electronics', email, role: 'vendor' }
      };
    } else if (role === 'delivery') {
      const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
      let partner = partners.find((p) => p.id === email || p.name.includes(displayName));
      if (!partner) {
        partner = {
          id: 'dp_temp',
          name: displayName || 'Connect Rider',
          photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          mobile: '+91 99999 88888',
          vehicle_type: 'Electric Bike',
          status: 'Available',
          availability: true,
          current_latitude: 12.9348,
          current_longitude: 77.6189,
          vendor_id: 'v1'
        };
        partners.push(partner);
        localStorage.setItem('connect_fallback_partners', JSON.stringify(partners));
      }
      return {
        status: 'success',
        data: {
          id: partner.id,
          name: partner.name,
          email,
          role: 'delivery',
          status: partner.status,
          availability: partner.availability
        }
      };
    } else {
      return {
        status: 'success',
        data: { id: `cust_${displayName.toLowerCase()}`, name: displayName, email, role: 'customer' }
      };
    }
  }

  // 2. Delivery partners CRUD
  if (urlPath.startsWith('/vendors/delivery-partners')) {
    const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
    
    if (method === 'GET') {
      return { status: 'success', data: partners };
    }

    if (method === 'POST') {
      const newPartner = {
        id: 'dp_' + Math.floor(Math.random() * 10000),
        ...body,
        photo: body.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        status: 'Offline',
        availability: false,
        current_latitude: 12.9348,
        current_longitude: 77.6189,
        joining_date: new Date().toISOString().split('T')[0]
      };
      partners.push(newPartner);
      localStorage.setItem('connect_fallback_partners', JSON.stringify(partners));
      return { status: 'success', data: newPartner };
    }

    if (method === 'PUT') {
      const match = urlPath.match(/\/vendors\/delivery-partners\/(.+)/);
      const partnerId = match ? match[1] : null;
      if (!partnerId) return { status: 'error', message: 'ID missing' };

      const idx = partners.findIndex((p) => p.id === partnerId);
      if (idx !== -1) {
        partners[idx] = { ...partners[idx], ...body };
        localStorage.setItem('connect_fallback_partners', JSON.stringify(partners));
        return { status: 'success', data: partners[idx] };
      }
      return { status: 'error', message: 'Partner not found' };
    }

    if (method === 'DELETE') {
      const match = urlPath.match(/\/vendors\/delivery-partners\/(.+)/);
      const partnerId = match ? match[1] : null;
      const filtered = partners.filter((p) => p.id !== partnerId);
      localStorage.setItem('connect_fallback_partners', JSON.stringify(filtered));
      return { status: 'success', message: 'Removed successfully' };
    }
  }

  // 3. Orders endpoints
  if (urlPath === '/orders' && method === 'GET') {
    const orders = JSON.parse(localStorage.getItem('connect_fallback_orders'));
    return { status: 'success', data: orders };
  }

  if (urlPath.startsWith('/orders/') && method === 'GET') {
    const orderId = urlPath.split('/orders/')[1];
    const orders = JSON.parse(localStorage.getItem('connect_fallback_orders'));
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { status: 'error', message: 'Order not found' };

    const assignments = JSON.parse(localStorage.getItem('connect_fallback_assignments'));
    const assignment = assignments.find((a) => a.order_id === orderId && a.status !== 'Rejected');
    
    let partner = null;
    if (assignment) {
      const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
      partner = partners.find((p) => p.id === assignment.delivery_partner_id);
    }

    // Mock timeline
    const timeline = [
      { status: 'Order Placed', timestamp: order.created_at || new Date().toISOString(), notes: 'Order confirmed' }
    ];
    if (order.status !== 'Order Received') {
      timeline.push({ status: 'Preparing', timestamp: new Date().toISOString(), notes: 'Food/Product is being processed' });
    }
    if (['Ready For Pickup', 'Assigned', 'Picked Up', 'Out For Delivery', 'Delivered'].includes(order.status)) {
      timeline.push({ status: 'Ready For Pickup', timestamp: new Date().toISOString(), notes: 'Waiting for partner' });
    }
    if (order.status === 'Delivered') {
      timeline.push({ status: 'Delivered', timestamp: new Date().toISOString(), notes: 'Order complete' });
    }

    return {
      status: 'success',
      data: {
        order,
        timeline,
        assignment,
        partner,
        tracking: partner ? { latitude: partner.current_latitude, longitude: partner.current_longitude } : null
      }
    };
  }

  if (urlPath === '/orders' && method === 'POST') {
    const orders = JSON.parse(localStorage.getItem('connect_fallback_orders'));
    const orderId = 'ORD' + Math.floor(Math.random() * 9000);
    const newOrder = {
      id: orderId,
      order_number: orderId,
      status: 'Order Received',
      created_at: new Date().toISOString(),
      ...body
    };
    orders.unshift(newOrder);
    localStorage.setItem('connect_fallback_orders', JSON.stringify(orders));

    // Attempt fallback sync to vendor backend
    try {
      fetch(`${getVendorBackendUrl()}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          order_number: orderId,
          vendorId: body.vendor_id || 'v1',
          memberId: 'cust_dhanush',
          memberName: body.customer_name || 'Customer',
          type: body.type || 'Order',
          items: body.items || [],
          totalAmount: body.amount || 0,
          finalAmount: body.amount || 0,
          candidateEmail: body.candidateEmail,
          candidateResume: body.candidateResume,
          experience: body.experience,
          candidateEducation: body.candidateEducation,
          appointmentDate: body.appointmentDate,
          appointmentTimeSlot: body.appointmentTimeSlot,
          doctorName: body.doctorName,
          tableNumber: body.tableNumber,
          roomNumber: body.roomNumber,
          prescriptionUrl: body.prescriptionUrl
        })
      }).then(r => r.json())
        .then(data => console.log('Fallback sync response:', data))
        .catch(err => console.warn('Fallback sync to vendor backend failed:', err));
    } catch (e) {
      console.warn(e);
    }

    // Emulate Auto assignment timer
    setTimeout(() => {
      const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
      const available = partners.find((p) => p.status === 'Available' && p.availability);
      if (available) {
        available.status = 'Busy';
        available.availability = false;
        localStorage.setItem('connect_fallback_partners', JSON.stringify(partners));

        const assignments = JSON.parse(localStorage.getItem('connect_fallback_assignments'));
        const newAsg = {
          id: 'asg_' + Math.floor(Math.random() * 9000),
          order_id: orderId,
          delivery_partner_id: available.id,
          status: 'Pending',
          assigned_at: new Date().toISOString()
        };
        assignments.push(newAsg);
        localStorage.setItem('connect_fallback_assignments', JSON.stringify(assignments));

        newOrder.status = 'Assigned To Delivery Partner';
        localStorage.setItem('connect_fallback_orders', JSON.stringify(orders));
      }
    }, 2000);

    return { status: 'success', data: newOrder };
  }

  // Ready for pickup trigger
  if (urlPath.endsWith('/ready') && method === 'POST') {
    const orderId = urlPath.split('/orders/')[1].split('/ready')[0];
    const orders = JSON.parse(localStorage.getItem('connect_fallback_orders'));
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = 'Ready For Pickup';
      localStorage.setItem('connect_fallback_orders', JSON.stringify(orders));
      
      // Auto Assign trigger
      const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
      const available = partners.find((p) => p.status === 'Available' && p.availability);
      if (available) {
        available.status = 'Busy';
        available.availability = false;
        localStorage.setItem('connect_fallback_partners', JSON.stringify(partners));

        const assignments = JSON.parse(localStorage.getItem('connect_fallback_assignments'));
        assignments.push({
          id: 'asg_' + Math.floor(Math.random() * 9000),
          order_id: orderId,
          delivery_partner_id: available.id,
          status: 'Pending',
          assigned_at: new Date().toISOString()
        });
        localStorage.setItem('connect_fallback_assignments', JSON.stringify(assignments));

        orders[idx].status = 'Assigned To Delivery Partner';
        localStorage.setItem('connect_fallback_orders', JSON.stringify(orders));
      }
      return { status: 'success', data: orders[idx] };
    }
  }

  // 4. Partner Dashboard
  if (urlPath.startsWith('/delivery-partners/') && urlPath.endsWith('/dashboard') && method === 'GET') {
    const partnerId = urlPath.split('/delivery-partners/')[1].split('/dashboard')[0];
    const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) return { status: 'error', message: 'Partner not found' };

    const assignments = JSON.parse(localStorage.getItem('connect_fallback_assignments'));
    const activeAssignment = assignments.find((a) => a.delivery_partner_id === partnerId && ['Pending', 'Accepted'].includes(a.status));
    
    let activeOrder = null;
    if (activeAssignment) {
      const orders = JSON.parse(localStorage.getItem('connect_fallback_orders'));
      activeOrder = orders.find((o) => o.id === activeAssignment.order_id);
    }

    const earnings = JSON.parse(localStorage.getItem('connect_fallback_earnings')) || [];
    const myEarnings = earnings.filter((e) => e.delivery_partner_id === partnerId);

    return {
      status: 'success',
      data: {
        profile: partner,
        stats: {
          todayCompleted: myEarnings.length,
          todayEarnings: myEarnings.reduce((acc, e) => acc + e.per_delivery_earning, 0),
          rating: 4.9
        },
        activeAssignment: activeAssignment || null,
        activeOrder: activeOrder || null
      }
    };
  }

  // 4b. Partner Earnings
  if (urlPath.startsWith('/delivery-partners/') && urlPath.endsWith('/earnings') && method === 'GET') {
    const partnerId = urlPath.split('/delivery-partners/')[1].split('/earnings')[0];
    const earnings = JSON.parse(localStorage.getItem('connect_fallback_earnings')) || [];
    const myEarnings = earnings.filter((e) => e.delivery_partner_id === partnerId);
    return { status: 'success', data: myEarnings };
  }

  // Update status (online/offline)
  if (urlPath.startsWith('/delivery-partners/') && urlPath.endsWith('/status') && method === 'PUT') {
    const partnerId = urlPath.split('/delivery-partners/')[1].split('/status')[0];
    const { status, availability } = body;
    const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
    const idx = partners.findIndex((p) => p.id === partnerId);
    if (idx !== -1) {
      partners[idx].status = status;
      partners[idx].availability = availability !== undefined ? availability : (status === 'Available');
      localStorage.setItem('connect_fallback_partners', JSON.stringify(partners));
      return { status: 'success', data: partners[idx] };
    }
  }

  // Accept/Reject assignment
  if (urlPath.startsWith('/delivery-partners/assignments/') && urlPath.endsWith('/respond') && method === 'POST') {
    const asgId = urlPath.split('/delivery-partners/assignments/')[1].split('/respond')[0];
    const { action } = body;
    const assignments = JSON.parse(localStorage.getItem('connect_fallback_assignments'));
    const asgIdx = assignments.findIndex((a) => a.id === asgId);
    if (asgIdx !== -1) {
      assignments[asgIdx].status = action === 'accept' ? 'Accepted' : 'Rejected';
      localStorage.setItem('connect_fallback_assignments', JSON.stringify(assignments));

      const orders = JSON.parse(localStorage.getItem('connect_fallback_orders'));
      const orderIdx = orders.findIndex((o) => o.id === assignments[asgIdx].order_id);

      if (action === 'accept') {
        if (orderIdx !== -1) orders[orderIdx].status = 'Delivery Partner Accepted';
        localStorage.setItem('connect_fallback_orders', JSON.stringify(orders));
      } else {
        if (orderIdx !== -1) orders[orderIdx].status = 'Ready For Pickup';
        localStorage.setItem('connect_fallback_orders', JSON.stringify(orders));
        
        // Mark partner Available again
        const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
        const partnerIdx = partners.findIndex((p) => p.id === assignments[asgIdx].delivery_partner_id);
        if (partnerIdx !== -1) {
          partners[partnerIdx].status = 'Available';
          partners[partnerIdx].availability = true;
          localStorage.setItem('connect_fallback_partners', JSON.stringify(partners));
        }
      }
      return { status: 'success', message: 'Responded successfully' };
    }
  }

  // Delivery Step completions
  if (urlPath.startsWith('/delivery-partners/deliveries/') && urlPath.endsWith('/step') && method === 'POST') {
    const orderId = urlPath.split('/delivery-partners/deliveries/')[1].split('/step')[0];
    const { step, partnerId, otp } = body;

    const orders = JSON.parse(localStorage.getItem('connect_fallback_orders'));
    const orderIdx = orders.findIndex((o) => o.id === orderId);
    if (orderIdx === -1) return { status: 'error', message: 'Order not found' };

    let nextStatus = orders[orderIdx].status;
    const partners = JSON.parse(localStorage.getItem('connect_fallback_partners'));
    const partnerIdx = partners.findIndex((p) => p.id === partnerId);

    if (step === 'pickup') {
      nextStatus = 'Picked Up';
      if (partnerIdx !== -1) partners[partnerIdx].status = 'On Delivery';
    } else if (step === 'start') {
      nextStatus = 'Out For Delivery';
    } else if (step === 'near_customer') {
      nextStatus = 'Near Customer';
    } else if (step === 'complete') {
      if (otp !== '1234' && otp !== orderId.replace(/[^\d]/g, '').slice(-4)) {
        return { status: 'error', message: 'Invalid OTP code' };
      }
      nextStatus = 'Delivered';

      if (partnerIdx !== -1) {
        partners[partnerIdx].status = 'Available';
        partners[partnerIdx].availability = true;
      }

      // Add earning
      const earnings = JSON.parse(localStorage.getItem('connect_fallback_earnings')) || [];
      earnings.push({
        id: 'e_' + Math.floor(Math.random() * 10000),
        delivery_partner_id: partnerId,
        order_id: orderId,
        per_delivery_earning: 65,
        incentive: 10,
        bonus: 0,
        date: new Date().toISOString().split('T')[0]
      });
      localStorage.setItem('connect_fallback_earnings', JSON.stringify(earnings));
    }

    orders[orderIdx].status = nextStatus;
    localStorage.setItem('connect_fallback_orders', JSON.stringify(orders));
    localStorage.setItem('connect_fallback_partners', JSON.stringify(partners));

    return { status: 'success', data: orders[orderIdx] };
  }

  // 5. Maps simulation route
  if (urlPath === '/maps/route') {
    const { startLat, startLng, endLat, endLng } = body;
    const dist = getDistance(startLat, startLng, endLat, endLng);
    const duration = Math.ceil(dist / 0.4) + 2;
    const route = generateMockRoute(startLat, startLng, endLat, endLng);
    return {
      status: 'success',
      data: {
        distance: parseFloat(dist.toFixed(2)),
        duration,
        route
      }
    };
  }

  // Default general success stub
  return { status: 'success', data: {} };
};

export const apiFetch = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    // If backend is down, connection is refused, or any network/API error occurs, run fallback emulation!
    console.warn(`[API] Fallback to Mock DB due to error:`, error);
    return await handleFallbackRequest(endpoint, options);
  }
};
