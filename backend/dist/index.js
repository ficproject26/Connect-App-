"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidatePublicProductsCache = exports.invalidatePublicBannersCache = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const admin_1 = __importDefault(require("./routes/admin"));
const auth_1 = __importDefault(require("./routes/auth"));
const vendors_1 = __importDefault(require("./routes/vendors"));
const delivery_1 = __importDefault(require("./routes/delivery"));
const orders_1 = __importDefault(require("./routes/orders"));
const maps_1 = __importDefault(require("./routes/maps"));
const membership_1 = __importDefault(require("./routes/membership"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const territory_1 = __importDefault(require("./routes/territory"));
const db_1 = require("./db");
const middleware_1 = require("./security/middleware");
const cloudinary_1 = require("./cloudinary");
const mongodb_1 = require("mongodb");
const realtime_1 = require("./realtime");
// Load environmental variables
dotenv_1.default.config();
// Global Process Crash Prevention Guards
process.on('uncaughtException', (err) => {
    console.error('[Process]: Uncaught exception (gracefully handled):', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
    console.warn('[Process]: Unhandled promise rejection (gracefully handled):', reason?.message || reason);
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Configure Express trust proxy for Nginx reverse proxy topology.
// 1 = Trust first hop (Nginx reverse proxy), enabling express-rate-limit to correctly
// resolve client IP from X-Forwarded-For without trusting spoofed upstream headers.
app.set('trust proxy', 1);
// Remove X-Powered-By header (Helmet v7+ no longer handles this — must be set on app directly)
app.disable('x-powered-by');
// OWASP Security Headers (Helmet v8) & Input Sanitization
app.use(middleware_1.helmetSecurityMiddleware);
// Universal CORS Header Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    else {
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
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
const path_1 = __importDefault(require("path"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(middleware_1.sanitizeInputsMiddleware);
// Serve static uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Base Health Check Route
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Connect App Enterprise REST API is running with OWASP Security enabled.',
        timestamp: new Date().toISOString()
    });
});
// Mount Routes
app.use('/api/admin', admin_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/customer', auth_1.default);
app.use('/api/vendors', vendors_1.default);
app.use('/api/delivery-partners', delivery_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/maps', maps_1.default);
app.use('/api/membership', membership_1.default);
app.use('/api/wallet', wallet_1.default);
app.use('/api/territory', territory_1.default);
// Public Categories Endpoints
app.get(['/api/public/categories', '/api/categories'], async (req, res) => {
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
// Cache invalidator for public banners
const invalidatePublicBannersCache = async () => {
    await realtime_1.cacheManager.invalidatePattern('cache:banners:*');
};
exports.invalidatePublicBannersCache = invalidatePublicBannersCache;
// Public Banners Endpoints
app.get(['/api/public/banners', '/api/banners', '/api/public-banners', '/api/banners/public', '/api/admin/public/banners', '/api/admin/public-banners', '/api/admin/banners/public'], async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
        if (!forceRefresh) {
            const cached = await realtime_1.cacheManager.get('cache:banners:public');
            if (cached) {
                res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
                return res.json(cached);
            }
        }
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const banners = await mongoDb.collection('banners')
                .find({ isActive: { $ne: false } })
                .sort({ displayOrder: 1, createdAt: -1 })
                .toArray();
            await realtime_1.cacheManager.set('cache:banners:public', banners, 120);
            res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
            return res.json(banners);
        }
        return res.json([]);
    }
    catch (err) {
        console.error("Error fetching public banners in index.ts:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Public Ads Endpoints
app.get(['/api/public/ads', '/api/ads'], async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
        if (!forceRefresh) {
            const cached = await realtime_1.cacheManager.get('cache:ads:public');
            if (cached)
                return res.json(cached);
        }
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const ads = await mongoDb.collection('ads').find({ isActive: { $ne: false } }).toArray();
            await realtime_1.cacheManager.set('cache:ads:public', ads, 120);
            return res.json(ads);
        }
        return res.json([]);
    }
    catch (err) {
        console.error("Error fetching public ads in index.ts:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Cache invalidator for public products
const invalidatePublicProductsCache = async () => {
    await realtime_1.cacheManager.invalidatePattern('cache:products:*');
};
exports.invalidatePublicProductsCache = invalidatePublicProductsCache;
// Public Products Endpoints (Customer & Vendor products)
app.get(['/api/public/products', '/api/products'], async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
        if (!forceRefresh) {
            const cached = await realtime_1.cacheManager.get('cache:products:public');
            if (cached) {
                return res.json(cached);
            }
        }
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const [suspendedUsers, suspendedVendorsCol, allVendorUsers, allProducts] = await Promise.all([
                mongoDb.collection('users').find({
                    $or: [
                        { status: { $in: ['suspended', 'Suspended', 'rejected', 'Rejected', 'inactive', 'Inactive', 'deactivated', 'Deactivated', 'blocked', 'Blocked'] } },
                        { isActive: false }
                    ]
                }, { projection: { _id: 1, email: 1, phone: 1, mobileNumber: 1, businessName: 1, name: 1, registrationId: 1, vendorId: 1, primaryBusinessId: 1, businesses: 1 } }).toArray(),
                mongoDb.collection('vendors').find({
                    $or: [
                        { status: { $in: ['suspended', 'Suspended', 'rejected', 'Rejected', 'inactive', 'Inactive', 'deactivated', 'Deactivated', 'blocked', 'Blocked'] } },
                        { isActive: false }
                    ]
                }, { projection: { _id: 1, email: 1, phone: 1, mobileNumber: 1, businessName: 1, registrationId: 1, vendorId: 1 } }).toArray(),
                mongoDb.collection('users').find({
                    $or: [
                        { role: { $in: ['vendor', 'Vendor', 'merchant', 'Merchant'] } },
                        { vendorType: { $exists: true } },
                        { businesses: { $exists: true, $not: { $size: 0 } } }
                    ]
                }, { projection: { _id: 1, email: 1, phone: 1, mobileNumber: 1, businessName: 1, name: 1, registrationId: 1, vendorId: 1, businesses: 1 } }).toArray(),
                mongoDb.collection('products').find({ isActive: { $ne: false }, isAvailable: { $ne: false } }).sort({ createdAt: -1 }).toArray()
            ]);
            const suspendedVendorIds = new Set();
            const suspendedVendorEmails = new Set();
            const suspendedVendorPhones = new Set();
            const suspendedVendorNames = new Set();
            const suspendedVendorPrefixes = new Set();
            const isGenericVendorName = (nameStr) => {
                const norm = (nameStr || '').toString().toLowerCase().trim();
                return !norm || ['connect member', 'verified vendor', 'elite vendor', 'vendor', 'connect', 'customer', 'admin', 'connect customer'].includes(norm);
            };
            [...suspendedUsers, ...suspendedVendorsCol].forEach((v) => {
                if (v._id) {
                    const idStr = v._id.toString();
                    suspendedVendorIds.add(idStr);
                    if (idStr.length >= 16)
                        suspendedVendorPrefixes.add(idStr.substring(0, 16));
                }
                if (v.registrationId)
                    suspendedVendorIds.add(v.registrationId.toString());
                if (v.vendorId)
                    suspendedVendorIds.add(v.vendorId.toString());
                if (v.primaryBusinessId)
                    suspendedVendorIds.add(v.primaryBusinessId.toString());
                if (Array.isArray(v.businesses)) {
                    v.businesses.forEach((b) => {
                        if (b._id)
                            suspendedVendorIds.add(b._id.toString());
                    });
                }
                if (v.email)
                    suspendedVendorEmails.add(v.email.toLowerCase().trim());
                const phone = (v.phone || v.mobileNumber || '').replace(/\D/g, '');
                if (phone)
                    suspendedVendorPhones.add(phone);
                if (v.businessName && !isGenericVendorName(v.businessName))
                    suspendedVendorNames.add(v.businessName.toLowerCase().trim());
                if (v.name && !isGenericVendorName(v.name))
                    suspendedVendorNames.add(v.name.toLowerCase().trim());
            });
            const suspendedVendorBizKeys = new Set();
            allVendorUsers.forEach((v) => {
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
                    v.businesses.forEach((b) => {
                        const bStatus = (b.status || '').toLowerCase().trim();
                        const isBActive = (bStatus === 'active' || bStatus === 'approved') && b.isActive !== false;
                        if (!isBActive) {
                            const bId = b._id ? b._id.toString() : '';
                            const bName = (b.businessName || b.name || '').toLowerCase().trim();
                            vKeys.forEach(vKey => {
                                if (bId)
                                    suspendedVendorBizKeys.add(`${vKey}:${bId}`);
                                if (bName && !isGenericVendorName(bName))
                                    suspendedVendorBizKeys.add(`${vKey}:${bName}`);
                            });
                        }
                    });
                }
            });
            const activeProducts = allProducts.filter((p) => {
                if (p.isActive === false || p.isAvailable === false)
                    return false;
                if (p.isVendorSuspended === true || p.isSuspended === true)
                    return false;
                const pVendorStatus = (p.vendorStatus || p.status || '').toLowerCase().trim();
                if (['suspended', 'inactive', 'rejected', 'blocked', 'deactivated'].includes(pVendorStatus))
                    return false;
                const vId = p.vendorId ? p.vendorId.toString() : '';
                const vEmail = (p.vendorEmail || '').toLowerCase().trim();
                const vPhone = (p.vendorPhone || '').replace(/\D/g, '');
                const vName = (p.vendorName || p.brand || '').toLowerCase().trim();
                if (vId && suspendedVendorIds.has(vId))
                    return false;
                if (vEmail && suspendedVendorEmails.has(vEmail))
                    return false;
                if (vPhone && suspendedVendorPhones.has(vPhone))
                    return false;
                if (vName && !isGenericVendorName(vName) && suspendedVendorNames.has(vName))
                    return false;
                if (vId && Array.from(suspendedVendorPrefixes).some(prefix => vId.startsWith(prefix)))
                    return false;
                if (p.businessIsActive === false)
                    return false;
                const pBizStatus = (p.businessStatus || '').toLowerCase().trim();
                if (['suspended', 'inactive', 'rejected', 'blocked', 'deactivated'].includes(pBizStatus))
                    return false;
                const pBizId = p.businessId ? p.businessId.toString() : (p.business ? (p.business._id?.toString() || p.business.id?.toString()) : '');
                const pBizName = (p.businessName || p.business?.businessName || p.business?.name || p.subNavbarCategory || '').toLowerCase().trim();
                const productVendorKeys = [vId, vEmail, vPhone, vName].filter(Boolean);
                const isThisVendorBizSuspended = productVendorKeys.some(vKey => {
                    if (pBizId && suspendedVendorBizKeys.has(`${vKey}:${pBizId}`))
                        return true;
                    if (pBizName && suspendedVendorBizKeys.has(`${vKey}:${pBizName}`))
                        return true;
                    return false;
                });
                if (isThisVendorBizSuspended)
                    return false;
                return true;
            });
            const mappedActiveProducts = activeProducts.map((p) => {
                let primaryImg = p.imageUrl || p.image || '';
                if (!primaryImg && Array.isArray(p.images) && p.images.length > 0) {
                    const first = p.images[0];
                    primaryImg = typeof first === 'string' ? first : (first?.url || '');
                }
                if (!primaryImg && Array.isArray(p.imageUrls) && p.imageUrls.length > 0) {
                    primaryImg = p.imageUrls[0] || '';
                }
                const normalizedImages = Array.isArray(p.images) && p.images.length > 0
                    ? p.images.map((img) => typeof img === 'string' ? { url: img } : img)
                    : (primaryImg ? [{ url: primaryImg }] : []);
                const normalizedImageUrls = Array.isArray(p.imageUrls) && p.imageUrls.length > 0
                    ? p.imageUrls
                    : (primaryImg ? [primaryImg] : []);
                return {
                    ...p,
                    id: p.id || (p._id ? p._id.toString() : ''),
                    imageUrl: primaryImg,
                    image: primaryImg,
                    images: normalizedImages,
                    imageUrls: normalizedImageUrls
                };
            });
            await realtime_1.cacheManager.set('cache:products:public', mappedActiveProducts, 120);
            return res.json(mappedActiveProducts);
        }
        return res.json([]);
    }
    catch (err) {
        console.error("Error fetching public products in backend:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Direct Image Upload Endpoint (Persists permanently to Cloudinary)
app.post(['/api/upload', '/api/products/upload-image', '/api/admin/upload'], async (req, res) => {
    try {
        const { image, file, folder } = req.body;
        const rawImage = image || file;
        if (!rawImage) {
            return res.status(400).json({ success: false, error: 'No image data provided' });
        }
        const uploadRes = await (0, cloudinary_1.uploadToCloudinary)(rawImage, folder || 'products');
        if (!uploadRes.success || !uploadRes.secure_url) {
            return res.status(500).json({ success: false, error: uploadRes.error || 'Failed to upload image' });
        }
        return res.json({
            success: true,
            url: uploadRes.secure_url,
            secure_url: uploadRes.secure_url,
            publicId: uploadRes.publicId
        });
    }
    catch (err) {
        console.error("Error in upload route:", err);
        res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
});
// Single Product Fetch Endpoint
app.get(['/api/products/:id', '/api/public/products/:id'], async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(500).json({ error: 'Database unavailable' });
        const { id } = req.params;
        let query = { _id: id };
        if (mongodb_1.ObjectId.isValid(id)) {
            query = { $or: [{ _id: new mongodb_1.ObjectId(id) }, { _id: id }, { id: id }] };
        }
        const product = await mongoDb.collection('products').findOne(query);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        let primaryImg = product.imageUrl || product.image || '';
        if (!primaryImg && Array.isArray(product.images) && product.images.length > 0) {
            const first = product.images[0];
            primaryImg = typeof first === 'string' ? first : (first?.url || '');
        }
        if (!primaryImg && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
            primaryImg = product.imageUrls[0] || '';
        }
        return res.json({
            ...product,
            id: product.id || product._id?.toString(),
            imageUrl: primaryImg,
            image: primaryImg,
            images: Array.isArray(product.images) ? product.images : (primaryImg ? [{ url: primaryImg }] : []),
            imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls : (primaryImg ? [primaryImg] : [])
        });
    }
    catch (err) {
        console.error("Error fetching single product:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Product Creation Endpoint with Cloudinary Persistence
app.post(['/api/products', '/api/public/products', '/api/admin/products'], async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(500).json({ error: 'Database unavailable' });
        const payload = { ...req.body };
        delete payload._id;
        // Process primary image if base64 data URI
        let primaryImageUrl = payload.imageUrl || payload.image || '';
        if (primaryImageUrl && typeof primaryImageUrl === 'string' && primaryImageUrl.startsWith('data:image/')) {
            const uploadRes = await (0, cloudinary_1.uploadToCloudinary)(primaryImageUrl, 'products');
            if (uploadRes.success && uploadRes.secure_url) {
                primaryImageUrl = uploadRes.secure_url;
            }
        }
        // Process multiple images array if provided
        let processedImages = [];
        if (Array.isArray(payload.images) && payload.images.length > 0) {
            for (const imgItem of payload.images) {
                const rawUrl = typeof imgItem === 'string' ? imgItem : (imgItem?.url || '');
                if (rawUrl && rawUrl.startsWith('data:image/')) {
                    const uploadRes = await (0, cloudinary_1.uploadToCloudinary)(rawUrl, 'products');
                    if (uploadRes.success && uploadRes.secure_url) {
                        processedImages.push({ url: uploadRes.secure_url, publicId: uploadRes.publicId });
                    }
                }
                else if (rawUrl) {
                    processedImages.push(typeof imgItem === 'object' ? imgItem : { url: rawUrl });
                }
            }
        }
        else if (primaryImageUrl) {
            processedImages = [{ url: primaryImageUrl }];
        }
        // If primaryImageUrl was empty but processedImages has items, use the first
        if (!primaryImageUrl && processedImages.length > 0) {
            primaryImageUrl = processedImages[0].url || '';
        }
        const processedImageUrls = processedImages.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
        const newProduct = {
            ...payload,
            imageUrl: primaryImageUrl,
            image: primaryImageUrl,
            images: processedImages,
            imageUrls: processedImageUrls,
            isActive: payload.isActive !== false,
            isAvailable: payload.isAvailable !== false,
            createdAt: payload.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const insertResult = await mongoDb.collection('products').insertOne(newProduct);
        await (0, exports.invalidatePublicProductsCache)();
        const savedProduct = {
            ...newProduct,
            _id: insertResult.insertedId,
            id: insertResult.insertedId.toString()
        };
        // Publish event after DB commit
        await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.PRODUCT, realtime_1.RealtimeActions.CREATED, savedProduct.id, savedProduct);
        return res.status(201).json({
            success: true,
            message: 'Product created successfully with permanent image persistence.',
            product: savedProduct
        });
    }
    catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Product Update Endpoint (PRESERVES EXISTING IMAGES WHEN NOT CHANGED)
const handleUpdateProduct = async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(500).json({ error: 'Database unavailable' });
        const { id } = req.params;
        let query = { _id: id };
        if (mongodb_1.ObjectId.isValid(id)) {
            query = { $or: [{ _id: new mongodb_1.ObjectId(id) }, { _id: id }, { id: id }] };
        }
        const existing = await mongoDb.collection('products').findOne(query);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const updatePayload = { ...req.body };
        delete updatePayload._id;
        delete updatePayload.id;
        // Check if new images are provided or if existing should be preserved
        let updatedImageUrl = updatePayload.imageUrl !== undefined ? updatePayload.imageUrl : (updatePayload.image !== undefined ? updatePayload.image : undefined);
        let updatedImages = updatePayload.images;
        let updatedImageUrls = updatePayload.imageUrls;
        // If updatePayload did not provide an image or sent empty string, and user did not explicitly flag removeImage,
        // PRESERVE the existing product's images!
        const isExplicitlyRemoving = updatePayload.removeImage === true;
        if (!isExplicitlyRemoving) {
            if (!updatedImageUrl && !updatedImages?.length && !updatedImageUrls?.length) {
                // Retain existing image references
                updatedImageUrl = existing.imageUrl || existing.image || '';
                updatedImages = existing.images || (updatedImageUrl ? [{ url: updatedImageUrl }] : []);
                updatedImageUrls = existing.imageUrls || (updatedImageUrl ? [updatedImageUrl] : []);
            }
        }
        // If new image is base64, upload to Cloudinary
        if (updatedImageUrl && typeof updatedImageUrl === 'string' && updatedImageUrl.startsWith('data:image/')) {
            const uploadRes = await (0, cloudinary_1.uploadToCloudinary)(updatedImageUrl, 'products');
            if (uploadRes.success && uploadRes.secure_url) {
                updatedImageUrl = uploadRes.secure_url;
            }
        }
        // Process images array if provided
        if (Array.isArray(updatedImages) && updatedImages.length > 0) {
            const processed = [];
            for (const imgItem of updatedImages) {
                const rawUrl = typeof imgItem === 'string' ? imgItem : (imgItem?.url || '');
                if (rawUrl && rawUrl.startsWith('data:image/')) {
                    const uploadRes = await (0, cloudinary_1.uploadToCloudinary)(rawUrl, 'products');
                    if (uploadRes.success && uploadRes.secure_url) {
                        processed.push({ url: uploadRes.secure_url, publicId: uploadRes.publicId });
                    }
                }
                else if (rawUrl) {
                    processed.push(typeof imgItem === 'object' ? imgItem : { url: rawUrl });
                }
            }
            updatedImages = processed;
            updatedImageUrls = processed.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
            if (!updatedImageUrl && updatedImages.length > 0) {
                updatedImageUrl = updatedImages[0].url || '';
            }
        }
        updatePayload.imageUrl = updatedImageUrl;
        updatePayload.image = updatedImageUrl;
        updatePayload.images = updatedImages;
        updatePayload.imageUrls = updatedImageUrls;
        updatePayload.updatedAt = new Date().toISOString();
        await mongoDb.collection('products').updateOne(query, { $set: updatePayload });
        await (0, exports.invalidatePublicProductsCache)();
        const finalProduct = await mongoDb.collection('products').findOne(query);
        const mappedFinal = {
            ...finalProduct,
            id: finalProduct?._id?.toString() || id
        };
        // Publish event after DB commit
        await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.PRODUCT, realtime_1.RealtimeActions.UPDATED, mappedFinal.id, mappedFinal);
        return res.json({
            success: true,
            message: 'Product updated successfully while preserving images.',
            product: mappedFinal
        });
    }
    catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};
app.put(['/api/products/:id', '/api/public/products/:id', '/api/admin/products/:id'], handleUpdateProduct);
app.patch(['/api/products/:id', '/api/public/products/:id', '/api/admin/products/:id'], handleUpdateProduct);
// Product Deletion Endpoint
app.delete(['/api/products/:id', '/api/public/products/:id', '/api/admin/products/:id'], async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(500).json({ error: 'Database unavailable' });
        const { id } = req.params;
        let query = { _id: id };
        if (mongodb_1.ObjectId.isValid(id)) {
            query = { $or: [{ _id: new mongodb_1.ObjectId(id) }, { _id: id }, { id: id }] };
        }
        await mongoDb.collection('products').deleteOne(query);
        await (0, exports.invalidatePublicProductsCache)();
        // Publish event after DB commit
        await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.PRODUCT, realtime_1.RealtimeActions.DELETED, id, { id });
        return res.json({ success: true, message: 'Product deleted successfully.' });
    }
    catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
app.delete('/api/public/products/delete-all', async (req, res) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            await mongoDb.collection('products').deleteMany({});
            await (0, exports.invalidatePublicProductsCache)();
            await realtime_1.eventPublisher.publishEvent(realtime_1.RealtimeEntities.PRODUCT, realtime_1.RealtimeActions.DELETED, 'all', { all: true });
            return res.json({ success: true, message: 'All products deleted successfully.' });
        }
        return res.status(500).json({ error: 'Database unavailable' });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Observability Health & Metrics Endpoints
app.get(['/api/realtime/health', '/health/realtime'], async (req, res) => {
    try {
        const health = await (0, realtime_1.getRealtimeHealth)();
        return res.json(health);
    }
    catch (err) {
        return res.status(500).json({ status: 'error', error: err.message });
    }
});
app.get(['/api/realtime/metrics', '/metrics/realtime'], async (req, res) => {
    try {
        const metrics = await (0, realtime_1.getRealtimeHealth)();
        return res.json(metrics);
    }
    catch (err) {
        return res.status(500).json({ status: 'error', error: err.message });
    }
});
// Catch-all 404 handler for non-existent API routes with CORS headers
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.url} not found` });
});
// Global Express Error Handler with CORS headers
app.use((err, req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    console.error('Server Error:', err);
    res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});
// Create HTTP server and initialize global real-time architecture
const server = http_1.default.createServer(app);
(0, realtime_1.initRealtimeInfrastructure)(server).catch(err => {
    console.error('[Realtime]: Infrastructure initialization issue:', err);
});
// Bind server immediately to 0.0.0.0 on PORT for Render cloud port scanner detection
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server]: Connect App Backend running on 0.0.0.0:${PORT} with DevSecOps Security`);
});
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[Server FATAL]: Port ${PORT} is already in use by another process. Please check 'sudo lsof -i :${PORT}' or ensure previous PM2 process gracefully shut down.`);
        process.exit(1);
    }
    else {
        console.error('[Server Error]:', err);
    }
});
// Connect to Database asynchronously
db_1.db.connect()
    .then(() => {
    console.log('[Server]: Database connection initialized and ready.');
})
    .catch((err) => {
    console.error('[Server]: Database connection issue during startup:', err.message);
});
