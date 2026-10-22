"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
const securityManager_1 = require("../security/securityManager");
const middleware_1 = require("../security/middleware");
const customerIdService_1 = require("../services/customerIdService");
const roleAuthorization_1 = require("../security/roleAuthorization");
const smsService_1 = require("../services/smsService");
const router = (0, express_1.Router)();
const normalizeAddressStr = (addr) => {
    if (!addr)
        return '';
    if (typeof addr === 'string')
        return addr.trim().toLowerCase().replace(/\s+/g, ' ');
    const name = String(addr.name || addr.receiverName || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const phone = String(addr.phone || addr.mobileNumber || addr.mobile || '').replace(/\D/g, '').slice(-10);
    const pincode = String(addr.pincode || addr.zip || '').replace(/\D/g, '').slice(0, 6);
    const locality = String(addr.locality || addr.area || addr.sector || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const street = String(addr.address || addr.street || addr.houseNo || addr.flat || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const city = String(addr.city || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const state = String(addr.state || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const parts = [name, phone, pincode, locality, street, city, state];
    return parts.filter(Boolean).join('|');
};
const deduplicateAddresses = (addrList) => {
    if (!Array.isArray(addrList))
        return [];
    const seen = new Set();
    const result = [];
    for (const item of addrList) {
        if (!item)
            continue;
        const key = normalizeAddressStr(item);
        if (!key)
            continue;
        if (!seen.has(key)) {
            seen.add(key);
            result.push(item);
        }
    }
    return result;
};
const resolveCanonicalCustomerId = async (mongoDb, userOrDoc) => {
    if (!userOrDoc)
        return '';
    const existingId = userOrDoc.customerId || userOrDoc.registrationId;
    if ((0, customerIdService_1.isValidCustomerId)(existingId)) {
        return existingId;
    }
    if (!mongoDb)
        return existingId || '';
    const regDate = userOrDoc.createdAt || userOrDoc.created_at ? new Date(userOrDoc.createdAt || userOrDoc.created_at) : new Date();
    const newId = await (0, customerIdService_1.generateCustomerId)(mongoDb, regDate);
    const uId = userOrDoc._id || userOrDoc.id;
    if (uId) {
        await mongoDb.collection('users').updateOne({ _id: uId }, { $set: { customerId: newId, registrationId: newId } }).catch(() => { });
        await mongoDb.collection('customers').updateOne({ _id: uId }, { $set: { customerId: newId, registrationId: newId } }).catch(() => { });
    }
    return newId;
};
const buildCustomerMongoFilter = (input) => {
    if (!input)
        return { _id: null };
    const rawTargets = [];
    if (typeof input === 'string') {
        if (input.trim())
            rawTargets.push(input.trim());
    }
    else if (typeof input === 'object' && input !== null) {
        if (input.userId)
            rawTargets.push(String(input.userId));
        if (input.customerId)
            rawTargets.push(String(input.customerId));
        if (input.registrationId)
            rawTargets.push(String(input.registrationId));
        if (input.id)
            rawTargets.push(String(input.id));
        if (input.email)
            rawTargets.push(String(input.email));
        if (input.phone)
            rawTargets.push(String(input.phone));
    }
    const cleanTargets = Array.from(new Set(rawTargets.map(t => t.trim()).filter(Boolean)));
    if (cleanTargets.length === 0)
        return { _id: null };
    const orConds = [];
    cleanTargets.forEach(t => {
        orConds.push({ id: t });
        orConds.push({ customerId: t });
        orConds.push({ registrationId: t });
        orConds.push({ email: t.toLowerCase() });
        orConds.push({ _id: t });
        if (mongodb_1.ObjectId.isValid(t)) {
            try {
                orConds.push({ _id: new mongodb_1.ObjectId(t) });
            }
            catch (e) { }
        }
        const cleanDigits = t.replace(/\D/g, '');
        if (cleanDigits && cleanDigits.length >= 10) {
            orConds.push({ phone: cleanDigits });
            orConds.push({ phone: `+91${cleanDigits}` });
            orConds.push({ phone: `91${cleanDigits}` });
        }
    });
    return { $or: orConds };
};
const findCustomerInMongo = async (identifier) => {
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb || !identifier)
            return null;
        const lower = identifier.toLowerCase().trim();
        const cleanDigits = identifier.replace(/\D/g, '');
        const orConds = [{ email: lower }, { phone: lower }];
        if (cleanDigits) {
            orConds.push({ phone: cleanDigits });
            orConds.push({ phone: `+91${cleanDigits}` });
            orConds.push({ phone: `91${cleanDigits}` });
            orConds.push({ phone: new RegExp(cleanDigits + '$') });
        }
        let user = await mongoDb.collection('users').findOne({ $or: orConds });
        if (!user) {
            user = await mongoDb.collection('customers').findOne({ $or: orConds });
            if (user) {
                // Auto-sync into users collection so all authentication lookups stay unified
                try {
                    const userClone = { ...user };
                    delete userClone._id;
                    await mongoDb.collection('users').updateOne({ _id: user._id }, { $set: userClone }, { upsert: true }).catch(() => { });
                }
                catch (syncErr) { }
            }
        }
        return user;
    }
    catch (err) {
        console.error("MongoDB customer lookup error:", err);
        return null;
    }
};
// Strict Indian Mobile Number Regex: ^[6-9][0-9]{9}$
const INDIAN_MOBILE_REGEX = /^[6-9][0-9]{9}$/;
const formatCapitalizedName = (val) => {
    if (!val)
        return '';
    const noLeading = val.replace(/^\s+/, '');
    return noLeading.replace(/(^|[\s.\-'])([a-zA-Z\u00C0-\u024F\u0900-\u0D7F])/g, (match, sep, char) => sep + char.toUpperCase());
};
const validateName = (name, label = 'Full Name') => {
    if (!name || !name.trim())
        return { valid: false, message: `${label} is required.` };
    const clean = name.trim();
    if (clean.length < 2)
        return { valid: false, message: `${label} must be at least 2 characters long.` };
    if (clean.length > 70)
        return { valid: false, message: `${label} cannot exceed 70 characters.` };
    const regex = /^[\p{L}\s.'\-]+$/u;
    if (!regex.test(clean))
        return { valid: false, message: `${label} contains invalid characters.` };
    return { valid: true, message: '' };
};
const validateIndianMobile = (phone) => {
    if (!phone || !phone.trim()) {
        return { valid: false, message: 'Mobile number is required.' };
    }
    const cleaned = phone.trim().replace(/\D/g, '');
    if (cleaned.length > 0 && !/^[6-9]/.test(cleaned)) {
        return { valid: false, message: 'Mobile number must start with 6, 7, 8, or 9.' };
    }
    if (cleaned.length < 10) {
        return { valid: false, message: 'Enter a valid 10-digit mobile number.' };
    }
    if (!INDIAN_MOBILE_REGEX.test(cleaned)) {
        return { valid: false, message: 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' };
    }
    return { valid: true, message: '' };
};
const validateEmail = (email) => {
    if (!email || !email.trim())
        return { valid: false, message: 'Email address is required.' };
    const cleaned = email.trim().toLowerCase();
    if (/\s/.test(cleaned))
        return { valid: false, message: 'Email cannot contain spaces.' };
    const atCount = (cleaned.match(/@/g) || []).length;
    if (atCount !== 1)
        return { valid: false, message: 'Enter a valid email address with exactly one @.' };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleaned))
        return { valid: false, message: 'Enter a valid email address (e.g. name@domain.com).' };
    return { valid: true, message: '' };
};
const validatePassword = (password) => {
    if (!password)
        return { valid: false, message: 'Password is required.' };
    if (password.length < 6)
        return { valid: false, message: 'Password must be at least 6 characters long.' };
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{6,}$/;
    if (!regex.test(password)) {
        return { valid: false, message: 'Password must contain at least 1 uppercase letter, 1 number, and 1 special character.' };
    }
    return { valid: true, message: '' };
};
const validateAadhaar = (aadhaar) => {
    if (!aadhaar || !String(aadhaar).trim())
        return { valid: false, message: 'Aadhaar number is required.' };
    const cleaned = String(aadhaar).trim().replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleaned)) {
        return { valid: false, message: 'Enter a valid 12-digit Aadhaar number.' };
    }
    return { valid: true, message: '' };
};
const validatePan = (pan) => {
    if (!pan || !String(pan).trim())
        return { valid: false, message: 'PAN number is required.' };
    const cleaned = String(pan).trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleaned)) {
        return { valid: false, message: 'Enter a valid 10-character PAN number (e.g. ABCDE1234F).' };
    }
    return { valid: true, message: '' };
};
const calculateAge = (dobString) => {
    if (!dobString)
        return -1;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime()))
        return -1;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};
