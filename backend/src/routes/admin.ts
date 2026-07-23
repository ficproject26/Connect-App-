import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET: /api/admin/categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      const all = await mongoDb.collection('categories').find().sort({ sortOrder: 1, name: 1 }).toArray();
      
      // Build tree structure
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
