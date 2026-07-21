import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Database Schema Interfaces
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  active: boolean;
  created_at?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  photo: string;
  mobile: string;
  emergency_contact: string;
  address: string;
  vehicle_type: string;
  vehicle_number: string;
  driving_license: string;
  aadhaar: string;
  status: 'Available' | 'Busy' | 'On Delivery' | 'Offline' | 'Break' | 'Inactive';
  availability: boolean;
  current_latitude: number;
  current_longitude: number;
  speed: number;
  battery_level: number;
  last_updated_time: string;
  vendor_id: string;
  joining_date: string;
  rating?: number;
}

export interface Order {
  id: string;
  order_number: string;
  vendor_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_latitude: number;
  customer_longitude: number;
  product_details: string;
  amount: number;
  status:
    | 'Order Received'
    | 'Preparing'
    | 'Ready For Pickup'
    | 'Assigned To Delivery Partner'
    | 'Delivery Partner Accepted'
    | 'Picked Up'
    | 'Out For Delivery'
    | 'Near Customer'
    | 'Delivered'
    | 'Completed'
    | 'Cancelled'
    | 'Pending'
    | 'Shortlisted'
    | 'Interviewing'
    | 'Hired'
    | 'Rejected'
    | 'Approved'
    | 'Enrolled';
  created_at?: string;
  type?: string;
  appointmentDate?: string;
  appointmentTimeSlot?: string;
  doctorName?: string;
  tableNumber?: string;
  roomNumber?: string;
  prescriptionUrl?: string;
  candidateEmail?: string;
  candidateResume?: string;
  items?: any[];
  vendorId?: string;
  memberId?: string;
  memberName?: string;
  totalAmount?: number;
  finalAmount?: number;
}

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  delivery_partner_id: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  assigned_at: string;
  responded_at?: string;
}

export interface DeliveryTracking {
  id?: number;
  delivery_partner_id: string;
  order_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  current_address: string;
  battery_level: number;
  updated_at: string;
}

export interface DeliveryStatusHistory {
  id?: number;
  order_id: string;
  status: string;
  updated_by: string;
  notes: string;
  timestamp: string;
}

export interface DeliveryEarning {
  id: string;
  delivery_partner_id: string;
  order_id: string;
  per_delivery_earning: number;
  incentive: number;
  bonus: number;
  date: string;
}

export interface DeliveryRating {
  id: string;
  order_id: string;
  rating_value: number;
  comment: string;
  rater_role: 'Customer' | 'Vendor';
  target_partner_id: string;
  timestamp: string;
}

export interface CustomerTrackingLog {
  id?: number;
  order_id: string;
  ip_address: string;
  browser_agent: string;
  latitude?: number;
  longitude?: number;
  accessed_at: string;
}

// Config file path for mock database
const MOCK_DB_PATH = path.join(__dirname, 'mock_db.json');

// Memory Mock Database storage structure
interface MockDatabaseSchema {
  vendors: Vendor[];
  delivery_partners: DeliveryPartner[];
  orders: Order[];
  delivery_assignments: DeliveryAssignment[];
  delivery_tracking: DeliveryTracking[];
  delivery_status_history: DeliveryStatusHistory[];
  delivery_earnings: DeliveryEarning[];
  delivery_ratings: DeliveryRating[];
  customer_tracking_logs: CustomerTrackingLog[];
}

// Default Coordinates
const VENDOR_LAT = 12.9348;
const VENDOR_LNG = 77.6189;

const DEFAULT_MOCK_DATA: MockDatabaseSchema = {
  vendors: [],
  delivery_partners: [],
  orders: [],
  delivery_assignments: [],
  delivery_tracking: [],
  delivery_status_history: [],
  delivery_earnings: [],
  delivery_ratings: [],
  customer_tracking_logs: []
};

class DatabaseManager {
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private isFallback: boolean = false;
  private memoryDb: MockDatabaseSchema = DEFAULT_MOCK_DATA;