const validateDateOfBirth = (dob, minAge = 18) => {
    if (!dob)
        return { valid: false, message: 'Date of birth is required.' };
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime()))
        return { valid: false, message: 'Enter a valid date of birth.' };
    const today = new Date();
    if (birthDate > today)
        return { valid: false, message: 'Date of birth cannot be in the future.' };
    const age = calculateAge(dob);
    if (age < minAge) {
        return { valid: false, message: `You must be at least ${minAge} years old to register.` };
    }
    return { valid: true, message: '' };
};
// Helper to parse User-Agent for Device Recognition
const parseDevice = (userAgent = '') => {
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    if (userAgent.includes('Firefox'))
        browser = 'Firefox';
    else if (userAgent.includes('Chrome'))
        browser = 'Chrome';
    else if (userAgent.includes('Safari'))
        browser = 'Safari';
    else if (userAgent.includes('Edge'))
        browser = 'Edge';
    if (userAgent.includes('Windows'))
        os = 'Windows';
    else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS'))
        os = 'macOS';
    else if (userAgent.includes('Android'))
        os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad'))
        os = 'iOS';
    else if (userAgent.includes('Linux'))
        os = 'Linux';
    return { browser, os, deviceName: `${os} - ${browser}` };
};
// 1. POST: /api/auth/login (JWT, Refresh Token, Rate Limiting, Account Lockout Policy)
router.post('/login', middleware_1.authRateLimiter, async (req, res) => {
    const { email, phone, password, role = 'customer', captchaToken } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const device = parseDevice(userAgent);
    const identifier = (email || phone || '').toLowerCase().trim();
    if (!identifier) {
        return res.status(400).json({
            status: 'error',
            message: 'Email or Mobile number is required.'
        });
    }
    // Server-side Indian Mobile Validation (bypass protection)
    const isNumericInput = /^\d+$/.test(identifier);
    if (isNumericInput) {
        const mobileCheck = validateIndianMobile(identifier);
        if (!mobileCheck.valid) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_MOBILE',
                message: mobileCheck.message
            });
        }
    }
    // Check Account Lock Status
    const lockStatus = securityManager_1.securityManager.isAccountLocked(identifier);
    if (lockStatus.locked) {
        securityManager_1.securityManager.logEvent({
            action: 'LOGIN_BLOCKED_ACCOUNT_LOCKED',
            email: identifier,
            role,
            ip,
            device: device.deviceName,
            country: 'India',
            status: 'BLOCKED',
            details: lockStatus.reason || 'Account locked'
        });
        return res.status(403).json({
            status: 'error',
            code: 'ACCOUNT_LOCKED',
            message: lockStatus.reason
        });
    }
    // Check if Captcha is Required
    const userRec = securityManager_1.securityManager.getUserRecord(identifier);
    if (userRec.requireCaptcha && !captchaToken) {
        return res.status(400).json({
            status: 'error',
            code: 'CAPTCHA_REQUIRED',
            requireCaptcha: true,
            message: 'Suspicious activity detected. Captcha verification is required to log in.'
        });
    }
    try {
        // Authenticate User
        let userDetails = null;
        if (role === 'admin') {
            // SECURITY FIX: Admin must authenticate against the admins collection in DB.
            // No bypass — wrong/missing password → 401.
            const mongoDb = db_1.db.getDb();
            if (!mongoDb) {
                return res.status(503).json({ status: 'error', message: 'Database unavailable. Cannot authenticate admin.' });
            }
            const adminRecord = await mongoDb.collection('admins').findOne({
                $or: [{ email: identifier }, { phone: identifier }]
            });
            if (!adminRecord) {
                const failedInfo = securityManager_1.securityManager.recordFailedLogin(identifier, ip, device.deviceName);
                return res.status(401).json({
                    status: 'error',
                    code: 'INVALID_CREDENTIALS',
                    message: failedInfo.message,
                    attempts: failedInfo.attempts,
                    requireCaptcha: failedInfo.requireCaptcha
                });
            }
            if (!password) {
                return res.status(400).json({ status: 'error', code: 'PASSWORD_REQUIRED', message: 'Password is required for admin login.' });
            }
            const isAdminPasswordValid = await bcryptjs_1.default.compare(password, adminRecord.password).catch(() => false);
            if (!isAdminPasswordValid) {
                const failedInfo = securityManager_1.securityManager.recordFailedLogin(identifier, ip, device.deviceName);
                return res.status(401).json({
                    status: 'error',
                    code: 'INVALID_CREDENTIALS',
                    message: failedInfo.message,
                    attempts: failedInfo.attempts,
                    requireCaptcha: failedInfo.requireCaptcha
                });
            }
            // Check admin account active/approval status
            const adminApproval = (0, roleAuthorization_1.checkAccountApproval)(adminRecord);
            if (!adminApproval.isApproved) {
                return res.status(adminApproval.statusCode).json({
                    status: 'error',
                    code: adminApproval.isPending ? 'ACCOUNT_PENDING_APPROVAL' : 'ACCOUNT_SUSPENDED',
                    message: adminApproval.message
                });
            }
            userDetails = {
                id: adminRecord._id?.toString() || adminRecord.id || 'admin_' + Date.now(),
                name: adminRecord.name || 'System Admin',
                email: adminRecord.email || identifier,
                role: 'admin',
                status: adminRecord.status || 'Active'
            };
        }
        else {
            // Authoritative database authentication for customer & standard logins
            const dbUser = await findCustomerInMongo(identifier);
            if (!dbUser) {
                const failedInfo = securityManager_1.securityManager.recordFailedLogin(identifier, ip, device.deviceName);
                if (password) {
                    return res.status(401).json({
                        status: 'error',
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid email/mobile number or password. Please check your credentials and try again.',
                        attempts: failedInfo.attempts,
                        requireCaptcha: failedInfo.requireCaptcha
                    });
                }
                return res.status(401).json({
                    status: 'error',
                    notRegistered: true,
                    code: 'ACCOUNT_NOT_FOUND',
                    message: 'Please register first to access the Customer website.',
                    msg: 'Please register first to access the Customer website.',
                    attempts: failedInfo.attempts,
                    requireCaptcha: failedInfo.requireCaptcha
                });
            }
            // Password is required for password-based login
            if (!password) {
                return res.status(400).json({
                    status: 'error',
                    code: 'PASSWORD_REQUIRED',
                    message: 'Password is required to log in.'
                });
            }
            // Authoritative Password Verification
            const isMatch = await bcryptjs_1.default.compare(password, dbUser.password).catch(() => false);
            if (!isMatch) {
                const failedInfo = securityManager_1.securityManager.recordFailedLogin(identifier, ip, device.deviceName);
                return res.status(401).json({
                    status: 'error',
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email/mobile number or password. Please check your credentials and try again.',
                    attempts: failedInfo.attempts,
                    requireCaptcha: failedInfo.requireCaptcha
                });
            }
            // Strict Role Isolation: Verify that the authoritative DB role is authorized for this application
            const userRole = (dbUser.role || 'customer').toString().toLowerCase().trim();
            const roleCheck = (0, roleAuthorization_1.verifyRoleAuthorizedForApp)(userRole);
            if (!roleCheck.authorized) {
                return res.status(403).json({
                    status: 'error',
                    code: 'FORBIDDEN_CROSS_ROLE',
                    message: roleCheck.reason || 'Access denied: Your account role is not authorized for this application.'
                });
            }
            // Enforce Administrative Approval & Active Status (Fails closed on Pending, Suspended, or Rejected)
            const approval = (0, roleAuthorization_1.checkAccountApproval)(dbUser);
            if (!approval.isApproved) {
                return res.status(approval.statusCode).json({
                    status: 'error',
                    code: approval.isPending ? 'ACCOUNT_PENDING_APPROVAL' : 'ACCOUNT_SUSPENDED',
                    message: approval.message
                });
            }
            const mongoDb = db_1.db.getDb();
            let custId = dbUser.customerId || dbUser.registrationId || '';
            if (!(0, customerIdService_1.isValidCustomerId)(custId) && mongoDb && (dbUser.role === 'customer' || !dbUser.role)) {
                custId = await resolveCanonicalCustomerId(mongoDb, dbUser);
            }
            userDetails = {
                id: dbUser._id ? dbUser._id.toString() : (dbUser.id || 'cust_' + Date.now()),
                customerId: custId,
                registrationId: custId,
                name: dbUser.name || 'Connect Member',
                email: dbUser.email || identifier,
                phone: dbUser.phone || '',
                avatar: dbUser.avatar || dbUser.photo || '',
                photo: dbUser.avatar || dbUser.photo || '',
                role: dbUser.role || 'customer',
                status: dbUser.status || 'Active',
                address: dbUser.address || dbUser.registeredAddress || '',
                city: dbUser.city || '',
                pincode: dbUser.pincode || '',
                state: dbUser.state || '',
                addresses: Array.isArray(dbUser.addresses) ? dbUser.addresses : [],
                membershipTier: dbUser.membershipTier || 'None',
                membershipStatus: dbUser.membershipStatus || (dbUser.membershipTier && dbUser.membershipTier !== 'None' ? 'ACTIVE' : 'INACTIVE'),
                membershipHistory: Array.isArray(dbUser.membershipHistory) ? dbUser.membershipHistory : [],
                walletBalance: typeof dbUser.walletBalance === 'number' ? Math.max(0, dbUser.walletBalance) : 0.00
            };
        }
        // Reset Failed Attempts on Successful Login
        securityManager_1.securityManager.resetFailedLogins(identifier);
        // Create Session
        const sessionId = 'sess_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        const tokenPayload = {
            userId: userDetails.id,
            email: userDetails.email,
            role: userDetails.role,
            status: userDetails.status || 'Active',
            customerId: userDetails.customerId,
            registrationId: userDetails.registrationId,
            phone: userDetails.phone,
            sessionId
        };
        const accessToken = securityManager_1.securityManager.generateAccessToken(tokenPayload);
        const refreshToken = securityManager_1.securityManager.generateRefreshToken(tokenPayload);
        securityManager_1.securityManager.createSession({
            sessionId,
            userId: userDetails.id,
            email: userDetails.email,
            role: userDetails.role,
            tokenHash: refreshToken.slice(-10),
            deviceName: device.deviceName,
            os: device.os,
            browser: device.browser,
            ip,
            country: 'India',
            city: 'Bangalore'
        });
        // Log Successful Login
        securityManager_1.securityManager.logEvent({
            action: 'USER_LOGIN_SUCCESS',
            userId: userDetails.id,
            email: userDetails.email,
            role: userDetails.role,
            ip,
            device: device.deviceName,
            country: 'India',
            status: 'SUCCESS',
            details: 'Authenticated successfully with JWT & Refresh Token rotation.'
        });
        // Set HTTP-Only Cookie for Refresh Token
        res.cookie('connect_refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
        });
        res.cookie('connect_access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 Mins
        });
        return res.json({
            status: 'success',
            message: 'Login successful.',
            accessToken,
            refreshToken,
            expiresIn: 900,
            user: userDetails,
            session: { sessionId, device: device.deviceName, ip }
        });
    }
    catch (error) {
        const failedInfo = securityManager_1.securityManager.recordFailedLogin(identifier, ip, device.deviceName);
        return res.status(401).json({
            status: 'error',
            code: 'INVALID_CREDENTIALS',
            message: failedInfo.message,
            attempts: failedInfo.attempts,
            requireCaptcha: failedInfo.requireCaptcha
        });
    }
});
// 2. POST: /api/auth/send-otp (6-Digit OTP, 5-Min Expiry, 30s Cooldown)
router.post('/send-otp', middleware_1.authRateLimiter, async (req, res) => {
    const { mobileOrEmail, phone, mobileNumber } = req.body;
    const target = (phone || mobileNumber || mobileOrEmail || '').toString().trim();
    const ip = req.ip || '127.0.0.1';
    if (!target) {
        return res.status(400).json({ status: 'error', message: 'Mobile number is required.' });
    }
    // Server-side Indian Mobile Validation (bypass protection)
    const cleaned = target.replace(/\D/g, '');
    const isNumericInput = /^\d+$/.test(target);
    if (isNumericInput) {
        const mobileCheck = validateIndianMobile(cleaned);
        if (!mobileCheck.valid) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_MOBILE',
                message: mobileCheck.message
            });
        }
    }
    try {
        // Database Verification: Check if user exists in MongoDB database
        const dbUser = await findCustomerInMongo(target);
        if (!dbUser) {
            return res.status(404).json({
                status: 'error',
                notRegistered: true,
                code: 'MOBILE_NOT_REGISTERED',
                message: 'Please register first to access the Customer website.',
                msg: 'Please register first to access the Customer website.'
            });
        }
        // Strict Role Isolation: Verify that the authoritative DB role is authorized for this application
        const userRole = (dbUser.role || 'customer').toString().toLowerCase().trim();
        const roleCheck = (0, roleAuthorization_1.verifyRoleAuthorizedForApp)(userRole);
        if (!roleCheck.authorized) {
            return res.status(403).json({
                status: 'error',
                code: 'FORBIDDEN_CROSS_ROLE',
                message: roleCheck.reason || 'Access denied: Your account role is not authorized for this application.'
            });
        }
        // Enforce Administrative Approval & Active Status (Fails closed on Pending, Suspended, or Rejected)
        const approval = (0, roleAuthorization_1.checkAccountApproval)(dbUser);
        if (!approval.isApproved) {
            return res.status(approval.statusCode).json({
                status: 'error',
                code: approval.isPending ? 'ACCOUNT_PENDING_APPROVAL' : 'ACCOUNT_SUSPENDED',
                message: approval.message
            });
        }
        const { otp, cooldownSeconds } = securityManager_1.securityManager.generateOTP(target);
        // Real SMS Gateway Dispatch
        const isTargetPhone = /^\d+$/.test(target.replace(/\D/g, ''));
        let deliveryStatus = {
            delivered: false,
            simulated: false,
            message: `OTP sent successfully to ${target}. Valid for 5 minutes.`
        };
        if (isTargetPhone) {
            const smsRes = await smsService_1.smsService.sendOTP(target, otp);
            if (!smsRes.success && !smsRes.simulated) {
                return res.status(502).json({
                    status: 'error',
                    code: 'SMS_DELIVERY_FAILED',
                    message: smsRes.statusMessage || 'SMS delivery failed through carrier gateway.'
                });
            }
            deliveryStatus.delivered = smsRes.delivered;
            deliveryStatus.simulated = !!smsRes.simulated;
            deliveryStatus.message = smsRes.statusMessage;
        }
        securityManager_1.securityManager.logEvent({
            action: 'OTP_REQUESTED',
            email: target,
            ip,
            device: req.headers['user-agent'] || 'Unknown',
            country: 'India',
            status: 'SUCCESS',
            details: `Generated 6-digit OTP (expires in 5 minutes). Delivered: ${deliveryStatus.delivered}, Simulated: ${deliveryStatus.simulated}`
        });
        return res.json({
            status: 'success',
            delivered: deliveryStatus.delivered,
            simulated: deliveryStatus.simulated,
            message: deliveryStatus.message,
            cooldownSeconds,
            ...(deliveryStatus.simulated ? { otp } : {})
        });
    }
    catch (err) {
        return res.status(429).json({ status: 'error', message: err.message });
    }
});
// 3. POST: /api/auth/verify-otp (3 Attempts Limit)
router.post('/verify-otp', middleware_1.authRateLimiter, async (req, res) => {
    const { mobileOrEmail, phone, mobileNumber, otp } = req.body;
    const target = (phone || mobileNumber || mobileOrEmail || '').toString().trim();
    const ip = req.ip || '127.0.0.1';
    if (!target || !otp) {
        return res.status(400).json({ status: 'error', message: 'Mobile number and OTP are required.' });
    }
    // Database Verification: Verify user exists in MongoDB database
    const dbUser = await findCustomerInMongo(target);
    if (!dbUser) {
        return res.status(404).json({
            status: 'error',
            notRegistered: true,
            code: 'MOBILE_NOT_REGISTERED',
            message: 'Please register first to access the Customer website.',
            msg: 'Please register first to access the Customer website.'
        });
    }
    // Strict Role Isolation: Verify that the authoritative DB role is authorized for this application
    const userRole = (dbUser.role || 'customer').toString().toLowerCase().trim();
    const roleCheck = (0, roleAuthorization_1.verifyRoleAuthorizedForApp)(userRole);
    if (!roleCheck.authorized) {
        return res.status(403).json({
            status: 'error',
            code: 'FORBIDDEN_CROSS_ROLE',
            message: roleCheck.reason || 'Access denied: Your account role is not authorized for this application.'
        });
    }
    // Enforce Administrative Approval & Active Status (Fails closed on Pending, Suspended, or Rejected)
    const approval = (0, roleAuthorization_1.checkAccountApproval)(dbUser);
    if (!approval.isApproved) {
        return res.status(approval.statusCode).json({
            status: 'error',
            code: approval.isPending ? 'ACCOUNT_PENDING_APPROVAL' : 'ACCOUNT_SUSPENDED',
            message: approval.message
        });
    }
    const result = securityManager_1.securityManager.verifyOTP(target, otp);
    if (!result.valid) {
        securityManager_1.securityManager.logEvent({
            action: 'OTP_VERIFICATION_FAILED',
            email: target,
            ip,
            device: req.headers['user-agent'] || 'Unknown',
            country: 'India',
            status: 'FAILED',
            details: result.message
        });
        return res.status(400).json({ status: 'error', message: result.message });
    }
    // OTP Verified Successfully -> Issue Session
    const sessionId = 'sess_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const cleanPhone = target.replace(/\D/g, '');
    const userId = dbUser._id ? dbUser._id.toString() : (dbUser.id || 'cust_' + cleanPhone);
    const mongoDb = db_1.db.getDb();
    let custId = dbUser.customerId || dbUser.registrationId || '';
    if (!(0, customerIdService_1.isValidCustomerId)(custId) && mongoDb && (dbUser.role === 'customer' || !dbUser.role)) {
        custId = await resolveCanonicalCustomerId(mongoDb, dbUser);
    }
    const userPayload = {
        userId,
        email: dbUser.email || target,
        role: dbUser.role || 'customer',
        status: dbUser.status || 'Active',
        customerId: custId,
        registrationId: custId,
        phone: cleanPhone,
        sessionId
    };
    const accessToken = securityManager_1.securityManager.generateAccessToken(userPayload);
    const refreshToken = securityManager_1.securityManager.generateRefreshToken(userPayload);
    securityManager_1.securityManager.createSession({
        sessionId,
        userId,
        email: dbUser.email || target,
        role: dbUser.role || 'customer',
        tokenHash: refreshToken.slice(-10),
        deviceName: 'Mobile Web / OTP Device',
        os: 'Mobile',
        browser: 'Browser',
        ip,
        country: 'India',
        city: 'Bangalore'
    });
    const responseUser = {
        id: userId,
        name: dbUser.name || 'Connect Member',
        email: dbUser.email || target,
        phone: dbUser.phone || cleanPhone,
        address: dbUser.address || '',
        city: dbUser.city || '',
        pincode: dbUser.pincode || '',
        role: dbUser.role || 'customer',
        customerId: custId,
        registrationId: custId,
        membershipTier: dbUser.membershipTier || 'None',
        membershipStatus: dbUser.membershipStatus || (dbUser.membershipTier && dbUser.membershipTier !== 'None' ? 'ACTIVE' : 'INACTIVE'),
        membershipHistory: Array.isArray(dbUser.membershipHistory) ? dbUser.membershipHistory : [],
        walletBalance: typeof dbUser.walletBalance === 'number' ? Math.max(0, dbUser.walletBalance) : 0.00
    };
    return res.json({
        status: 'success',
        message: 'OTP verification successful.',
        accessToken,
        refreshToken,
        expiresIn: 900,
        user: responseUser
    });
});
// 3.5. POST: /api/auth/forgot-password/send-otp (and aliases /forgot-password-otp, /forgot-password/otp)
router.post(['/forgot-password/send-otp', '/forgot-password-otp', '/forgot-password/otp'], middleware_1.authRateLimiter, async (req, res) => {
    const { identifier, mobileOrEmail, email, phone } = req.body;
    const target = (identifier || mobileOrEmail || email || phone || '').toString().trim();
    const ip = req.ip || '127.0.0.1';
    if (!target) {
        return res.status(400).json({ status: 'error', message: 'Email or mobile number is required.' });
    }
    // Validate format (either valid Indian mobile or valid email)
    const isNumeric = /^\d+$/.test(target);
    if (isNumeric) {
        const mobileCheck = validateIndianMobile(target);
        if (!mobileCheck.valid) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_MOBILE',
                message: mobileCheck.message
            });
        }
    }
    else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(target)) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_EMAIL',
                message: 'Enter a valid email address.'
            });
        }
    }
    try {
        const normalizedTarget = target.toLowerCase();
        const dbUser = await findCustomerInMongo(target);
        // Uniform response to prevent account enumeration
        let cooldown = 30;
        let generatedOtp = '';
        let isSimulated = false;
        if (dbUser) {
            const { otp, cooldownSeconds } = securityManager_1.securityManager.generateOTP('reset_' + normalizedTarget);
            cooldown = cooldownSeconds;
            generatedOtp = otp;
            if (isNumeric) {
                const smsRes = await smsService_1.smsService.sendOTP(target, otp);
                if (!smsRes.success && !smsRes.simulated) {
                    return res.status(502).json({
                        status: 'error',
                        code: 'SMS_DELIVERY_FAILED',
                        message: smsRes.statusMessage || 'SMS delivery failed.'
                    });
                }
                isSimulated = !!smsRes.simulated;
            }
            securityManager_1.securityManager.logEvent({
                action: 'PASSWORD_RESET_OTP_REQUESTED',
                email: normalizedTarget,
                ip,
                device: req.headers['user-agent'] || 'Unknown',
                country: 'India',
                status: 'SUCCESS',
                details: 'Password reset OTP generated (expires in 5 minutes).'
            });
        }
        return res.json({
            status: 'success',
            message: generatedOtp
                ? `Verification code sent to ${target}. Valid for 5 minutes.`
                : 'If an account exists with this email or mobile number, a verification code has been sent.',
            cooldownSeconds: cooldown,
            ...(isSimulated ? { otp: generatedOtp } : {})
        });
    }
    catch (err) {
        return res.status(429).json({ status: 'error', message: err.message || 'Please wait before requesting another OTP.' });
    }
});
// 3.6. POST: /api/auth/forgot-password/verify-and-reset (and aliases /forgot-password-reset, /forgot-password/reset)
router.post(['/forgot-password/verify-and-reset', '/forgot-password-reset', '/forgot-password/reset'], middleware_1.authRateLimiter, async (req, res) => {
    const { identifier, mobileOrEmail, email, phone, otp, newPassword, confirmPassword } = req.body;
    const target = (identifier || mobileOrEmail || email || phone || '').toString().trim();
    const passwordToSet = newPassword || confirmPassword || '';
    const ip = req.ip || '127.0.0.1';
    if (!target || !otp || !passwordToSet) {
        return res.status(400).json({ status: 'error', message: 'Email/mobile number, OTP, and new password are required.' });
    }
    const passCheck = validatePassword(passwordToSet);
    if (!passCheck.valid) {
        return res.status(400).json({ status: 'error', message: passCheck.message });
    }
    if (confirmPassword && newPassword && confirmPassword !== newPassword) {
        return res.status(400).json({ status: 'error', message: 'Password and Confirm Password do not match.' });
    }
    const normalizedTarget = target.toLowerCase();
    const verifyRes = securityManager_1.securityManager.verifyOTP('reset_' + normalizedTarget, otp);
    if (!verifyRes.valid) {
        return res.status(400).json({ status: 'error', message: verifyRes.message });
    }
    try {
        const dbUser = await findCustomerInMongo(target);
        if (!dbUser) {
            return res.status(400).json({ status: 'error', message: 'Password reset failed. Account not found.' });
        }
        const mongoDb = db_1.db.getDb();
        if (!mongoDb) {
            return res.status(500).json({ status: 'error', message: 'Database connection unavailable.' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(passwordToSet, 10);
        await mongoDb.collection('users').updateOne({ _id: dbUser._id }, { $set: { password: hashedPassword, updatedAt: new Date() } });
        securityManager_1.securityManager.resetFailedLogins(normalizedTarget);
        securityManager_1.securityManager.logEvent({
            action: 'PASSWORD_RESET_SUCCESS',
            email: normalizedTarget,
            ip,
            device: req.headers['user-agent'] || 'Unknown',
            country: 'India',
            status: 'SUCCESS',
            details: 'Password updated successfully'
        });
        return res.json({
            status: 'success',
            message: 'Password has been reset successfully. Please log in with your new password.'
        });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: 'Failed to reset password. Please try again.' });
    }
});
// 4. POST: /api/auth/refresh-token (Token Rotation)
router.post('/refresh-token', async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.connect_refresh_token;
    if (!refreshToken) {
        return res.status(401).json({ status: 'error', message: 'Refresh token required.' });
    }
    const payload = securityManager_1.securityManager.verifyRefreshToken(refreshToken);
    if (!payload || !payload.sessionId) {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token.' });
    }
    const session = securityManager_1.securityManager.getSession(payload.sessionId);
    if (!session) {
        return res.status(401).json({ status: 'error', message: 'Session has been revoked or logged out.' });
    }
    // Token Rotation: Issue new Access & Refresh tokens
    const newAccessToken = securityManager_1.securityManager.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId
    });
    const newRefreshToken = securityManager_1.securityManager.generateRefreshToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId
    });
    session.lastActive = new Date().toISOString();
    session.tokenHash = newRefreshToken.slice(-10);
    res.cookie('connect_refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({
        status: 'success',
        message: 'Token refreshed & rotated successfully.',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900
    });
});
// 5. GET: /api/auth/active-sessions (List Devices)
router.get('/active-sessions', middleware_1.authenticateToken, (req, res) => {
    if (!req.user)
        return res.status(401).json({ status: 'error', message: 'Unauthorized.' });
    const sessions = securityManager_1.securityManager.getUserSessions(req.user.userId);
    return res.json({
        status: 'success',
        sessions
    });
});
// 6. POST: /api/auth/logout (Revoke Current Session)
router.post('/logout', middleware_1.optionalAuthenticateToken, (req, res) => {
    try {
        if (req.sessionId) {
            securityManager_1.securityManager.revokeSession(req.sessionId);
        }
        else if (req.body?.sessionId) {
            securityManager_1.securityManager.revokeSession(req.body.sessionId);
        }
        else if (req.body?.refreshToken) {
            const payload = securityManager_1.securityManager.verifyRefreshToken(req.body.refreshToken);
            if (payload?.sessionId) {
                securityManager_1.securityManager.revokeSession(payload.sessionId);
            }
        }
        else if (req.cookies?.connect_refresh_token) {
            const payload = securityManager_1.securityManager.verifyRefreshToken(req.cookies.connect_refresh_token);
            if (payload?.sessionId) {
                securityManager_1.securityManager.revokeSession(payload.sessionId);
            }
        }
    }
    catch (err) {
        // Session revocation failure must not block cookie clearing or logout response
    }
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/'
    };
    res.clearCookie('connect_access_token', cookieOptions);
    res.clearCookie('connect_refresh_token', cookieOptions);
    res.clearCookie('connect_access_token');
    res.clearCookie('connect_refresh_token');
    return res.json({
        status: 'success',
        message: 'Logged out successfully.'
    });
});
// 7. POST: /api/auth/logout-all-devices (Force Logout All)
router.post('/logout-all-devices', middleware_1.authenticateToken, (req, res) => {
    if (!req.user)
        return res.status(401).json({ status: 'error', message: 'Unauthorized.' });
    const revokedCount = securityManager_1.securityManager.revokeAllUserSessions(req.user.userId);
    res.clearCookie('connect_access_token');
    res.clearCookie('connect_refresh_token');
    return res.json({
        status: 'success',
        message: `Logged out from all ${revokedCount} devices successfully.`
    });
});
// Customer Registration Persistence
router.post('/register-customer', async (req, res) => {
    const { name, email, phone, password, address, city, pincode, aadhaarNumber, panNumber } = req.body;
    // 1. Name validation & title-case capitalization
    if (name) {
        const nameCheck = validateName(name, 'Full Name');
        if (!nameCheck.valid) {
            return res.status(400).json({ status: 'error', code: 'INVALID_NAME', message: nameCheck.message });
        }
    }
    const cleanName = formatCapitalizedName(name || '');
    // 2. Email validation
    if (email) {
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) {
            return res.status(400).json({ status: 'error', code: 'INVALID_EMAIL', message: emailCheck.message });
        }
    }
    // 3. Indian Mobile Number validation (exactly 10 digits starting with 6, 7, 8, 9)
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const mobileCheck = validateIndianMobile(cleanPhone);
    if (!mobileCheck.valid) {
        return res.status(400).json({
            status: 'error',
            code: 'INVALID_MOBILE',
            message: mobileCheck.message
        });
    }
    // 4. Password validation (min 6 chars, uppercase, number, special char)
    if (password) {
        const passCheck = validatePassword(password);
        if (!passCheck.valid) {
            return res.status(400).json({ status: 'error', code: 'INVALID_PASSWORD', message: passCheck.message });
        }
    }
    // 5. Aadhaar validation (12 digits)
    if (aadhaarNumber) {
        const aadhaarCheck = validateAadhaar(aadhaarNumber);
        if (!aadhaarCheck.valid) {
            return res.status(400).json({ status: 'error', code: 'INVALID_AADHAAR', message: aadhaarCheck.message });
        }
    }
    // 6. PAN validation (ABCDE1234F format)
    if (panNumber) {
        const panCheck = validatePan(panNumber);
        if (!panCheck.valid) {
            return res.status(400).json({ status: 'error', code: 'INVALID_PAN', message: panCheck.message });
        }
    }
    // 7. Date of birth validation (min 18 years)
    if (req.body.dob || req.body.dateOfBirth) {
        const dobCheck = validateDateOfBirth(req.body.dob || req.body.dateOfBirth);
        if (!dobCheck.valid) {
            return res.status(400).json({ status: 'error', code: 'INVALID_DOB', message: dobCheck.message });
        }
    }
    // Server-side Indian PIN Code Validation (Strict Mandatory Requirement)
    if (!pincode || String(pincode).trim() === '') {
        return res.status(400).json({
            status: 'error',
            code: 'PINCODE_REQUIRED',
            message: 'PIN code is required. Please enter a valid 6-digit Indian PIN code.'
        });
    }
    const cleanPin = String(pincode).trim();
    const dummyCodes = ['123456', '654321', '100000', '999999', '282828', '121212', '101010', '131313', '242424', '363636'];
    if (!/^[1-9][0-9]{5}$/.test(cleanPin) || dummyCodes.includes(cleanPin) || /^(\d)\1{5}$/.test(cleanPin) || cleanPin.startsWith('10')) {
        return res.status(400).json({
            status: 'error',
            code: 'INVALID_PINCODE',
            message: 'Please enter a valid 6-digit Indian PIN code.'
        });
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (mongoDb) {
            const pinInDb = await mongoDb.collection('pincodes').findOne({ code: cleanPin });
            if (!pinInDb) {
                const resp = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(cleanPin)}`, { signal: AbortSignal.timeout(3000) });
                const json = await resp.json();
                if (!Array.isArray(json) || json[0]?.Status !== 'Success' || !Array.isArray(json[0]?.PostOffice) || json[0].PostOffice.length === 0) {
                    return res.status(400).json({
                        status: 'error',
                        code: 'INVALID_PINCODE',
                        message: `PIN code '${cleanPin}' does not exist in Indian Postal records.`
                    });
                }
            }
        }
    }
    catch (pinErr) {
        // In case of timeout or offline, allow valid syntactic match
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb) {
            return res.status(503).json({ status: 'error', message: 'Database connection unavailable' });
        }
        const cleanEmail = (email || '').toLowerCase().trim();
        const hashedPassword = password ? await bcryptjs_1.default.hash(password, 10) : '';
        const now = new Date();
        const uniqueCustId = await (0, customerIdService_1.generateCustomerId)(mongoDb, now);
        const userId = 'cust_' + Date.now();
        const initialAddresses = address ? [{
                id: 'addr_1_' + Date.now(),
                name: cleanName || 'Connect Member',
                phone: cleanPhone,
                pincode: pincode || '',
                locality: city || '',
                address: address || '',
                city: city || '',
                state: 'Karnataka',
                landmark: '',
                altPhone: '',
                type: 'Home',
                isRegistrationAddress: true
            }] : [];
        if (mongoDb && (cleanEmail || cleanPhone)) {
            const existing = await mongoDb.collection('users').findOne({
                $or: [
                    ...(cleanEmail ? [{ email: cleanEmail }] : []),
                    ...(cleanPhone ? [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }, { phone: `91${cleanPhone}` }] : [])
                ]
            });
            if (existing) {
                // SECURITY FIX: Never silently update an existing user's credentials via registration.
                // This prevented account takeover where an attacker could overwrite another user's
                // password, Aadhaar, or PAN simply by knowing their email/phone.
                return res.status(409).json({
                    status: 'error',
                    code: 'ACCOUNT_EXISTS',
                    message: 'An account with this email or mobile number already exists. Please log in instead.'
                });
            }
        }
        const createdUser = {
            id: userId,
            _id: userId,
            registrationId: uniqueCustId,
            customerId: uniqueCustId,
            name: cleanName || 'Connect Customer',
            email: cleanEmail,
            phone: cleanPhone,
            password: hashedPassword,
            address: address || '',
            city: city || '',
            pincode: pincode || '',
            aadhaar: aadhaarNumber ? securityManager_1.securityManager.encryptAES256GCM(String(aadhaarNumber).trim()) : '',
            pan: panNumber ? securityManager_1.securityManager.encryptAES256GCM(String(panNumber).trim().toUpperCase()) : '',
            role: 'customer',
            status: 'Active',
            isActive: true,
            addresses: initialAddresses,
            createdAt: new Date().toISOString()
        };
        if (mongoDb) {
            await mongoDb.collection('users').insertOne(createdUser).catch(() => { });
            await mongoDb.collection('customers').insertOne(createdUser).catch(() => { });
        }
        const { password: _, ...safeUser } = createdUser;
        const sessionId = 'sess_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        const tokenPayload = {
            userId: createdUser.id,
            email: createdUser.email,
            role: 'customer',
            status: 'Active',
            customerId: createdUser.customerId,
            registrationId: createdUser.registrationId,
            phone: createdUser.phone,
            sessionId
        };
        const accessToken = securityManager_1.securityManager.generateAccessToken(tokenPayload);
        const refreshToken = securityManager_1.securityManager.generateRefreshToken(tokenPayload);
        const clientIp = (req.headers['x-forwarded-for']?.split(',')[0] || req.ip || '127.0.0.1').replace('::ffff:', '');
        securityManager_1.securityManager.createSession({
            sessionId,
            userId: createdUser.id,
            email: createdUser.email,
            role: 'customer',
            tokenHash: refreshToken.slice(-10),
            deviceName: 'Customer Registration Device',
            os: 'Unknown',
            browser: 'Web',
            ip: clientIp,
            country: 'India',
            city: createdUser.city || 'Bangalore'
        });
        const userWithToken = {
            ...safeUser,
            token: accessToken,
            accessToken
        };
        return res.json({
            status: 'success',
            message: 'Customer registration successful',
            token: accessToken,
            accessToken,
            user: userWithToken,
            data: userWithToken
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});
// GET: /api/auth/customer-profile (Fetch customer profile & saved addresses from MongoDB)
router.get('/customer-profile', middleware_1.authenticateToken, async (req, res) => {
    const authUser = req.user;
    if (!authUser) {
        return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'Authentication required.' });
    }
    const requestedId = (req.query.userId || req.query.customerId || req.query.phone || req.query.email || '').trim();
    const isAdmin = authUser?.role === 'admin' || authUser?.role === 'superadmin';
    // IDOR Protection: Non-admins can only view their own profile
    if (!isAdmin && requestedId) {
        const selfId = (authUser.userId || authUser.customerId || authUser.registrationId || '').toLowerCase().trim();
        const selfEmail = (authUser.email || '').toLowerCase().trim();
        const selfPhone = (authUser.phone || '').replace(/\D/g, '');
        const reqClean = requestedId.toLowerCase().trim();
        const reqCleanDigits = requestedId.replace(/\D/g, '');
        const isMatch = (selfId && reqClean === selfId) ||
            (selfEmail && reqClean === selfEmail) ||
            (selfPhone && reqCleanDigits && selfPhone === reqCleanDigits);
        if (!isMatch) {
            return res.status(403).json({
                status: 'error',
                code: 'FORBIDDEN_IDOR',
                message: 'Access denied: You cannot view profile details of another account.'
            });
        }
    }
    // Resolve the effective target: non-admins strictly use authenticated user identity
    const target = isAdmin && requestedId ? requestedId : (authUser.userId || authUser.email || authUser.customerId || '');
    if (!target) {
        return res.status(400).json({ status: 'error', message: 'User ID, Customer ID, Email or Phone is required.' });
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb) {
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        }
        const filter = buildCustomerMongoFilter(target);
        let dbUser = await mongoDb.collection('users').findOne(filter);
        if (!dbUser) {
            dbUser = await mongoDb.collection('customers').findOne(filter);
        }
        if (!dbUser) {
            return res.status(404).json({ status: 'error', message: 'Customer record not found' });
        }
        const { password: _, ...safeProfile } = dbUser;
        const userPhoneDigits = (safeProfile.phone || '').toString().replace(/\D/g, '');
        if (userPhoneDigits.length < 10 || userPhoneDigits === String(safeProfile.pincode)) {
            safeProfile.phone = '';
        }
        let rawAddresses = Array.isArray(safeProfile.addresses) ? safeProfile.addresses : [];
        if (rawAddresses.length === 0) {
            const regAddressStr = safeProfile.address || safeProfile.registeredAddress || safeProfile.fullAddress || '';
            if (regAddressStr && regAddressStr.trim()) {
                const regAddrObj = {
                    id: 'addr_reg_' + (safeProfile.id || safeProfile._id?.toString() || Date.now()),
                    name: safeProfile.name || 'Connect Member',
                    phone: (safeProfile.phone || '').replace('+91', '').trim(),
                    pincode: safeProfile.pincode || '',
                    locality: safeProfile.city || '',
                    address: regAddressStr,
                    city: safeProfile.city || '',
                    state: safeProfile.state || 'Karnataka',
                    landmark: safeProfile.landmark || '',
                    altPhone: safeProfile.altPhone || '',
                    type: 'Home',
                    isRegistrationAddress: true
                };
                rawAddresses = [regAddrObj];
                await mongoDb.collection('users').updateOne(filter, { $set: { addresses: rawAddresses } }).catch(() => { });
                await mongoDb.collection('customers').updateOne(filter, { $set: { addresses: rawAddresses } }).catch(() => { });
            }
        }
        const profileAddresses = deduplicateAddresses(rawAddresses);
        let resolvedCustId = safeProfile.customerId || safeProfile.registrationId || '';
        if (!(0, customerIdService_1.isValidCustomerId)(resolvedCustId) && mongoDb) {
            resolvedCustId = await resolveCanonicalCustomerId(mongoDb, safeProfile);
        }
        // Decrypt or safely mask sensitive identity documents
        let displayAadhaar = '';
        if (safeProfile.aadhaar) {
            try {
                const rawAadhaar = safeProfile.aadhaar.startsWith('v1:')
                    ? securityManager_1.securityManager.decryptAES256GCM(safeProfile.aadhaar)
                    : safeProfile.aadhaar;
                displayAadhaar = rawAadhaar.length >= 4 ? `XXXX-XXXX-${rawAadhaar.slice(-4)}` : rawAadhaar;
            }
            catch (e) {
                displayAadhaar = 'XXXX-XXXX-****';
            }
        }
        let displayPan = '';
        if (safeProfile.pan) {
            try {
                const rawPan = safeProfile.pan.startsWith('v1:')
                    ? securityManager_1.securityManager.decryptAES256GCM(safeProfile.pan)
                    : safeProfile.pan;
                displayPan = rawPan.length >= 4 ? `XXXXXX${rawPan.slice(-4)}` : rawPan;
            }
            catch (e) {
                displayPan = 'XXXXXX****';
            }
        }
        return res.json({
            status: 'success',
            user: {
                id: safeProfile.id || safeProfile._id?.toString(),
                name: safeProfile.name || 'Connect Member',
                email: safeProfile.email || '',
                phone: safeProfile.phone || '',
                avatar: safeProfile.avatar || safeProfile.photo || '',
                photo: safeProfile.avatar || safeProfile.photo || '',
                address: safeProfile.address || safeProfile.registeredAddress || '',
                city: safeProfile.city || '',
                pincode: safeProfile.pincode || '',
                state: safeProfile.state || '',
                role: safeProfile.role || 'customer',
                customerId: resolvedCustId,
                registrationId: resolvedCustId,
                aadhaar: displayAadhaar,
                pan: displayPan,
                membershipTier: safeProfile.membershipTier || 'None',
                membershipStatus: safeProfile.membershipStatus || (safeProfile.membershipTier && safeProfile.membershipTier !== 'None' ? 'ACTIVE' : 'INACTIVE'),
                membershipHistory: Array.isArray(safeProfile.membershipHistory) ? safeProfile.membershipHistory : [],
                walletBalance: typeof safeProfile.walletBalance === 'number' ? Math.max(0, safeProfile.walletBalance) : 0.00,
                addresses: profileAddresses
            }
        });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});
// PUT: /api/auth/customer-profile (Update customer profile & photo in MongoDB)
router.put('/customer-profile', middleware_1.authenticateToken, async (req, res) => {
    const authUser = req.user;
    if (!authUser) {
        return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'Authentication required.' });
    }
    const { userId, customerId, phone, email, name, avatar, photo, password } = req.body;
    const isAdmin = authUser?.role === 'admin' || authUser?.role === 'superadmin';
    // IDOR & Privilege Escalation Protection:
    // Non-admins cannot modify another user's profile, nor escalate privileges
    if (!isAdmin) {
        const selfId = (authUser.userId || authUser.customerId || authUser.registrationId || '').toLowerCase().trim();
        const selfEmail = (authUser.email || '').toLowerCase().trim();
        if (userId && String(userId).toLowerCase().trim() !== selfId) {
            return res.status(403).json({ status: 'error', code: 'FORBIDDEN_IDOR', message: 'Access denied: Cannot update another user account.' });
        }
        if (email && email.toLowerCase().trim() !== selfEmail) {
            return res.status(403).json({ status: 'error', code: 'FORBIDDEN_IDOR', message: 'Access denied: Cannot change email to another account identity.' });
        }
        // Strip protected fields to prevent privilege escalation
        delete req.body.role;
        delete req.body.status;
        delete req.body.approvalStatus;
        delete req.body.isActive;
        delete req.body.active;
        delete req.body.walletBalance;
        delete req.body.membershipTier;
        delete req.body.membershipStatus;
        delete req.body.id;
        delete req.body._id;
        delete req.body.customerId;
        delete req.body.registrationId;
        req.body.userId = authUser.userId;
        req.body.email = authUser.email;
    }
    const target = req.body;
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb) {
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        }
        const updateFields = { updatedAt: new Date().toISOString() };
        if (name) {
            const nameCheck = validateName(name, 'Full Name');
            if (!nameCheck.valid) {
                return res.status(400).json({ status: 'error', code: 'INVALID_NAME', message: nameCheck.message });
            }
            updateFields.name = formatCapitalizedName(name);
        }
        if (email) {
            const emailCheck = validateEmail(email);
            if (!emailCheck.valid) {
                return res.status(400).json({ status: 'error', code: 'INVALID_EMAIL', message: emailCheck.message });
            }
            updateFields.email = email.toLowerCase().trim();
        }
        if (phone) {
            const phoneCheck = validateIndianMobile(phone);
            if (!phoneCheck.valid) {
                return res.status(400).json({ status: 'error', code: 'INVALID_MOBILE', message: phoneCheck.message });
            }
            updateFields.phone = phone.replace(/\D/g, '');
        }
        const newAvatar = avatar !== undefined ? avatar : photo;
        if (newAvatar !== undefined) {
            updateFields.avatar = newAvatar;
            updateFields.photo = newAvatar;
        }
        if (password) {
            const passCheck = validatePassword(password);
            if (!passCheck.valid) {
                return res.status(400).json({ status: 'error', code: 'INVALID_PASSWORD', message: passCheck.message });
            }
            updateFields.password = await bcryptjs_1.default.hash(password, 10);
        }
        const filter = buildCustomerMongoFilter(target);
        await mongoDb.collection('users').updateOne(filter, { $set: updateFields });
        await mongoDb.collection('customers').updateOne(filter, { $set: updateFields }).catch(() => { });
        let updatedUser = await mongoDb.collection('users').findOne(filter);
        if (!updatedUser) {
            updatedUser = await mongoDb.collection('customers').findOne(filter);
        }
        if (!updatedUser) {
            // Upsert: Create user record in MongoDB if not existing yet
            const newUserId = userId || customerId || 'cust_' + Date.now();
            const newCustId = (0, customerIdService_1.isValidCustomerId)(customerId) ? customerId : await (0, customerIdService_1.generateCustomerId)(mongoDb, new Date());
            const createdUserObj = {
                id: newUserId,
                _id: newUserId,
                registrationId: newCustId,
                customerId: newCustId,
                name: name ? name.trim() : 'Connect Member',
                email: email ? email.toLowerCase().trim() : '',
                phone: phone ? phone.replace(/\D/g, '') : '',
                avatar: newAvatar || '',
                photo: newAvatar || '',
                password: password ? await bcryptjs_1.default.hash(password, 10) : '',
                role: 'customer',
                status: 'Active',
                isActive: true,
                addresses: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await mongoDb.collection('users').insertOne(createdUserObj).catch(() => { });
            await mongoDb.collection('customers').insertOne(createdUserObj).catch(() => { });
            updatedUser = createdUserObj;
        }
        const { password: _, ...safeUser } = (updatedUser || {});
        let resolvedCustId = safeUser.customerId || safeUser.registrationId || '';
        if (!(0, customerIdService_1.isValidCustomerId)(resolvedCustId) && mongoDb) {
            resolvedCustId = await resolveCanonicalCustomerId(mongoDb, safeUser);
        }
        const finalProfile = {
            id: safeUser.id || safeUser._id?.toString(),
            name: safeUser.name || 'Connect Member',
            email: safeUser.email || '',
            phone: safeUser.phone || '',
            avatar: safeUser.avatar || safeUser.photo || '',
            photo: safeUser.avatar || safeUser.photo || '',
            address: safeUser.address || safeUser.registeredAddress || '',
            city: safeUser.city || '',
            pincode: safeUser.pincode || '',
            state: safeUser.state || '',
            role: safeUser.role || 'customer',
            customerId: resolvedCustId,
            registrationId: resolvedCustId,
            addresses: deduplicateAddresses(Array.isArray(safeUser.addresses) ? safeUser.addresses : [])
        };
        return res.json({ status: 'success', message: 'Profile updated successfully', user: finalProfile, data: finalProfile });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});
const resolveCustomerTarget = (req) => {
    const authReq = req;
    const authUser = authReq.user;
    if (!authUser)
        return '';
    const isAdmin = authUser.role === 'admin' || authUser.role === 'superadmin';
    if (!isAdmin) {
        return (authUser.userId || authUser.customerId || authUser.registrationId || authUser.email || '').toString().trim();
    }
    const target = req.body?.userId || req.body?.customerId || req.body?.phone || req.body?.email || req.query?.userId || req.query?.customerId || req.query?.phone || req.query?.email;
    return target ? String(target).trim() : (authUser.userId || authUser.email || '');
};
// GET: /customer/addresses & /api/auth/customer-addresses (Fetch saved addresses)
const handleGetAddresses = async (req, res) => {
    const target = resolveCustomerTarget(req);
    if (!target) {
        return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'Authenticated customer identifier required.' });
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        const filter = buildCustomerMongoFilter(target);
        let user = await mongoDb.collection('users').findOne(filter);
        if (!user)
            user = await mongoDb.collection('customers').findOne(filter);
        if (!user)
            return res.status(404).json({ status: 'error', message: 'Customer record not found.' });
        const addresses = deduplicateAddresses(Array.isArray(user.addresses) ? user.addresses : []);
        return res.json({ status: 'success', addresses });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};
// POST: /customer/addresses & /api/auth/customer-address (Save/Add/Deduplicate saved address)
const handleSaveAddress = async (req, res) => {
    const target = resolveCustomerTarget(req);
    const address = req.body?.address || req.body;
    if (!target || !address || typeof address !== 'object') {
        return res.status(400).json({ status: 'error', message: 'Authenticated customer ID and address details are required.' });
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        const filter = buildCustomerMongoFilter(target);
        let user = await mongoDb.collection('users').findOne(filter);
        if (!user)
            user = await mongoDb.collection('customers').findOne(filter);
        if (!user)
            return res.status(404).json({ status: 'error', message: 'Customer record not found.' });
        const existingAddresses = Array.isArray(user.addresses) ? user.addresses : [];
        const inputKey = normalizeAddressStr(address);
        // 1. Duplicate check: check if same customer already has this exact address
        const existingDuplicate = existingAddresses.find(a => normalizeAddressStr(a) === inputKey);
        if (existingDuplicate && !address.id) {
            return res.json({
                status: 'success',
                message: 'This address is already saved.',
                isDuplicate: true,
                address: existingDuplicate,
                addresses: deduplicateAddresses(existingAddresses)
            });
        }
        let savedAddr = null;
        let rawUpdated;
        if (address.id && existingAddresses.some(a => a.id === address.id)) {
            savedAddr = { ...address };
            rawUpdated = existingAddresses.map(a => a.id === address.id ? { ...a, ...address } : a);
        }
        else if (existingDuplicate) {
            savedAddr = { ...existingDuplicate, ...address, id: existingDuplicate.id };
            rawUpdated = existingAddresses.map(a => a.id === existingDuplicate.id ? savedAddr : a);
        }
        else {
            savedAddr = {
                ...address,
                id: address.id || 'addr_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
            };
            rawUpdated = [savedAddr, ...existingAddresses];
        }
        const updatedAddresses = deduplicateAddresses(rawUpdated);
        await mongoDb.collection('users').updateOne(filter, { $set: { addresses: updatedAddresses } });
        await mongoDb.collection('customers').updateOne(filter, { $set: { addresses: updatedAddresses } }).catch(() => { });
        return res.json({
            status: 'success',
            message: 'Address saved successfully',
            isDuplicate: false,
            address: savedAddr,
            addresses: updatedAddresses
        });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};
// PUT: /customer/addresses/:id & /api/auth/customer-address/:id (Update address)
const handleUpdateAddress = async (req, res) => {
    const addressId = req.params.addressId || req.params.id;
    const target = resolveCustomerTarget(req);
    const addressData = req.body?.address || req.body;
    if (!target || !addressId) {
        return res.status(400).json({ status: 'error', message: 'Customer identifier and Address ID are required.' });
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        const filter = buildCustomerMongoFilter(target);
        let user = await mongoDb.collection('users').findOne(filter);
        if (!user)
            user = await mongoDb.collection('customers').findOne(filter);
        if (!user)
            return res.status(404).json({ status: 'error', message: 'Customer record not found.' });
        const existingAddresses = Array.isArray(user.addresses) ? user.addresses : [];
        const rawUpdated = existingAddresses.map(a => a.id === addressId ? { ...a, ...addressData } : a);
        const updatedAddresses = deduplicateAddresses(rawUpdated);
        await mongoDb.collection('users').updateOne(filter, { $set: { addresses: updatedAddresses } });
        await mongoDb.collection('customers').updateOne(filter, { $set: { addresses: updatedAddresses } }).catch(() => { });
        return res.json({ status: 'success', message: 'Address updated successfully', addresses: updatedAddresses });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};
// DELETE: /customer/addresses/:id & /api/auth/customer-address/:id (Delete address)
const handleDeleteAddress = async (req, res) => {
    const addressId = req.params.addressId || req.params.id;
    const target = resolveCustomerTarget(req);
    if (!target || !addressId) {
        return res.status(400).json({ status: 'error', message: 'Customer identifier and Address ID are required.' });
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb)
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        const filter = buildCustomerMongoFilter(target);
        let user = await mongoDb.collection('users').findOne(filter);
        if (!user)
            user = await mongoDb.collection('customers').findOne(filter);
        if (!user)
            return res.status(404).json({ status: 'error', message: 'Customer record not found.' });
        const existingAddresses = Array.isArray(user.addresses) ? user.addresses : [];
        const updatedAddresses = existingAddresses.filter(a => a.id !== addressId);
        await mongoDb.collection('users').updateOne(filter, { $set: { addresses: updatedAddresses } });
        await mongoDb.collection('customers').updateOne(filter, { $set: { addresses: updatedAddresses } }).catch(() => { });
        return res.json({ status: 'success', message: 'Address deleted successfully', addresses: updatedAddresses });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};
// Register Address Endpoints (Supports both /customer/addresses and /customer-address)
router.get('/addresses', middleware_1.authenticateToken, handleGetAddresses);
router.post('/addresses', middleware_1.authenticateToken, handleSaveAddress);
router.put('/addresses/:id', middleware_1.authenticateToken, handleUpdateAddress);
router.delete('/addresses/:id', middleware_1.authenticateToken, handleDeleteAddress);
router.post('/customer-address', middleware_1.authenticateToken, handleSaveAddress);
router.put('/customer-address/:addressId', middleware_1.authenticateToken, handleUpdateAddress);
router.delete('/customer-address/:addressId', middleware_1.authenticateToken, handleDeleteAddress);
// Customer Notifications Endpoints
router.get('/customer-notifications', middleware_1.authenticateToken, async (req, res) => {
    const authUser = req.user;
    if (!authUser) {
        return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'Authentication required.' });
    }
    const requestedId = (req.query.userId || req.query.customerId || req.query.phone || req.query.email || '').trim();
    const isAdmin = authUser?.role === 'admin' || authUser?.role === 'superadmin';
    if (!isAdmin && requestedId) {
        const selfId = (authUser.userId || authUser.customerId || authUser.registrationId || '').toLowerCase().trim();
        const selfEmail = (authUser.email || '').toLowerCase().trim();
        const selfPhone = (authUser.phone || '').replace(/\D/g, '');
        const reqClean = requestedId.toLowerCase().trim();
        const reqCleanDigits = requestedId.replace(/\D/g, '');
        const isMatch = (selfId && reqClean === selfId) ||
            (selfEmail && reqClean === selfEmail) ||
            (selfPhone && reqCleanDigits && selfPhone === reqCleanDigits);
        if (!isMatch) {
            return res.status(403).json({
                status: 'error',
                code: 'FORBIDDEN_IDOR',
                message: 'Access denied: You cannot view notifications of another account.'
            });
        }
    }
    const target = isAdmin && requestedId ? requestedId : (authUser.userId || authUser.email || '');
    if (!target) {
        return res.status(200).json({ status: 'success', notifications: [], unreadCount: 0 });
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb) {
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        }
        const cleanTarget = target.trim();
        const cleanDigits = target.replace(/\D/g, '');
        // 1. Check explicit notifications collection
        const notifFilter = {
            $or: [
                { customerId: cleanTarget },
                { customer_id: cleanTarget },
                { userId: cleanTarget },
                { email: cleanTarget.toLowerCase() },
                { customerEmail: cleanTarget.toLowerCase() },
                ...(cleanDigits.length >= 10 ? [{ phone: cleanDigits }, { customerPhone: cleanDigits }] : [])
            ]
        };
        const explicitNotifs = await mongoDb.collection('notifications').find(notifFilter).sort({ createdAt: -1, created_at: -1 }).limit(30).toArray().catch(() => []);
        // 2. Query recent orders to generate accurate real-time order/booking activity notifications
        const orderFilter = {
            $or: [
                { customer_id: cleanTarget },
                { customerId: cleanTarget },
                { customer_email: cleanTarget.toLowerCase() },
                ...(cleanDigits.length >= 10 ? [{ customer_phone: { $regex: cleanDigits.slice(-10) } }] : [])
            ]
        };
        const userOrders = await mongoDb.collection('orders').find(orderFilter).sort({ created_at: -1 }).limit(20).toArray().catch(() => []);
        const orderNotifs = userOrders.map((ord) => {
            const ordNum = ord.order_number || ord.id || 'N/A';
            const status = ord.status || 'Order Received';
            const prodName = (ord.product_details || 'Order').replace(/\s*\(Qty:\s*\d+\)/gi, '');
            const isDelivered = ['Delivered', 'Completed'].includes(status);
            const isCancelled = status === 'Cancelled';
            const isRead = Boolean(ord.notification_read || ord.notificationRead || isDelivered);
            let title = `Order #${ordNum}`;
            let message = `${prodName} is currently ${status}`;
            if (status === 'Order Received') {
                title = `Order #${ordNum} Placed`;
                message = `Your order for ${prodName} (₹${ord.amount || 0}) was received.`;
            }
            else if (isDelivered) {
                title = `Order #${ordNum} Delivered`;
                message = `Your order for ${prodName} was successfully delivered.`;
            }
            else if (isCancelled) {
                title = `Order #${ordNum} Cancelled`;
                message = `Your order for ${prodName} has been cancelled.`;
            }
            else if (status === 'Out For Delivery') {
                title = `Order #${ordNum} Out for Delivery`;
                message = `Your delivery partner is on the way with ${prodName}.`;
            }
            return {
                id: `ord-notif-${ord._id || ord.id}`,
                title,
                message,
                text: message,
                time: ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
                date: ord.created_at || new Date().toISOString(),
                read: isRead,
                type: 'order',
                status
            };
        });
        // Merge and deduplicate notifications
        const allNotifsMap = new Map();
        orderNotifs.forEach((n) => allNotifsMap.set(n.id, n));
        explicitNotifs.forEach((n) => {
            const id = String(n._id || n.id);
            allNotifsMap.set(id, {
                id,
                title: n.title || 'Notification',
                message: n.message || n.text || '',
                text: n.message || n.text || '',
                time: n.createdAt || n.created_at ? new Date(n.createdAt || n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
                date: n.createdAt || n.created_at || new Date().toISOString(),
                read: Boolean(n.read || n.isRead),
                type: n.type || 'system'
            });
        });
        const notifications = Array.from(allNotifsMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const unreadCount = notifications.filter((n) => !n.read).length;
        return res.json({ status: 'success', notifications, unreadCount });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message, notifications: [], unreadCount: 0 });
    }
});
router.put('/customer-notifications/read', middleware_1.optionalAuthenticateToken, async (req, res) => {
    const authUser = req.user;
    const requestedId = (req.body?.customerId || req.body?.userId || req.body?.email || '').trim();
    const target = requestedId || (authUser?.userId || authUser?.email || '');
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb) {
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        }
        if (target) {
            const cleanTarget = target.trim();
            const cleanDigits = target.replace(/\D/g, '');
            // Mark explicit notifications as read
            await mongoDb.collection('notifications').updateMany({
                $or: [
                    { customerId: cleanTarget },
                    { userId: cleanTarget },
                    { email: cleanTarget.toLowerCase() },
                    ...(cleanDigits.length >= 10 ? [{ phone: cleanDigits }] : [])
                ]
            }, { $set: { read: true, isRead: true } }).catch(() => { });
            // Mark order notifications as read
            await mongoDb.collection('orders').updateMany({
                $or: [
                    { customer_id: cleanTarget },
                    { customerId: cleanTarget },
                    { customer_email: cleanTarget.toLowerCase() },
                    ...(cleanDigits.length >= 10 ? [{ customer_phone: { $regex: cleanDigits.slice(-10) } }] : [])
                ]
            }, { $set: { notification_read: true, notificationRead: true } }).catch(() => { });
        }
        return res.json({ status: 'success', message: 'All notifications marked as read', unreadCount: 0 });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});
