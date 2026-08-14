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

// Public Products Endpoints (Customer & Vendor products)
app.get(['/api/public/products', '/api/products'], async (req, res) => {
  try {
    const mongoDb = db.getDb();
    if (mongoDb) {
      const products = await mongoDb.collection('products').find({ isActive: { $ne: false } }).toArray();
      return res.json(products);
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
