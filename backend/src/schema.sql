-- Delivery Management Module Database Schema
-- Target Database: PostgreSQL

-- 1. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Delivery Partners Table
CREATE TABLE IF NOT EXISTS delivery_partners (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    photo TEXT,
    mobile VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20),
    address TEXT,
    vehicle_type VARCHAR(50), -- e.g., Electric Bike, Bicycle, Scooter, Car
    vehicle_number VARCHAR(50),
    driving_license VARCHAR(50),
    aadhaar VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Offline', -- Available, Busy, On Delivery, Offline, Break, Inactive
    availability BOOLEAN DEFAULT FALSE,
    current_latitude NUMERIC(10, 8),
    current_longitude NUMERIC(11, 8),
    speed NUMERIC(5, 2) DEFAULT 0.00,
    battery_level INTEGER DEFAULT 100,
    last_updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE SET NULL,
    joining_date DATE DEFAULT CURRENT_DATE,
    rating NUMERIC(3, 2) DEFAULT 5.00
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id VARCHAR(50) REFERENCES vendors(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_latitude NUMERIC(10, 8),
    customer_longitude NUMERIC(11, 8),
    product_details TEXT, -- JSON or text summary
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Order Received', -- Order Received, Preparing, Ready For Pickup, Assigned To Delivery Partner, Delivery Partner Accepted, Picked Up, Out For Delivery, Near Customer, Delivered, Completed, Cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Delivery Assignments Table
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    delivery_partner_id VARCHAR(50) REFERENCES delivery_partners(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Accepted, Rejected, Cancelled
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);

-- 5. Delivery Tracking logs
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id SERIAL PRIMARY KEY,
    delivery_partner_id VARCHAR(50) REFERENCES delivery_partners(id) ON DELETE CASCADE,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    speed NUMERIC(5, 2) DEFAULT 0.00,
    current_address TEXT,
    battery_level INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Delivery Status History Timeline
CREATE TABLE IF NOT EXISTS delivery_status_history (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    updated_by VARCHAR(50), -- Role or User ID
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Delivery Earnings Table
CREATE TABLE IF NOT EXISTS delivery_earnings (
    id VARCHAR(50) PRIMARY KEY,
    delivery_partner_id VARCHAR(50) REFERENCES delivery_partners(id) ON DELETE CASCADE,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE SET NULL,
    per_delivery_earning NUMERIC(10, 2) DEFAULT 0.00,
    incentive NUMERIC(10, 2) DEFAULT 0.00,
    bonus NUMERIC(10, 2) DEFAULT 0.00,
    date DATE DEFAULT CURRENT_DATE
);

-- 8. Ratings Table
CREATE TABLE IF NOT EXISTS delivery_ratings (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    rating_value INTEGER CHECK (rating_value BETWEEN 1 AND 5),
    comment TEXT,
    rater_role VARCHAR(20) NOT NULL, -- Customer, Vendor
    target_partner_id VARCHAR(50) REFERENCES delivery_partners(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Customer Tracking Logs
CREATE TABLE IF NOT EXISTS customer_tracking_logs (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    browser_agent TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_delivery_partners_vendor ON delivery_partners(vendor_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_status ON delivery_partners(status, availability);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON delivery_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_partner ON delivery_assignments(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_partner ON delivery_tracking(delivery_partner_id, order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_history_order ON delivery_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_earnings_partner ON delivery_earnings(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_ratings_partner ON delivery_ratings(target_partner_id);
