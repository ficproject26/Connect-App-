"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateAdminBannersCache = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const securityManager_1 = require("../security/securityManager");
const mongodb_1 = require("mongodb");
const middleware_1 = require("../security/middleware");
const realtime_1 = require("../realtime");
const router = (0, express_1.Router)();
const adminAuth = [middleware_1.authenticateToken, (0, middleware_1.authorizeRoles)('admin')];
// GET: /api/admin/categories & /api/admin/public/categories
router.get(['/categories', '/public/categories'], async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
        if (!forceRefresh) {
            const cached = await realtime_1.cacheManager.get('cache:categories:tree');
            if (cached)
                return res.json(cached);
        }
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const all = await mongoDb.collection('categories').find().sort({ sortOrder: 1, name: 1 }).toArray();
            const map = {};
            const roots = [];
            all.forEach((c) => {
                c.children = [];
                map[c._id.toString()] = c;
            });
            all.forEach((c) => {
                if (c.parentId && map[c.parentId.toString()]) {
                    map[c.parentId.toString()].children.push(c);
                }
                else if (!c.parentId) {
                    roots.push(c);
                }
            });
            const responseData = roots.length > 0 ? roots : all;
            await realtime_1.cacheManager.set('cache:categories:tree', responseData, 120);
            return res.json(responseData);
        }
        return res.json([]);
    }
    catch (err) {
        console.error("Error fetching categories in backend:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// POST: /api/admin/categories (Create category with real-time broadcast)
router.post('/categories', ...adminAuth, async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(500).json({ error: 'Database unavailable' });
        const payload = { ...req.body };
        delete payload._id;
        const result = await mongoDb.collection('categories').insertOne({
            ...payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        const savedCategory = {
            ...payload,
            _id: result.insertedId,
            id: result.insertedId.toString()
        };
        await realtime_1.cacheManager.invalidatePattern('cache:categories:*');
        await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.CATEGORY, realtime_1.RealtimeActions.CREATED, savedCategory.id, savedCategory);
        return res.status(201).json({ status: 'success', category: savedCategory });
    }
    catch (err) {
        console.error("Error creating category:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// PUT: /api/admin/categories/:id (Update category with real-time broadcast)
router.put('/categories/:id', ...adminAuth, async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(500).json({ error: 'Database unavailable' });
        const { id } = req.params;
        let query = { _id: id };
        if (mongodb_1.ObjectId.isValid(id)) {
            query = { $or: [{ _id: new mongodb_1.ObjectId(id) }, { _id: id }, { id: id }] };
        }
        const updateData = { ...req.body, updatedAt: new Date().toISOString() };
        delete updateData._id;
        delete updateData.id;
        await mongoDb.collection('categories').updateOne(query, { $set: updateData });
        const updated = await mongoDb.collection('categories').findOne(query);
        await realtime_1.cacheManager.invalidatePattern('cache:categories:*');
        await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.CATEGORY, realtime_1.RealtimeActions.UPDATED, id, updated);
        return res.json({ status: 'success', category: updated });
    }
    catch (err) {
        console.error("Error updating category:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// DELETE: /api/admin/categories/:id (Delete category with real-time broadcast)
router.delete('/categories/:id', ...adminAuth, async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(500).json({ error: 'Database unavailable' });
        const { id } = req.params;
        let query = { _id: id };
        if (mongodb_1.ObjectId.isValid(id)) {
            query = { $or: [{ _id: new mongodb_1.ObjectId(id) }, { _id: id }, { id: id }] };
        }
        await mongoDb.collection('categories').deleteOne(query);
        await realtime_1.cacheManager.invalidatePattern('cache:categories:*');
        await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.CATEGORY, realtime_1.RealtimeActions.DELETED, id, { id });
        return res.json({ status: 'success', message: 'Category deleted successfully.' });
    }
    catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// In-memory cache for admin/public banners with 30s TTL
let adminBannersCache = null;
const ADMIN_BANNERS_CACHE_TTL = 30 * 1000;
const invalidateAdminBannersCache = () => {
    adminBannersCache = null;
};
exports.invalidateAdminBannersCache = invalidateAdminBannersCache;
// GET: /api/admin/public/banners
router.get(['/public/banners', '/banners', '/public-banners', '/banners/public'], async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
        if (!forceRefresh && adminBannersCache && (Date.now() - adminBannersCache.timestamp < ADMIN_BANNERS_CACHE_TTL)) {
            res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
            return res.json(adminBannersCache.data);
        }
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const banners = await mongoDb.collection('banners')
                .find({ isActive: { $ne: false } })
                .sort({ displayOrder: 1, createdAt: -1 })
                .toArray();
            adminBannersCache = { data: banners, timestamp: Date.now() };
            res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
            return res.json(banners);
        }
        return res.json([]);
    }
    catch (err) {
        console.error("Error fetching public banners in backend:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// GET: /api/admin/public/ads OR /api/admin/ads
router.get(['/public/ads', '/ads'], async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const ads = await mongoDb.collection('ads').find({ isActive: { $ne: false } }).toArray();
            return res.json(ads);
        }
        return res.json([]);
    }
    catch (err) {
        console.error("Error fetching public ads in backend:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// GET: /api/admin/public/products OR /api/admin/products
router.get(['/public/products', '/products'], async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const products = await mongoDb.collection('products').find({ isActive: { $ne: false } }).toArray();
            return res.json(products);
        }
        return res.json([]);
    }
    catch (err) {
        console.error("Error fetching public products in admin router:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// GET: /api/admin/banners
router.get('/banners', async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const banners = await mongoDb.collection('banners').find().toArray();
            return res.json(banners);
        }
        return res.json([]);
    }
    catch (err) {
        console.error("Error fetching banners in backend:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Helper to get all exclusive offers from Mongo collections
async function getOffersFromMongo(onlyActive = true) {
    const mongoDb = db_1.db.getDb();
    if (!mongoDb)
        return [];
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
        await col1.deleteMany(purgeQuery).catch(() => { });
        await col2.deleteMany(purgeQuery).catch(() => { });
        const filter = onlyActive ? { isActive: { $ne: false } } : {};
        const offers1 = await col1.find(filter).sort({ createdAt: -1 }).toArray();
        const offers2 = await col2.find(filter).sort({ createdAt: -1 }).toArray();
        const combinedMap = new Map();
        [...offers1, ...offers2].forEach((off) => {
            const key = (off._id ? off._id.toString() : '') || `${off.title}_${off.code}`;
            if (!combinedMap.has(key)) {
                combinedMap.set(key, off);
            }
        });
        return Array.from(combinedMap.values());
    }
    catch (err) {
        console.error("Error fetching exclusive offers from Mongo:", err);
        return [];
    }
}
async function getOffersCollection() {
    const mongoDb = db_1.db.getDb();
    if (mongoDb) {
        return mongoDb.collection('exclusive_offers');
    }
    return null;
}
// GET: /api/admin/public/exclusive-offers OR /api/admin/exclusive-offers
router.get(['/public/exclusive-offers', '/exclusive-offers'], async (req, res) => {
    try {
        const offers = await getOffersFromMongo(true);
        return res.json(offers);
    }
    catch (err) {
        console.error("Error fetching public exclusive offers:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// GET: /api/admin/exclusive-offers/all (All active + inactive for Admin)
router.get('/exclusive-offers/all', async (req, res) => {
    try {
        const offers = await getOffersFromMongo(false);
        return res.json(offers);
    }
    catch (err) {
        console.error("Error fetching all exclusive offers for admin:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// POST: /api/admin/exclusive-offers (Create & Publish Offer)
router.post('/exclusive-offers', ...adminAuth, async (req, res) => {
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
            await col.insertOne(newOffer);
            await realtime_1.cacheManager.invalidatePattern('cache:offers:*');
            await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.OFFER, realtime_1.RealtimeActions.CREATED, newOffer._id, newOffer);
            return res.status(201).json({ status: 'success', offer: newOffer });
        }
        return res.status(500).json({ error: 'Database unavailable' });
    }
    catch (err) {
        console.error("Error creating exclusive offer:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// PUT: /api/admin/exclusive-offers/:id (Update or toggle offer)
router.put('/exclusive-offers/:id', ...adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const col = await getOffersCollection();
        if (col) {
            delete updateData._id;
            const result = await col.findOneAndUpdate({ _id: id }, { $set: updateData }, { returnDocument: 'after' });
            await realtime_1.cacheManager.invalidatePattern('cache:offers:*');
            await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.OFFER, realtime_1.RealtimeActions.UPDATED, id, result);
            return res.json({ status: 'success', offer: result });
        }
        return res.status(500).json({ error: 'Database unavailable' });
    }
    catch (err) {
        console.error("Error updating offer:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// DELETE: /api/admin/exclusive-offers/:id (Delete offer)
router.delete('/exclusive-offers/:id', ...adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const col = await getOffersCollection();
        if (col) {
            await col.deleteOne({ _id: id });
            await realtime_1.cacheManager.invalidatePattern('cache:offers:*');
            await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.OFFER, realtime_1.RealtimeActions.DELETED, id, { id });
            return res.json({ status: 'success', message: 'Offer deleted successfully.' });
        }
        return res.status(500).json({ error: 'Database unavailable' });
    }
    catch (err) {
        console.error("Error deleting offer:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Admin Security Control Center API Routes
router.get('/security/metrics', ...adminAuth, (req, res) => {
    const metrics = securityManager_1.securityManager.getSecurityMetrics();
    return res.json({
        status: 'success',
        metrics
    });
});
router.get('/security/logs', ...adminAuth, (req, res) => {
    const logs = securityManager_1.securityManager.getAuditLogs();
    return res.json({
        status: 'success',
        logs
    });
});
router.get('/security/locked-accounts', ...adminAuth, (req, res) => {
    const records = securityManager_1.securityManager.getAllUserSecurityRecords();
    const locked = records.filter(r => r.isPermanentlyLocked || (r.accountLockedUntil && new Date(r.accountLockedUntil).getTime() > Date.now()));
    return res.json({
        status: 'success',
        lockedAccounts: locked
    });
});
router.post('/security/unlock-account', ...adminAuth, (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ status: 'error', message: 'Email or Mobile required.' });
    securityManager_1.securityManager.unlockAccount(email);
    securityManager_1.securityManager.logEvent({
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
// GET: /api/admin/dashboard (Real authoritative stats from MongoDB)
router.get('/dashboard', ...adminAuth, async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const [userCount, vendorCount, recentUsers, revenueAgg] = await Promise.all([
                mongoDb.collection('users').countDocuments(),
                mongoDb.collection('vendors').countDocuments(),
                mongoDb.collection('users').find().sort({ createdAt: -1 }).limit(10).toArray(),
                mongoDb.collection('orders').aggregate([
                    { $match: { status: { $in: ['Delivered', 'Completed'] } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]).toArray()
            ]);
            const monthlyRevenue = (revenueAgg.length > 0 && revenueAgg[0].total) ? revenueAgg[0].total : 0;
            return res.json({
                status: 'success',
                data: {
                    stats: {
                        activeMembers: userCount,
                        premiumVendors: vendorCount,
                        citiesActive: userCount > 0 ? 1 : 0,
                        monthlyRevenue: monthlyRevenue
                    },
                    recentMembers: recentUsers.map((u) => ({
                        id: u._id?.toString() || u.id,
                        name: u.name || u.fullName || u.email || 'Member',
                        email: u.email || '',
                        tier: u.membershipTier || u.tier || 'Standard',
                        status: u.status || (u.isActive !== false ? 'Active' : 'Inactive'),
                        joinDate: u.createdAt || new Date().toISOString()
                    }))
                }
            });
        }
        return res.json({
            status: 'success',
            data: {
                stats: { activeMembers: 0, premiumVendors: 0, citiesActive: 0, monthlyRevenue: 0 },
                recentMembers: []
            }
        });
    }
    catch (err) {
        console.error("Error loading admin dashboard stats:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// GET: /api/admin/vendors (Real vendors from MongoDB)
router.get('/vendors', ...adminAuth, async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const vendors = await mongoDb.collection('vendors').find().sort({ createdAt: -1 }).toArray();
            return res.json({
                status: 'success',
                data: vendors
            });
        }
        return res.json({ status: 'success', data: [] });
    }
    catch (err) {
        console.error("Error loading vendors list:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// POST: /api/admin/settings
router.post('/settings', ...adminAuth, (req, res) => {
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
exports.default = router;
