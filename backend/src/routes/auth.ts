import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// POST: /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  
  if (!email || !role) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and role are required fields.'
    });
  }

  try {
    let userDetails: any = null;

    if (role === 'vendor') {
      // Find or create mock vendor
      let vendor = await db.getVendor('v1');
      if (!vendor) {
        vendor = await db.createVendor({
          id: 'v1',
          name: 'ABC Electronics',
          email: email,
          phone: '+91 98765 43210',
          address: 'Karol Bagh, New Delhi, 110005',
          rating: 4.8,
          active: true
        });
      }
      userDetails = {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        role: 'vendor'
      };
    } else if (role === 'delivery') {
      // Check if delivery partner email exists. For mock purposes, find by name derived from email.
      const partners = await db.getDeliveryPartners();
      let displayName = email.split('@')[0];
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      
      let partner = partners.find(p => p.mobile === email || p.id === email || p.name.toLowerCase().includes(displayName.toLowerCase()));
      
      if (!partner) {
        // Create a new delivery partner on the fly for testing convenience
        const randId = 'dp_' + Math.floor(1000 + Math.random() * 9000);
        partner = await db.createDeliveryPartner({
          id: randId,
          name: displayName || 'Connect Rider',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          mobile: '+91 95555 ' + Math.floor(10000 + Math.random() * 90000),
          emergency_contact: '+91 91111 22222',
          address: 'Koramangala, Bangalore',
          vehicle_type: 'Electric Bike',
          vehicle_number: 'KA-03-XY-' + Math.floor(1000 + Math.random() * 9000),
          driving_license: 'DL' + Math.floor(1000000000 + Math.random() * 9000000000),
          aadhaar: Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000) + ' 5555',
          status: 'Available',
          availability: true,
          current_latitude: 12.9348,
          current_longitude: 77.6189,
          speed: 0,
          battery_level: 95,
          last_updated_time: new Date().toISOString(),
          vendor_id: 'v1',
          joining_date: new Date().toISOString().split('T')[0]
        });
      }

      userDetails = {
        id: partner.id,
        name: partner.name,
        email: email,
        role: 'delivery',
        status: partner.status,
        availability: partner.availability
      };
    } else if (role === 'admin') {
      userDetails = {
        id: 'admin_1',
        name: 'System Admin',
        email: email,
        role: 'admin'
      };
    } else {
      // Default: Customer
      let displayName = email.split('@')[0];
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      
      userDetails = {
        id: 'cust_' + displayName.toLowerCase(),
        name: displayName || 'Connect Member',
        email: email,
        role: 'customer'
      };
    }

    res.json({
      status: 'success',
      message: 'Login successful',
      data: userDetails
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Error during authentication: ' + error.message
    });
  }
});

// POST: /api/auth/register-customer
router.post('/register-customer', async (req: Request, res: Response) => {
  const { name, email, phone, address, city, pincode, aadhaarNumber, panNumber } = req.body;
  try {
    const createdUser = {
      id: 'cust_' + Math.floor(1000 + Math.random() * 9000),
      name: name || 'Connect Customer',
      email: email,
      phone: phone,
      address: address,
      city: city,
      pincode: pincode,
      aadhaar: aadhaarNumber,
      pan: panNumber,
      role: 'customer'
    };
    res.json({
      status: 'success',
      message: 'Customer registration successful',
      data: createdUser
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Error registering customer: ' + error.message
    });
  }
});

// POST: /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, role, businessName, phone, address, city, pincode } = req.body;
  
  if (!email || !role || !name) {
    return res.status(400).json({
      status: 'error',
      message: 'Name, email, and role are required fields.'
    });
  }

  try {
    let createdUser: any = null;

    if (role === 'vendor') {
      const vendorId = 'v_' + Math.floor(1000 + Math.random() * 9000);
      const newVendor = await db.createVendor({
        id: vendorId,
        name: businessName || name,
        email: email,
        phone: phone || '+91 99999 99999',
        address: address || 'Bangalore, India',
        rating: 5.0,
        active: true
      });
      createdUser = {
        id: newVendor.id,
        name: newVendor.name,
        email: newVendor.email,
        role: 'vendor'
      };
    } else if (role === 'delivery') {
      const partnerId = 'dp_' + Math.floor(1000 + Math.random() * 9000);
      const newPartner = await db.createDeliveryPartner({
        id: partnerId,
        name: name,
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        mobile: phone || '+91 95555 12345',
        emergency_contact: '+91 91111 22222',
        address: address || 'Bangalore, India',
        vehicle_type: 'Electric Bike',
        vehicle_number: 'KA-01-XY-9999',
        driving_license: 'DL-999999999',
        aadhaar: '1111 2222 3333',
        status: 'Available',
        availability: true,
        current_latitude: 12.9348,
        current_longitude: 77.6189,
        speed: 0,
        battery_level: 100,
        last_updated_time: new Date().toISOString(),
        vendor_id: 'v1',
        joining_date: new Date().toISOString().split('T')[0]
      });
      createdUser = {
        id: newPartner.id,
        name: newPartner.name,
        email: email,
        role: 'delivery'
      };
    } else {
      // Customer
      createdUser = {
        id: 'cust_' + name.toLowerCase().replace(/\s+/g, '_'),
        name: name,
        email: email,
        phone: phone,
        address: address,
        city: city,
        pincode: pincode,
        role: 'customer'
      };
    }

    res.json({
      status: 'success',
      message: 'Registration successful',
      data: createdUser
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Error during registration: ' + error.message
    });
  }
});

export default router;