// Delete Notification Endpoint
router.delete(['/customer-notifications/:id', '/notifications/:id'], middleware_1.optionalAuthenticateToken, async (req, res) => {
    const notifId = req.params.id;
    if (!notifId) {
        return res.status(400).json({ status: 'error', message: 'Notification ID is required.' });
    }
    try {
        const mongoDb = db_1.db.getDb();
        if (!mongoDb) {
            return res.status(503).json({ status: 'error', message: 'Database not connected' });
        }
        // Try deleting from notifications collection
        let deleted = false;
        if (mongodb_1.ObjectId.isValid(notifId)) {
            const r = await mongoDb.collection('notifications').deleteOne({ _id: new mongodb_1.ObjectId(notifId) }).catch(() => null);
            if (r && r.deletedCount > 0)
                deleted = true;
        }
        if (!deleted) {
            const r2 = await mongoDb.collection('notifications').deleteOne({ id: notifId }).catch(() => null);
            if (r2 && r2.deletedCount > 0)
                deleted = true;
        }
        // If order-derived notification, record it in deletedNotifications collection or user record
        const authUser = req.user;
        const userId = authUser?.userId || authUser?.id || authUser?.customerId || 'global';
        await mongoDb.collection('deleted_notifications').insertOne({
            notificationId: notifId,
            userId,
            deletedAt: new Date()
        }).catch(() => { });
        return res.json({
            status: 'success',
            message: 'Notification deleted successfully.',
            id: notifId
        });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});
exports.default = router;
