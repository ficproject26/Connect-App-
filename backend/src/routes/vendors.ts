import { Router, Request, Response } from 'express';
import { db } from '../db';
import { socketManager } from '../socket';

const router = Router();

// GET: /api/vendors/delivery-partners
router.get('/delivery-partners', async (req: Request, res: Response) => {
  const vendorId = (req.query.vendorId as string) || 'v1';
  try {
    const partners = await db.getDeliveryPartners(vendorId);
    res.json({
      status: 'success',
      data: partners
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve delivery partners: ' + error.message
    });
  }
});

// POST: /api/vendors/delivery-partners
router.post('/delivery-partners', async (req: Request, res: Response) => {
  const {
    name, mobile, emergency_contact, address, vehicle_type, vehicle_number,
    driving_license, aadhaar, vendor_id, photo
  } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({
      status: 'error',
      message: 'Name and mobile number are required.'
    });
  }

  try {
    const partnerId = 'dp_' + Math.floor(1000 + Math.random() * 9000);
    const newPartner = await db.createDeliveryPartner({
      id: partnerId,
      name,
      photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      mobile,
      emergency_contact: emergency_contact || '',
      address: address || '',
      vehicle_type: vehicle_type || 'Electric Bike',
      vehicle_number: vehicle_number || '',
      driving_license: driving_license || '',
      aadhaar: aadhaar || '',
      status: 'Offline',
      availability: false,
      current_latitude: 12.9348,
      current_longitude: 77.6189,
      speed: 0,
      battery_level: 100,
      last_updated_time: new Date().toISOString(),
      vendor_id: vendor_id || 'v1',
      joining_date: new Date().toISOString().split('T')[0]
    });

    socketManager.broadcast('partner_added', newPartner);

    res.status(201).json({
      status: 'success',
      message: 'Delivery partner added successfully.',
      data: newPartner
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add delivery partner: ' + error.message
    });
  }
});

// PUT: /api/vendors/delivery-partners/:id
router.put('/delivery-partners/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedPartner = await db.updateDeliveryPartner(id, updates);
    if (!updatedPartner) {
      return res.status(404).json({
        status: 'error',
        message: 'Delivery partner not found.'
      });
    }

    // Broadcast status change if status or availability is updated
    if (updates.status || updates.availability !== undefined) {
      socketManager.broadcast('partner_status_changed', {
        partnerId: id,
        status: updatedPartner.status,
        availability: updatedPartner.availability
      });
    }

    res.json({
      status: 'success',
      message: 'Delivery partner updated successfully.',
      data: updatedPartner
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update delivery partner: ' + error.message
    });
  }
});

// DELETE: /api/vendors/delivery-partners/:id
router.delete('/delivery-partners/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await db.deleteDeliveryPartner(id);
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Delivery partner not found.'
      });
    }
    
    socketManager.broadcast('partner_deleted', { partnerId: id });
    
    res.json({
      status: 'success',
      message: 'Delivery partner removed successfully.'
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete delivery partner: ' + error.message
    });
  }
});

// GET: /api/vendors/performance
router.get('/performance', async (req: Request, res: Response) => {
  const vendorId = (req.query.vendorId as string) || 'v1';
  try {
    const partners = await db.getDeliveryPartners(vendorId);
    
    const partnerMetrics = await Promise.all(partners.map(async (p) => {
      const ratings = await db.getRatings(p.id);
      const avgRating = ratings.length > 0
        ? parseFloat((ratings.reduce((acc, r) => acc + r.rating_value, 0) / ratings.length).toFixed(1))
        : 5.0;

      const earnings = await db.getEarnings(p.id);
      const totalEarned = earnings.reduce((acc, e) => acc + Number(e.per_delivery_earning) + Number(e.incentive) + Number(e.bonus), 0);

      // Simulated analytics for simplicity
      const deliveriesCount = earnings.length;
      const onTimePercent = deliveriesCount > 0 ? 94 : 100;
      const acceptanceRate = deliveriesCount > 0 ? 90 : 100;
      const avgTimeMinutes = deliveriesCount > 0 ? 24 : 0;

      return {
        partnerId: p.id,
        name: p.name,
        deliveriesCompleted: deliveriesCount,
        averageDeliveryTime: avgTimeMinutes,
        customerRating: avgRating,
        failedDeliveries: 0,
        acceptanceRate: acceptanceRate,
        onTimeDeliveryPercent: onTimePercent,
        totalEarnings: totalEarned
      };
    }));

    // Calculate aggregated vendor metrics
    const totalDeliveries = partnerMetrics.reduce((acc, p) => acc + p.deliveriesCompleted, 0);
    const avgVendorRating = partnerMetrics.length > 0 
      ? parseFloat((partnerMetrics.reduce((acc, p) => acc + p.customerRating, 0) / partnerMetrics.length).toFixed(1))
      : 5.0;
    
    res.json({
      status: 'success',
      data: {
        summary: {
          totalDeliveries,
          averageDeliveryTime: 24, // minutes
          averageRating: avgVendorRating,
          failedDeliveries: 0,
          acceptanceRate: 92,
          onTimeDeliveryPercent: 95
        },
        partners: partnerMetrics
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve performance analytics: ' + error.message
    });
  }
});

export default router;
