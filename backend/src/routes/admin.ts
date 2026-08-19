import { Router, Request, Response } from 'express';
import { db } from '../db';
import { securityManager } from '../security/securityManager';

const router = Router();

// GET: /api/admin/categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      const all = await mongoDb.collection('categories').find().sort({ sortOrder: 1, name: 1 }).toArray();
      
      const map: Record<string, any> = {};
      const roots: any[] = [];

      all.forEach((c: any) => {
        c.children = [];
        map[c._id.toString()] = c;
      });

      all.forEach((c: any) => {
        if (c.parentId && map[c.parentId.toString()]) {
          map[c.parentId.toString()].children.push(c);
        } else if (!c.parentId) {
          roots.push(c);
        }
      });

      return res.json(roots.length > 0 ? roots : all);
    }
    return res.json([]);
  } catch (err: any) {
    console.error("Error fetching categories in backend:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET: /api/admin/public/banners
router.get('/public/banners', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      const banners = await mongoDb.collection('banners').find({ isActive: true }).toArray();
      return res.json(banners);
    }
    return res.json([]);
  } catch (err: any) {
    console.error("Error fetching public banners in backend:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET: /api/admin/public/ads OR /api/admin/ads
router.get(['/public/ads', '/ads'], async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      const ads = await mongoDb.collection('ads').find({ isActive: true }).toArray();
      return res.json(ads);
    }
    return res.json([]);
  } catch (err: any) {
    console.error("Error fetching public ads in backend:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET: /api/admin/public/products OR /api/admin/products
router.get(['/public/products', '/products'], async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      const products = await mongoDb.collection('products').find({ isActive: { $ne: false } }).toArray();
      return res.json(products);
    }
    return res.json([]);
  } catch (err: any) {
    console.error("Error fetching public products in admin router:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET: /api/admin/banners
router.get('/banners', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      const banners = await mongoDb.collection('banners').find().toArray();
      return res.json(banners);
    }
    return res.json([]);
  } catch (err: any) {
    console.error("Error fetching banners in backend:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Helper to get all exclusive offers from Mongo collections
async function getOffersFromMongo(onlyActive = true) {
  const mongoDb = db.getDb();
  if (!mongoDb) return [];
  try {
    const col1 = mongoDb.collection('exclusive_offers');
    const col2 = mongoDb.collection('exclusiveoffers');

    // Purge legacy hardcoded mock initial offers
    const purgeQuery = {
      $or: [
        { title: { $in: ['Summer Festival Sale', 'Priority Dine-In Privilege', 'Helicopter Transfer Deal'] } },
        { code: { $in: ['CONN-SUMMER20', 'CONN-DINEOUT15', 'CONN-CHARTER25'] } }
      ]
    };
    await col1.deleteMany(purgeQuery).catch(() => {});
    await col2.deleteMany(purgeQuery).catch(() => {});

    const filter = onlyActive ? { isActive: { $ne: false } } : {};

    const offers1 = await col1.find(filter).sort({ createdAt: -1 }).toArray();
    const offers2 = await col2.find(filter).sort({ createdAt: -1 }).toArray();

    const combinedMap = new Map();
    [...offers1, ...offers2].forEach((off: any) => {
      const key = (off._id ? off._id.toString() : '') || `${off.title}_${off.code}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, off);
      }
    });

    return Array.from(combinedMap.values());
  } catch (err) {
    console.error("Error fetching exclusive offers from Mongo:", err);
    return [];
  }
}

async function getOffersCollection() {
  const mongoDb = db.getDb();
  if (mongoDb) {
    return mongoDb.collection('exclusive_offers');
  }
  return null;
}

// GET: /api/admin/public/exclusive-offers OR /api/admin/exclusive-offers
router.get(['/public/exclusive-offers', '/exclusive-offers'], async (req: Request, res: Response) => {
  try {
    const offers = await getOffersFromMongo(true);
    return res.json(offers);
  } catch (err: any) {
    console.error("Error fetching public exclusive offers:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET: /api/admin/exclusive-offers/all (All active + inactive for Admin)
router.get('/exclusive-offers/all', async (req: Request, res: Response) => {
  try {
    const offers = await getOffersFromMongo(false);
    return res.json(offers);
  } catch (err: any) {
    console.error("Error fetching all exclusive offers for admin:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// POST: /api/admin/exclusive-offers (Create & Publish Offer)
router.post('/exclusive-offers', async (req: Request, res: Response) => {
  try {
    const { title, discount, code, desc, category } = req.body;
    if (!title || !discount || !code) {
      return res.status(400).json({ error: 'Title, discount, and code are required.' });
    }

    const newOffer = {
      _id: `off_${Date.now()}`,
      title,
      discount,
      code: code.toUpperCase(),
      desc: desc || 'Exclusive privilege offer for active Connect members.',
      category: category || 'General',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const col = await getOffersCollection();
    if (col) {
      await col.insertOne(newOffer as any);
      return res.status(201).json({ status: 'success', offer: newOffer });
    }
    return res.status(500).json({ error: 'Database unavailable' });
  } catch (err: any) {
    console.error("Error creating exclusive offer:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// PUT: /api/admin/exclusive-offers/:id (Update or toggle offer)
router.put('/exclusive-offers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const col = await getOffersCollection();
    if (col) {
      delete updateData._id;
      const result = await col.findOneAndUpdate(
        { _id: id as any },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      return res.json({ status: 'success', offer: result });
    }
    return res.status(500).json({ error: 'Database unavailable' });
  } catch (err: any) {
    console.error("Error updating offer:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// DELETE: /api/admin/exclusive-offers/:id (Delete offer)
router.delete('/exclusive-offers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const col = await getOffersCollection();
    if (col) {
      await col.deleteOne({ _id: id as any });
      return res.json({ status: 'success', message: 'Offer deleted successfully.' });
    }
    return res.status(500).json({ error: 'Database unavailable' });
  } catch (err: any) {
    console.error("Error deleting offer:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});


// Admin Security Control Center API Routes
router.get('/security/metrics', (req: Request, res: Response) => {
  const metrics = securityManager.getSecurityMetrics();
  return res.json({
    status: 'success',
    metrics
  });
});

router.get('/security/logs', (req: Request, res: Response) => {
  const logs = securityManager.getAuditLogs();
  return res.json({
    status: 'success',
    logs
  });
});

router.get('/security/locked-accounts', (req: Request, res: Response) => {
  const records = securityManager.getAllUserSecurityRecords();
  const locked = records.filter(r => r.isPermanentlyLocked || (r.accountLockedUntil && new Date(r.accountLockedUntil).getTime() > Date.now()));
  return res.json({
    status: 'success',
    lockedAccounts: locked
  });
});

router.post('/security/unlock-account', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: 'error', message: 'Email or Mobile required.' });
  
  securityManager.unlockAccount(email);
  securityManager.logEvent({
    action: 'ADMIN_UNLOCKED_ACCOUNT',
    email,
    ip: req.ip || '127.0.0.1',
    device: 'Admin Control Center',
    country: 'India',
    status: 'SUCCESS',
    details: `Admin unlocked account for ${email}.`
  });

  return res.json({
    status: 'success',
    message: `Account ${email} has been unlocked by Admin.`
  });
});

// Mock Data
const dashboardStats = {
  activeMembers: 10450,
  premiumVendors: 520,
  citiesActive: 53,
  monthlyRevenue: 135400,
};

const recentMembers = [
  { id: '1', name: 'Dhanush An', email: 'dhanush@connect.app', tier: 'Gold Elite', status: 'Active', joinDate: '2026-06-01' },
  { id: '2', name: 'Sophia Miller', email: 'sophia@connect.app', tier: 'Diamond Prestige', status: 'Active', joinDate: '2026-06-05' },
  { id: '3', name: 'David Chen', email: 'david@connect.app', tier: 'Silver Tier', status: 'Pending', joinDate: '2026-06-09' },
  { id: '4', name: 'Elena Rostova', email: 'elena@connect.app', tier: 'Diamond Prestige', status: 'Active', joinDate: '2026-06-09' },
];

const mockVendors = [
  { id: 'v1', name: 'Aether Dining', category: 'Food', rating: 4.9, active: true },
  { id: 'v2', name: 'Luxe Staycations', category: 'Stay', rating: 4.8, active: true },
  { id: 'v3', name: 'FlyGlobal Lounges', category: 'Travel', rating: 4.7, active: true },
  { id: 'v4', name: 'Prime Spa & Salon', category: 'Services', rating: 4.6, active: false },
];

// GET: /api/admin/dashboard
router.get('/dashboard', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      stats: dashboardStats,
      recentMembers: recentMembers
    }
  });
});

// GET: /api/admin/vendors
router.get('/vendors', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: mockVendors
  });
});

// POST: /api/admin/settings
router.post('/settings', (req: Request, res: Response) => {
  const { theme, maintenanceMode } = req.body;
  res.json({
    status: 'success',
    message: 'Admin settings updated successfully.',
    data: {
      updatedAt: new Date().toISOString(),
      settings: { theme, maintenanceMode }
    }
  });
});

export default router;
