import express from 'express';
import cors from 'cors';
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

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Middlewares
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json());

// Base Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Connect App REST API is running successfully.',
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

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
socketManager.init(server);

// Connect to Database and start Server
db.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`[Server]: Connect App Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Server]: Failed to start backend due to database connection failure:', err.message);
    process.exit(1);
  });
