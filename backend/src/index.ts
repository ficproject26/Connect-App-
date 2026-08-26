import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import vendorsRouter from './routes/vendors';
import deliveryRouter from './routes/delivery';
import ordersRouter from './routes/orders';
import mapsRouter from './routes/maps';
import { socketManager } from './socket';
import { db } from './db';
import { helmetSecurityMiddleware, sanitizeInputsMiddleware } from './security/middleware';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// OWASP Security Headers (Helmet) & Input Sanitization
app.use(helmetSecurityMiddleware);

// Universal CORS Header Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  const reqHeaders = req.headers['access-control-request-headers'];
  res.setHeader('Access-Control-Allow-Headers', (Array.isArray(reqHeaders) ? reqHeaders.join(',') : reqHeaders) || 'x-auth-token, Content-Type, Authorization, Cache-Control, Pragma, Expires, expires, x-requested-with, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Enable CORS with Credentials
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInputsMiddleware);

// Base Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Connect App Enterprise REST API is running with OWASP Security enabled.',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/delivery-partners', deliveryRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/maps', mapsRouter);

// Public Categories Endpoints
app.get(['/api/public/categories', '/api/categories'], async (req, res) => {
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

// Public Products Endpoints (Customer & Vendor products)
app.get(['/api/public/products', '/api/products'], async (req, res) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      const suspendedUsers = await mongoDb.collection('users').find({
        $or: [
          { status: { $in: ['suspended', 'Suspended', 'rejected', 'Rejected', 'inactive', 'Inactive', 'deactivated', 'Deactivated', 'blocked', 'Blocked'] } },
          { isActive: false }
        ]
      }, { projection: { _id: 1, email: 1, phone: 1, mobileNumber: 1, businessName: 1, name: 1, registrationId: 1, vendorId: 1, primaryBusinessId: 1, businesses: 1 } }).toArray();

      const suspendedVendorsCol = await mongoDb.collection('vendors').find({
        $or: [
          { status: { $in: ['suspended', 'Suspended', 'rejected', 'Rejected', 'inactive', 'Inactive', 'deactivated', 'Deactivated', 'blocked', 'Blocked'] } },
          { isActive: false }
        ]
      }, { projection: { _id: 1, email: 1, phone: 1, mobileNumber: 1, businessName: 1, registrationId: 1, vendorId: 1 } }).toArray();

      const suspendedVendorIds = new Set<string>();
      const suspendedVendorEmails = new Set<string>();
      const suspendedVendorPhones = new Set<string>();
      const suspendedVendorNames = new Set<string>();
      const suspendedVendorPrefixes = new Set<string>();

      const isGenericVendorName = (nameStr: any) => {
        const norm = (nameStr || '').toString().toLowerCase().trim();
        return !norm || ['connect member', 'verified vendor', 'elite vendor', 'vendor', 'connect', 'customer', 'admin', 'connect customer'].includes(norm);
      };

      [...suspendedUsers, ...suspendedVendorsCol].forEach((v: any) => {
        if (v._id) {
          const idStr = v._id.toString();
          suspendedVendorIds.add(idStr);
          if (idStr.length >= 16) suspendedVendorPrefixes.add(idStr.substring(0, 16));
        }
        if (v.registrationId) suspendedVendorIds.add(v.registrationId.toString());
        if (v.vendorId) suspendedVendorIds.add(v.vendorId.toString());
        if (v.primaryBusinessId) suspendedVendorIds.add(v.primaryBusinessId.toString());
        if (Array.isArray(v.businesses)) {
          v.businesses.forEach((b: any) => {
            if (b._id) suspendedVendorIds.add(b._id.toString());
          });
        }
        if (v.email) suspendedVendorEmails.add(v.email.toLowerCase().trim());
        const phone = (v.phone || v.mobileNumber || '').replace(/\D/g, '');
        if (phone) suspendedVendorPhones.add(phone);
        if (v.businessName && !isGenericVendorName(v.businessName)) suspendedVendorNames.add(v.businessName.toLowerCase().trim());
        if (v.name && !isGenericVendorName(v.name)) suspendedVendorNames.add(v.name.toLowerCase().trim());
      });

      const allVendorUsers = await mongoDb.collection('users').find({
        $or: [
          { role: { $in: ['vendor', 'Vendor', 'merchant', 'Merchant'] } },
          { vendorType: { $exists: true } },
          { businesses: { $exists: true, $not: { $size: 0 } } }
        ]
      }, { projection: { _id: 1, email: 1, phone: 1, mobileNumber: 1, businessName: 1, name: 1, registrationId: 1, vendorId: 1, businesses: 1 } }).toArray();

      const suspendedVendorBizKeys = new Set<string>();
      allVendorUsers.forEach((v: any) => {
        const vKeys = [
          v._id ? v._id.toString() : '',
          v.registrationId ? v.registrationId.toString() : '',
          v.vendorId ? v.vendorId.toString() : '',
          v.email ? v.email.toLowerCase().trim() : '',
          (v.phone || v.mobileNumber || '').replace(/\D/g, ''),
          (v.businessName && !isGenericVendorName(v.businessName)) ? v.businessName.toLowerCase().trim() : '',
          (v.name && !isGenericVendorName(v.name)) ? v.name.toLowerCase().trim() : ''
        ].filter(Boolean);

        if (Array.isArray(v.businesses)) {
          v.businesses.forEach((b: any) => {
            const bStatus = (b.status || '').toLowerCase().trim();
            const isBActive = (bStatus === 'active' || bStatus === 'approved') && b.isActive !== false;
            if (!isBActive) {
              const bId = b._id ? b._id.toString() : '';
              const bName = (b.businessName || b.name || '').toLowerCase().trim();
              vKeys.forEach(vKey => {
                if (bId) suspendedVendorBizKeys.add(`${vKey}:${bId}`);
                if (bName && !isGenericVendorName(bName)) suspendedVendorBizKeys.add(`${vKey}:${bName}`);
              });
            }
          });
        }
      });

      const allProducts = await mongoDb.collection('products').find({ isActive: { $ne: false }, isAvailable: { $ne: false } }).sort({ createdAt: -1 }).toArray();

      const activeProducts = allProducts.filter((p: any) => {
        if (p.isActive === false || p.isAvailable === false) return false;
        if (p.isVendorSuspended === true || p.isSuspended === true) return false;
        const pVendorStatus = (p.vendorStatus || p.status || '').toLowerCase().trim();
        if (['suspended', 'inactive', 'rejected', 'blocked', 'deactivated'].includes(pVendorStatus)) return false;

        const vId = p.vendorId ? p.vendorId.toString() : '';
        const vEmail = (p.vendorEmail || '').toLowerCase().trim();
        const vPhone = (p.vendorPhone || '').replace(/\D/g, '');
        const vName = (p.vendorName || p.brand || '').toLowerCase().trim();

        if (vId && suspendedVendorIds.has(vId)) return false;
        if (vEmail && suspendedVendorEmails.has(vEmail)) return false;
        if (vPhone && suspendedVendorPhones.has(vPhone)) return false;
        if (vName && !isGenericVendorName(vName) && suspendedVendorNames.has(vName)) return false;
        if (vId && Array.from(suspendedVendorPrefixes).some(prefix => vId.startsWith(prefix))) return false;

        if (p.businessIsActive === false) return false;
        const pBizStatus = (p.businessStatus || '').toLowerCase().trim();
        if (['suspended', 'inactive', 'rejected', 'blocked', 'deactivated'].includes(pBizStatus)) return false;

        const pBizId = p.businessId ? p.businessId.toString() : (p.business ? (p.business._id?.toString() || p.business.id?.toString()) : '');
        const pBizName = (p.businessName || p.business?.businessName || p.business?.name || p.subNavbarCategory || '').toLowerCase().trim();

        const productVendorKeys = [vId, vEmail, vPhone, vName].filter(Boolean);
        const isThisVendorBizSuspended = productVendorKeys.some(vKey => {
          if (pBizId && suspendedVendorBizKeys.has(`${vKey}:${pBizId}`)) return true;
          if (pBizName && suspendedVendorBizKeys.has(`${vKey}:${pBizName}`)) return true;
          return false;
        });

        if (isThisVendorBizSuspended) return false;

        return true;
      });

      return res.json(activeProducts);
    }
    return res.json([]);
  } catch (err: any) {
    console.error("Error fetching public products in backend:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/public/products/delete-all', async (req, res) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      await mongoDb.collection('products').deleteMany({});
      return res.json({ success: true, message: 'All products deleted successfully.' });
    }
    return res.status(500).json({ error: 'Database unavailable' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Catch-all 404 handler for non-existent API routes with CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.url} not found` });
});

// Global Express Error Handler with CORS headers
app.use((err: any, req: any, res: any, next: any) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  console.error('Server Error:', err);
  res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
socketManager.init(server);

// Connect to Database and start Server
db.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`[Server]: Connect App Backend running on http://localhost:${PORT} with DevSecOps Security`);
    });
  })
  .catch((err) => {
    console.error('[Server]: Failed to start backend due to database connection failure:', err.message);
    process.exit(1);
  });