  constructor() {}

  public async connect() {
    const connStr = process.env.MONGODB_URI || (process.env.DATABASE_URL?.startsWith('mongodb') ? process.env.DATABASE_URL : null);
    
    if (!connStr) {
      const errorMsg = `[DB]: No MongoDB connection string found in MONGODB_URI or DATABASE_URL. MongoDB is strictly required.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`[DB]: Attempting connection to MongoDB...`);
    try {
      this.mongoClient = new MongoClient(connStr, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000
      });
      await this.mongoClient.connect();
      
      const dbName = this.mongoClient.db().databaseName || 'connect_db';
      this.mongoDb = this.mongoClient.db(dbName);
      console.log(`[DB]: Connected to MongoDB successfully. Database: ${dbName}`);
      
      // Setup collections and indexes
      await this.createIndexes();
    } catch (err: any) {
      const errorMsg = `[DB]: MongoDB connection failed. Reason: ${err.message}`;
      console.error(errorMsg);
      this.mongoClient = null;
      this.mongoDb = null;
      throw new Error(errorMsg);
    }
  }

  private async createIndexes() {
    if (!this.mongoDb) return;
    try {
      await this.mongoDb.collection('vendors').createIndex({ id: 1 }, { unique: true });
      await this.mongoDb.collection('delivery_partners').createIndex({ id: 1 }, { unique: true });
      await this.mongoDb.collection('delivery_partners').createIndex({ vendor_id: 1 });
      await this.mongoDb.collection('delivery_partners').createIndex({ status: 1, availability: 1 });
      
      await this.mongoDb.collection('orders').createIndex({ id: 1 }, { unique: true });
      await this.mongoDb.collection('orders').createIndex({ order_number: 1 }, { unique: true });
      await this.mongoDb.collection('orders').createIndex({ vendor_id: 1 });
      await this.mongoDb.collection('orders').createIndex({ status: 1 });
      
      await this.mongoDb.collection('delivery_assignments').createIndex({ id: 1 }, { unique: true });
      await this.mongoDb.collection('delivery_assignments').createIndex({ order_id: 1 });
      await this.mongoDb.collection('delivery_assignments').createIndex({ delivery_partner_id: 1 });
      
      await this.mongoDb.collection('delivery_tracking').createIndex({ delivery_partner_id: 1, order_id: 1 });
      await this.mongoDb.collection('delivery_status_history').createIndex({ order_id: 1 });
      await this.mongoDb.collection('delivery_earnings').createIndex({ id: 1 }, { unique: true });
      await this.mongoDb.collection('delivery_earnings').createIndex({ delivery_partner_id: 1 });
      await this.mongoDb.collection('delivery_ratings').createIndex({ id: 1 }, { unique: true });
      await this.mongoDb.collection('delivery_ratings').createIndex({ target_partner_id: 1 });
      console.log(`[DB]: MongoDB indexes verified/created successfully.`);
    } catch (err: any) {
      console.error(`[DB]: Failed to create indexes: ${err.message}`);
    }
  }

  private async seedDefaultData() {
    if (!this.mongoDb) return;
    try {
      const vendorCount = await this.mongoDb.collection('vendors').countDocuments();
      if (vendorCount === 0) {
        console.log(`[DB]: MongoDB is empty. Seeding default data...`);
        await this.mongoDb.collection('vendors').insertMany(DEFAULT_MOCK_DATA.vendors);
        await this.mongoDb.collection('delivery_partners').insertMany(DEFAULT_MOCK_DATA.delivery_partners);
        await this.mongoDb.collection('orders').insertMany(DEFAULT_MOCK_DATA.orders);
        await this.mongoDb.collection('delivery_status_history').insertMany(DEFAULT_MOCK_DATA.delivery_status_history);
        await this.mongoDb.collection('delivery_earnings').insertMany(DEFAULT_MOCK_DATA.delivery_earnings);
        await this.mongoDb.collection('delivery_ratings').insertMany(DEFAULT_MOCK_DATA.delivery_ratings);
        console.log(`[DB]: Default data seeded successfully.`);
      }
    } catch (err: any) {
      console.error(`[DB]: Seeding failed: ${err.message}`);
    }
  }

  // Load fallback DB from local JSON file
  private loadMockDbFromFile() {
    try {
      if (fs.existsSync(MOCK_DB_PATH)) {
        const fileContent = fs.readFileSync(MOCK_DB_PATH, 'utf8');
        this.memoryDb = { ...DEFAULT_MOCK_DATA, ...JSON.parse(fileContent) };
        console.log(`[DB]: Persistent Mock Database loaded from "${MOCK_DB_PATH}"`);
      } else {
        this.saveMockDbToFile();
        console.log(`[DB]: Created initial Mock Database file at "${MOCK_DB_PATH}"`);
      }
    } catch (err: any) {
      console.error(`[DB]: Error loading Mock DB: ${err.message}`);
      this.memoryDb = DEFAULT_MOCK_DATA;
    }
  }

  // Save memory state to local JSON file
  private saveMockDbToFile() {
    try {
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(this.memoryDb, null, 2), 'utf8');
    } catch (err: any) {
      console.error(`[DB]: Error saving Mock DB to file: ${err.message}`);
    }
  }

  public getEngineType(): 'MongoDB' | 'Mock JSON Fallback' {
    return this.isFallback ? 'Mock JSON Fallback' : 'MongoDB';
  }

  public getDb(): Db | null {
    return this.mongoDb;
  }

  // Expose raw query (deprecated for SQL, throw error)
  public async query(text: string, params?: any[]) {
    throw new Error('Database is running MongoDB / Mock mode. SQL Raw query method is no longer supported.');
  }

  // --- REPOSITORY INTERFACES FOR ALL TABLES ---

  // 1. Vendors Repo
  public async getVendor(id: string): Promise<Vendor | null> {
    if (this.mongoDb) {
      return this.mongoDb.collection<Vendor>('vendors').findOne({ id }, { projection: { _id: 0 } });
    }
    return this.memoryDb.vendors.find(v => v.id === id) || null;
  }

  public async createVendor(vendor: Vendor): Promise<Vendor> {
    if (this.mongoDb) {
      const data = { ...vendor };
      await this.mongoDb.collection<Vendor>('vendors').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    this.memoryDb.vendors.push(vendor);
    this.saveMockDbToFile();
    return vendor;
  }

  // 2. Delivery Partner Repo
  public async getDeliveryPartners(vendorId?: string): Promise<DeliveryPartner[]> {
    if (this.mongoDb) {
      const query = vendorId ? { vendor_id: vendorId } : {};
      return this.mongoDb.collection<DeliveryPartner>('delivery_partners')
        .find(query, { projection: { _id: 0 } })
        .sort({ joining_date: -1 })
        .toArray();
    }
    return vendorId 
      ? this.memoryDb.delivery_partners.filter(dp => dp.vendor_id === vendorId) 
      : this.memoryDb.delivery_partners;
  }

  public async getDeliveryPartner(id: string): Promise<DeliveryPartner | null> {
    if (this.mongoDb) {
      return this.mongoDb.collection<DeliveryPartner>('delivery_partners').findOne({ id }, { projection: { _id: 0 } });
    }
    return this.memoryDb.delivery_partners.find(dp => dp.id === id) || null;
  }

  public async createDeliveryPartner(dp: DeliveryPartner): Promise<DeliveryPartner> {
    if (this.mongoDb) {
      const data = {
        ...dp,
        joining_date: dp.joining_date || new Date().toISOString().split('T')[0]
      };
      await this.mongoDb.collection<DeliveryPartner>('delivery_partners').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    this.memoryDb.delivery_partners.push(dp);
    this.saveMockDbToFile();
    return dp;
  }

  public async updateDeliveryPartner(id: string, updates: Partial<DeliveryPartner>): Promise<DeliveryPartner | null> {
    if (this.mongoDb) {
      return this.mongoDb.collection<DeliveryPartner>('delivery_partners').findOneAndUpdate(
        { id },
        { $set: { ...updates, last_updated_time: new Date().toISOString() } },
        { returnDocument: 'after', projection: { _id: 0 } }
      );
    }
    const idx = this.memoryDb.delivery_partners.findIndex(dp => dp.id === id);
    if (idx === -1) return null;
    
    const updated = {
      ...this.memoryDb.delivery_partners[idx],
      ...updates,
      last_updated_time: new Date().toISOString()
    };
    this.memoryDb.delivery_partners[idx] = updated;
    this.saveMockDbToFile();
    return updated;
  }

  public async deleteDeliveryPartner(id: string): Promise<boolean> {
    if (this.mongoDb) {
      const res = await this.mongoDb.collection('delivery_partners').deleteOne({ id });
      return (res.deletedCount ?? 0) > 0;
    }
    const originalLen = this.memoryDb.delivery_partners.length;
    this.memoryDb.delivery_partners = this.memoryDb.delivery_partners.filter(dp => dp.id !== id);
    this.saveMockDbToFile();
    return this.memoryDb.delivery_partners.length < originalLen;
  }

  // 3. Orders Repo
  public async getOrders(vendorId?: string): Promise<Order[]> {
    if (this.mongoDb) {
      const query = vendorId ? { vendor_id: vendorId } : {};
      return this.mongoDb.collection<Order>('orders')
        .find(query, { projection: { _id: 0 } })
        .sort({ created_at: -1 })
        .toArray();
    }
    return vendorId 
      ? this.memoryDb.orders.filter(o => o.vendor_id === vendorId).sort((a,b) => b.id.localeCompare(a.id)) 
      : this.memoryDb.orders.sort((a,b) => b.id.localeCompare(a.id));
  }

  public async getOrder(id: string): Promise<Order | null> {
    if (this.mongoDb) {
      return this.mongoDb.collection<Order>('orders').findOne({ id }, { projection: { _id: 0 } });
    }
    return this.memoryDb.orders.find(o => o.id === id) || null;
  }

  public async createOrder(order: Order): Promise<Order> {
    if (this.mongoDb) {
      const data = {
        ...order,
        created_at: order.created_at || new Date().toISOString()
      };
      await this.mongoDb.collection<Order>('orders').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    this.memoryDb.orders.push(order);
    this.saveMockDbToFile();
    return order;
  }

  public async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    if (this.mongoDb) {
      return this.mongoDb.collection<Order>('orders').findOneAndUpdate(
        { id },
        { $set: { status } },
        { returnDocument: 'after', projection: { _id: 0 } }
      );
    }
    const idx = this.memoryDb.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    
    const updated = {
      ...this.memoryDb.orders[idx],
      status
    };
    this.memoryDb.orders[idx] = updated;
    this.saveMockDbToFile();
    return updated;
  }

  // 4. Delivery Assignments Repo
  public async getAssignments(partnerId?: string): Promise<DeliveryAssignment[]> {
    if (this.mongoDb) {
      const query = partnerId ? { delivery_partner_id: partnerId } : {};
      return this.mongoDb.collection<DeliveryAssignment>('delivery_assignments')
        .find(query, { projection: { _id: 0 } })
        .sort({ assigned_at: -1 })
        .toArray();
    }
    return partnerId 
      ? this.memoryDb.delivery_assignments.filter(da => da.delivery_partner_id === partnerId) 
      : this.memoryDb.delivery_assignments;
  }

  public async getActiveAssignmentForPartner(partnerId: string): Promise<DeliveryAssignment | null> {
    if (this.mongoDb) {
      const assignments = await this.mongoDb.collection<DeliveryAssignment>('delivery_assignments').find(
        { delivery_partner_id: partnerId, status: { $in: ['Pending', 'Accepted'] } },
        { projection: { _id: 0 } }
      ).sort({ assigned_at: -1 }).toArray();

      for (const da of assignments) {
        const order = await this.getOrder(da.order_id);
        if (order && !['Delivered', 'Completed', 'Cancelled'].includes(order.status)) {
          return da;
        }
      }
      return null;
    }

    const assignments = this.memoryDb.delivery_assignments
      .filter(da => da.delivery_partner_id === partnerId && (da.status === 'Pending' || da.status === 'Accepted'))
      .sort((a, b) => b.assigned_at.localeCompare(a.assigned_at));

    for (const da of assignments) {
      const order = this.memoryDb.orders.find(o => o.id === da.order_id);
      if (order && !['Delivered', 'Completed', 'Cancelled'].includes(order.status)) {
        return da;
      }
    }
    return null;
  }

  public async getAssignmentForOrder(orderId: string): Promise<DeliveryAssignment | null> {
    if (this.mongoDb) {
      return this.mongoDb.collection<DeliveryAssignment>('delivery_assignments')
        .find({ order_id: orderId, status: { $ne: 'Rejected' } }, { projection: { _id: 0 } })
        .sort({ assigned_at: -1 })
        .limit(1)
        .next();
    }
    return this.memoryDb.delivery_assignments
      .filter(da => da.order_id === orderId && da.status !== 'Rejected')
      .sort((a, b) => b.assigned_at.localeCompare(a.assigned_at))[0] || null;
  }

  public async createAssignment(da: DeliveryAssignment): Promise<DeliveryAssignment> {
    if (this.mongoDb) {
      const data = {
        ...da,
        assigned_at: da.assigned_at || new Date().toISOString()
      };
      await this.mongoDb.collection<DeliveryAssignment>('delivery_assignments').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    this.memoryDb.delivery_assignments.push(da);
    this.saveMockDbToFile();
    return da;
  }

  public async updateAssignmentStatus(id: string, status: DeliveryAssignment['status']): Promise<DeliveryAssignment | null> {
    if (this.mongoDb) {
      return this.mongoDb.collection<DeliveryAssignment>('delivery_assignments').findOneAndUpdate(
        { id },
        { $set: { status, responded_at: new Date().toISOString() } },
        { returnDocument: 'after', projection: { _id: 0 } }
      );
    }
    const idx = this.memoryDb.delivery_assignments.findIndex(da => da.id === id);
    if (idx === -1) return null;
    
    const updated = {
      ...this.memoryDb.delivery_assignments[idx],
      status,
      responded_at: new Date().toISOString()
    };
    this.memoryDb.delivery_assignments[idx] = updated;
    this.saveMockDbToFile();
    return updated;
  }

  // 5. Tracking Logs Repo
  public async logTracking(tracking: DeliveryTracking): Promise<DeliveryTracking> {
    if (this.mongoDb) {
      const data = {
        ...tracking,
        updated_at: new Date().toISOString()
      };
      await this.mongoDb.collection<DeliveryTracking>('delivery_tracking').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    const completeLog = { ...tracking, id: this.memoryDb.delivery_tracking.length + 1, updated_at: new Date().toISOString() };
    this.memoryDb.delivery_tracking.push(completeLog);
    this.saveMockDbToFile();
    return completeLog;
  }

  public async getLatestTracking(orderId: string): Promise<DeliveryTracking | null> {
    if (this.mongoDb) {
      return this.mongoDb.collection<DeliveryTracking>('delivery_tracking')
        .find({ order_id: orderId }, { projection: { _id: 0 } })
        .sort({ updated_at: -1 })
        .limit(1)
        .next();
    }
    const logs = this.memoryDb.delivery_tracking.filter(t => t.order_id === orderId);
    if (logs.length === 0) return null;
    return logs.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  }

  // 6. Delivery Status History Repo
  public async logStatusHistory(history: Omit<DeliveryStatusHistory, 'id' | 'timestamp'>): Promise<DeliveryStatusHistory> {
    if (this.mongoDb) {
      const data = {
        ...history,
        timestamp: new Date().toISOString()
      };
      await this.mongoDb.collection<DeliveryStatusHistory>('delivery_status_history').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    const log = { ...history, id: this.memoryDb.delivery_status_history.length + 1, timestamp: new Date().toISOString() };
    this.memoryDb.delivery_status_history.push(log);
    this.saveMockDbToFile();
    return log;
  }

  public async getStatusHistory(orderId: string): Promise<DeliveryStatusHistory[]> {
    if (this.mongoDb) {
      return this.mongoDb.collection<DeliveryStatusHistory>('delivery_status_history')
        .find({ order_id: orderId }, { projection: { _id: 0 } })
        .sort({ timestamp: 1 })
        .toArray();
    }
    return this.memoryDb.delivery_status_history
      .filter(h => h.order_id === orderId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  // 7. Earnings Repo
  public async getEarnings(partnerId?: string): Promise<DeliveryEarning[]> {
    if (this.mongoDb) {
      const query = partnerId ? { delivery_partner_id: partnerId } : {};
      return this.mongoDb.collection<DeliveryEarning>('delivery_earnings')
        .find(query, { projection: { _id: 0 } })
        .sort({ date: -1 })
        .toArray();
    }
    return partnerId 
      ? this.memoryDb.delivery_earnings.filter(e => e.delivery_partner_id === partnerId) 
      : this.memoryDb.delivery_earnings;
  }

  public async createEarning(earning: DeliveryEarning): Promise<DeliveryEarning> {
    if (this.mongoDb) {
      const data = { ...earning };
      await this.mongoDb.collection<DeliveryEarning>('delivery_earnings').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    this.memoryDb.delivery_earnings.push(earning);
    this.saveMockDbToFile();
    return earning;
  }

  // 8. Ratings Repo
  public async getRatings(partnerId?: string): Promise<DeliveryRating[]> {
    if (this.mongoDb) {
      const query = partnerId ? { target_partner_id: partnerId } : {};
      return this.mongoDb.collection<DeliveryRating>('delivery_ratings')
        .find(query, { projection: { _id: 0 } })
        .sort({ timestamp: -1 })
        .toArray();
    }
    return partnerId 
      ? this.memoryDb.delivery_ratings.filter(r => r.target_partner_id === partnerId) 
      : this.memoryDb.delivery_ratings;
  }

  public async createRating(rating: DeliveryRating): Promise<DeliveryRating> {
    if (this.mongoDb) {
      const data = {
        ...rating,
        timestamp: new Date().toISOString()
      };
      await this.mongoDb.collection<DeliveryRating>('delivery_ratings').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    this.memoryDb.delivery_ratings.push(rating);
    this.saveMockDbToFile();
    return rating;
  }

  // 9. Customer Tracking logs
  public async logCustomerAccess(log: Omit<CustomerTrackingLog, 'id' | 'accessed_at'>): Promise<CustomerTrackingLog> {
    if (this.mongoDb) {
      const data = {
        ...log,
        accessed_at: new Date().toISOString()
      };
      await this.mongoDb.collection<CustomerTrackingLog>('customer_tracking_logs').insertOne(data);
      const { _id, ...ret } = data as any;
      return ret;
    }
    const fullLog = { ...log, id: this.memoryDb.customer_tracking_logs.length + 1, accessed_at: new Date().toISOString() };
    this.memoryDb.customer_tracking_logs.push(fullLog);
    this.saveMockDbToFile();
    return fullLog;
  }
}

export const db = new DatabaseManager();
