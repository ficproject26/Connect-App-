import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { db } from '../db';
import { securityManager } from '../security/securityManager';
import { authRateLimiter, authenticateToken, AuthenticatedRequest } from '../security/middleware';

const router = Router();

const normalizeAddressStr = (addr: any): string => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr.trim().toLowerCase().replace(/\s+/g, ' ');

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

const deduplicateAddresses = (addrList: any[]): any[] => {
  if (!Array.isArray(addrList)) return [];
  const seen = new Set<string>();
  const result: any[] = [];
  for (const item of addrList) {
    if (!item) continue;
    const key = normalizeAddressStr(item);
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
};

const getOrGenerateCustomerId = (userOrId: any): string => {
  if (!userOrId) {
    return `FIC-CUST-100000`;
  }
  let target = '';
  if (typeof userOrId === 'object' && userOrId !== null) {
    if (userOrId.customerId && userOrId.customerId !== 'FIC-CUST-750684' && userOrId.customerId !== 'FIC-CUST-849201' && userOrId.customerId !== 'FIC-CUST-100000') {
      return userOrId.customerId;
    }
    if (userOrId.registrationId && userOrId.registrationId !== 'FIC-CUST-750684' && userOrId.registrationId !== 'FIC-CUST-849201' && userOrId.registrationId !== 'FIC-CUST-100000') {
      return userOrId.registrationId;
    }
    target = userOrId.email || userOrId.phone || userOrId.name || userOrId.id || '';
  } else {
    target = String(userOrId).trim();
  }

  const clean = target.trim().toLowerCase();
  if (!clean) {
    return `FIC-CUST-100000`;
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash % 900000) + 100000;
  return `FIC-CUST-${num}`;
};

const buildCustomerMongoFilter = (input: any): any => {
  if (!input) return { _id: null };
  const rawTargets: string[] = [];

  if (typeof input === 'string') {
    if (input.trim()) rawTargets.push(input.trim());
  } else if (typeof input === 'object' && input !== null) {
    if (input.userId) rawTargets.push(String(input.userId));
    if (input.customerId) rawTargets.push(String(input.customerId));
    if (input.registrationId) rawTargets.push(String(input.registrationId));
    if (input.id) rawTargets.push(String(input.id));
    if (input.email) rawTargets.push(String(input.email));
    if (input.phone) rawTargets.push(String(input.phone));
  }

  const cleanTargets = Array.from(new Set(rawTargets.map(t => t.trim()).filter(Boolean)));
  if (cleanTargets.length === 0) return { _id: null };

  const orConds: any[] = [];

  cleanTargets.forEach(t => {
    orConds.push({ id: t });
    orConds.push({ customerId: t });
    orConds.push({ registrationId: t });
    orConds.push({ email: t.toLowerCase() });
    orConds.push({ _id: t });

    if (ObjectId.isValid(t)) {
      try {
        orConds.push({ _id: new ObjectId(t) });
      } catch (e) {}
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

const findCustomerInMongo = async (identifier: string) => {
  try {
    const mongoDb = db.getDb();
    if (!mongoDb || !identifier) return null;
    const lower = identifier.toLowerCase().trim();
    const cleanDigits = identifier.replace(/\D/g, '');

    const orConds: any[] = [{ email: lower }, { phone: lower }];
    if (cleanDigits) {
      orConds.push({ phone: cleanDigits });
      orConds.push({ phone: `+91${cleanDigits}` });
      orConds.push({ phone: `91${cleanDigits}` });
      orConds.push({ phone: new RegExp(cleanDigits + '$') });
    }

    return await mongoDb.collection('users').findOne({ $or: orConds });
  } catch (err) {
    console.error("MongoDB customer lookup error:", err);
    return null;
  }
};

// Strict Indian Mobile Number Regex: ^[6-9][0-9]{9}$
const INDIAN_MOBILE_REGEX = /^[6-9][0-9]{9}$/;

const validateIndianMobile = (phone: string): { valid: boolean; message: string } => {
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

// Helper to parse User-Agent for Device Recognition
const parseDevice = (userAgent: string = '') => {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  else if (userAgent.includes('Linux')) os = 'Linux';

  return { browser, os, deviceName: `${os} - ${browser}` };
};

// 1. POST: /api/auth/login (JWT, Refresh Token, Rate Limiting, Account Lockout Policy)
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
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
  const lockStatus = securityManager.isAccountLocked(identifier);
  if (lockStatus.locked) {
    securityManager.logEvent({
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
  const userRec = securityManager.getUserRecord(identifier);
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
    let userDetails: any = null;

    if (role === 'vendor') {
      let vendor = await db.getVendor('v1');
      if (!vendor) {
        vendor = await db.createVendor({
          id: 'v1',
          name: 'ABC Electronics',
          email: identifier,
          phone: '+91 98765 43210',
          address: 'Karol Bagh, New Delhi',
          rating: 4.8,
          active: true
        });
      }
      userDetails = { id: vendor.id, name: vendor.name, email: vendor.email, role: 'vendor' };

    } else if (role === 'delivery') {
      const partners = await db.getDeliveryPartners();
      let displayName = identifier.split('@')[0];
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      let partner = partners.find(p => p.mobile === identifier || p.name.toLowerCase().includes(displayName.toLowerCase()));
      if (!partner) {
        partner = await db.createDeliveryPartner({
          id: 'dp_' + Math.floor(1000 + Math.random() * 9000),
          name: displayName || 'Connect Rider',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          mobile: identifier,
          emergency_contact: '+91 91111 22222',
          address: 'Koramangala, Bangalore',
          vehicle_type: 'Electric Bike',
          vehicle_number: 'KA-03-XY-9999',
          driving_license: 'DL99999999',
          aadhaar: '1111 2222 3333',
          status: 'Available',
          availability: true,
          current_latitude: 12.9348,
          current_longitude: 77.6189,
          speed: 0,
          battery_level: 95,
          last_updated_time: new Date().toISOString(),
          vendor_id: 'v1',
          joining_date: new Date().toISOString().split('T')[0]
        });
      }
      userDetails = { id: partner.id, name: partner.name, email: identifier, role: 'delivery' };

    } else if (role === 'admin') {
      userDetails = { id: 'admin_1', name: 'System Admin', email: identifier, role: 'admin' };
    } else {
      const dbUser = await findCustomerInMongo(identifier);

      if (!dbUser) {
        return res.status(404).json({
          status: 'error',
          notRegistered: true,
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Please register first to access the Customer website.',
          msg: 'Please register first to access the Customer website.'
        });
      }

      const uStatus = (dbUser.status || '').toLowerCase().trim();
      const isUserActive = dbUser.isActive !== false && uStatus !== 'suspended' && uStatus !== 'inactive' && uStatus !== 'rejected';
      if (!isUserActive) {
        return res.status(403).json({
          status: 'error',
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account is inactive or suspended. Please contact support.',
          msg: 'Your account is inactive or suspended. Please contact support.'
        });
      }

      if (password) {
        const isMatch = await bcrypt.compare(password, dbUser.password).catch(() => false);
        if (!isMatch && dbUser.password !== password) {
          return res.status(401).json({
            status: 'error',
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid password. Please try again.',
            msg: 'Invalid password. Please try again.'
          });
        }
      }

      userDetails = {
        id: dbUser._id ? dbUser._id.toString() : (dbUser.id || 'cust_' + Date.now()),
        customerId: dbUser.customerId || dbUser.registrationId || dbUser.id || '',
        name: dbUser.name || 'Connect Member',
        email: dbUser.email || identifier,
        phone: dbUser.phone || '',
        avatar: dbUser.avatar || dbUser.photo || '',
        photo: dbUser.avatar || dbUser.photo || '',
        role: dbUser.role || 'customer',
        address: dbUser.address || dbUser.registeredAddress || '',
        city: dbUser.city || '',
        pincode: dbUser.pincode || '',
        state: dbUser.state || '',
        addresses: Array.isArray(dbUser.addresses) ? dbUser.addresses : [],
        registrationId: dbUser.registrationId || ''
      };
    }

    // Reset Failed Attempts on Successful Login
    securityManager.resetFailedLogins(identifier);

    // Create Session
    const sessionId = 'sess_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const accessToken = securityManager.generateAccessToken({ userId: userDetails.id, email: userDetails.email, role: userDetails.role, sessionId });
    const refreshToken = securityManager.generateRefreshToken({ userId: userDetails.id, email: userDetails.email, role: userDetails.role, sessionId });

    securityManager.createSession({
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
    securityManager.logEvent({
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

  } catch (error: any) {
    const failedInfo = securityManager.recordFailedLogin(identifier, ip, device.deviceName);
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
router.post('/send-otp', authRateLimiter, async (req: Request, res: Response) => {
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

    const uStatus = (dbUser.status || '').toLowerCase().trim();
    const isUserActive = dbUser.isActive !== false && uStatus !== 'suspended' && uStatus !== 'inactive' && uStatus !== 'rejected';
    if (!isUserActive) {
      return res.status(403).json({
        status: 'error',
        code: 'ACCOUNT_INACTIVE',
        message: 'Your account is inactive or suspended. Please contact support.',
        msg: 'Your account is inactive or suspended. Please contact support.'
      });
    }

    const { otp, cooldownSeconds } = securityManager.generateOTP(target);

    securityManager.logEvent({
      action: 'OTP_REQUESTED',
      email: target,
      ip,
      device: req.headers['user-agent'] || 'Unknown',
      country: 'India',
      status: 'SUCCESS',
      details: `Generated 6-digit OTP (expires in 5 minutes).`
    });

    return res.json({
      status: 'success',
      message: `OTP sent successfully to ${target}. Valid for 5 minutes.`,
      cooldownSeconds,
      devOtpPreview: otp
    });
  } catch (err: any) {
    return res.status(429).json({ status: 'error', message: err.message });
  }
});

// 3. POST: /api/auth/verify-otp (3 Attempts Limit)
router.post('/verify-otp', authRateLimiter, async (req: Request, res: Response) => {
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

  const uStatus = (dbUser.status || '').toLowerCase().trim();
  const isUserActive = dbUser.isActive !== false && uStatus !== 'suspended' && uStatus !== 'inactive' && uStatus !== 'rejected';
  if (!isUserActive) {
    return res.status(403).json({
      status: 'error',
      code: 'ACCOUNT_INACTIVE',
      message: 'Your account is inactive or suspended. Please contact support.',
      msg: 'Your account is inactive or suspended. Please contact support.'
    });
  }

  const result = securityManager.verifyOTP(target, otp);

  if (!result.valid) {
    securityManager.logEvent({
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

  const userPayload = { userId, email: dbUser.email || target, role: dbUser.role || 'customer', sessionId };

  const accessToken = securityManager.generateAccessToken(userPayload);
  const refreshToken = securityManager.generateRefreshToken(userPayload);

  securityManager.createSession({
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
    customerId: dbUser.registrationId || dbUser.customerId || `FIC-CUST-${Math.floor(100000 + Math.random() * 900000)}`
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

// 4. POST: /api/auth/refresh-token (Token Rotation)
router.post('/refresh-token', async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken || req.cookies?.connect_refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ status: 'error', message: 'Refresh token required.' });
  }

  const payload = securityManager.verifyRefreshToken(refreshToken);
  if (!payload || !payload.sessionId) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token.' });
  }

  const session = securityManager.getSession(payload.sessionId);
  if (!session) {
    return res.status(401).json({ status: 'error', message: 'Session has been revoked or logged out.' });
  }

  // Token Rotation: Issue new Access & Refresh tokens
  const newAccessToken = securityManager.generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    sessionId: payload.sessionId
  });

  const newRefreshToken = securityManager.generateRefreshToken({
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
router.get('/active-sessions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized.' });
  const sessions = securityManager.getUserSessions(req.user.userId);
  return res.json({
    status: 'success',
    sessions
  });
});

// 6. POST: /api/auth/logout (Revoke Current Session)
router.post('/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.sessionId) {
    securityManager.revokeSession(req.sessionId);
  }
  res.clearCookie('connect_access_token');
  res.clearCookie('connect_refresh_token');
  return res.json({
    status: 'success',
    message: 'Logged out successfully.'
  });
});

// 7. POST: /api/auth/logout-all-devices (Force Logout All)
router.post('/logout-all-devices', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized.' });
  const revokedCount = securityManager.revokeAllUserSessions(req.user.userId);
  res.clearCookie('connect_access_token');
  res.clearCookie('connect_refresh_token');
  return res.json({
    status: 'success',
    message: `Logged out from all ${revokedCount} devices successfully.`
  });
});

// Customer Registration Persistence
router.post('/register-customer', async (req: Request, res: Response) => {
  const { name, email, phone, password, address, city, pincode, aadhaarNumber, panNumber } = req.body;

  // Server-side Indian Mobile Number Validation (bypass protection)
  const cleanPhone = (phone || '').replace(/\D/g, '');
  if (cleanPhone) {
    const mobileCheck = validateIndianMobile(cleanPhone);
    if (!mobileCheck.valid) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_MOBILE',
        message: mobileCheck.message
      });
    }
  }

  try {
    const mongoDb = db.getDb();
    const cleanEmail = (email || '').toLowerCase().trim();

    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
    const uniqueCustId = `FIC-CUST-${Math.floor(100000 + Math.random() * 900000)}`;
    const userId = 'cust_' + Date.now();

    const initialAddresses = address ? [{
      id: 'addr_1_' + Date.now(),
      name: name || 'Connect Member',
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
        // If user already exists, update user profile and address details rather than throwing 400 error!
        const updateFields: any = {
          updatedAt: new Date().toISOString()
        };
        if (name) updateFields.name = name;
        if (address) updateFields.address = address;
        if (city) updateFields.city = city;
        if (pincode) updateFields.pincode = pincode;
        if (aadhaarNumber) updateFields.aadhaar = aadhaarNumber;
        if (panNumber) updateFields.pan = panNumber;
        if (hashedPassword) updateFields.password = hashedPassword;

        const existingAddrs: any[] = Array.isArray(existing.addresses) ? existing.addresses : [];
        if (address && existingAddrs.length === 0) {
          updateFields.addresses = initialAddresses;
        }

        await mongoDb.collection('users').updateOne({ _id: existing._id }, { $set: updateFields }).catch(() => {});
        await mongoDb.collection('customers').updateOne({ _id: existing._id }, { $set: updateFields }).catch(() => {});

        const updatedUser = await mongoDb.collection('users').findOne({ _id: existing._id });
        const { password: _, ...safeUser } = updatedUser || existing;
        return res.json({ status: 'success', message: 'Customer account updated successfully', user: safeUser, data: safeUser });
      }
    }

    const createdUser = {
      id: userId,
      _id: userId,
      registrationId: uniqueCustId,
      customerId: uniqueCustId,
      name: name || 'Connect Customer',
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      address: address || '',
      city: city || '',
      pincode: pincode || '',
      aadhaar: aadhaarNumber || '',
      pan: panNumber || '',
      role: 'customer',
      status: 'Active',
      isActive: true,
      addresses: initialAddresses,
      createdAt: new Date().toISOString()
    };

    if (mongoDb) {
      await mongoDb.collection('users').insertOne(createdUser as any).catch(() => {});
      await mongoDb.collection('customers').insertOne(createdUser as any).catch(() => {});
    }

    const { password: _, ...safeUser } = createdUser;
    return res.json({ status: 'success', message: 'Customer registration successful', user: safeUser, data: safeUser });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET: /api/auth/customer-profile (Fetch authenticated customer profile & saved addresses from MongoDB)
router.get('/customer-profile', async (req: Request, res: Response) => {
  const { userId, customerId, phone, email } = req.query;
  const target = ((userId || customerId || phone || email || '') as string).trim();

  if (!target) {
    return res.status(400).json({ status: 'error', message: 'User ID, Customer ID, Email or Phone is required.' });
  }

  try {
    const mongoDb = db.getDb();
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
    
    let rawAddresses: any[] = Array.isArray(safeProfile.addresses) ? safeProfile.addresses : [];

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

        await mongoDb.collection('users').updateOne(filter, { $set: { addresses: rawAddresses } }).catch(() => {});
        await mongoDb.collection('customers').updateOne(filter, { $set: { addresses: rawAddresses } }).catch(() => {});
      }
    }

    const profileAddresses = deduplicateAddresses(rawAddresses);
    const resolvedCustId = safeProfile.registrationId || safeProfile.customerId || getOrGenerateCustomerId(safeProfile);

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
        addresses: profileAddresses
      }
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT: /api/auth/customer-profile (Update customer profile & photo in MongoDB)
router.put('/customer-profile', async (req: Request, res: Response) => {
  const { userId, customerId, phone, email, name, avatar, photo, password } = req.body;
  const target = req.body;

  try {
    const mongoDb = db.getDb();
    if (!mongoDb) {
      return res.status(503).json({ status: 'error', message: 'Database not connected' });
    }

    const updateFields: any = { updatedAt: new Date().toISOString() };
    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.toLowerCase().trim();
    if (phone) updateFields.phone = phone.replace(/\D/g, '');
    const newAvatar = avatar !== undefined ? avatar : photo;
    if (newAvatar !== undefined) {
      updateFields.avatar = newAvatar;
      updateFields.photo = newAvatar;
    }
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const filter = buildCustomerMongoFilter(target);

    await mongoDb.collection('users').updateOne(filter, { $set: updateFields });
    await mongoDb.collection('customers').updateOne(filter, { $set: updateFields }).catch(() => {});

    let updatedUser = await mongoDb.collection('users').findOne(filter);
    if (!updatedUser) {
      updatedUser = await mongoDb.collection('customers').findOne(filter);
    }

    if (!updatedUser) {
      // Upsert: Create user record in MongoDB if not existing yet
      const newUserId = userId || customerId || 'cust_' + Date.now();
      const newCustId = customerId || (newUserId.startsWith('FIC-') ? newUserId : `FIC-CUST-${Math.floor(100000 + Math.random() * 900000)}`);
      const createdUserObj: any = {
        id: newUserId,
        _id: newUserId,
        registrationId: newCustId,
        customerId: newCustId,
        name: name ? name.trim() : 'Connect Member',
        email: email ? email.toLowerCase().trim() : '',
        phone: phone ? phone.replace(/\D/g, '') : '',
        avatar: newAvatar || '',
        photo: newAvatar || '',
        password: password ? await bcrypt.hash(password, 10) : '',
        role: 'customer',
        status: 'Active',
        isActive: true,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await mongoDb.collection('users').insertOne(createdUserObj as any).catch(() => {});
      await mongoDb.collection('customers').insertOne(createdUserObj as any).catch(() => {});
      updatedUser = createdUserObj;
    }

    const { password: _, ...safeUser } = (updatedUser || {}) as any;
    const resolvedCustId = safeUser.registrationId || safeUser.customerId || getOrGenerateCustomerId(safeUser);
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
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

const resolveCustomerTarget = (req: Request): string => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user) {
    if (authReq.user.userId) return String(authReq.user.userId).trim();
    if (authReq.user.email) return String(authReq.user.email).trim();
  }
  const target = req.body?.userId || req.body?.customerId || req.body?.phone || req.body?.email || req.query?.userId || req.query?.customerId || req.query?.phone || req.query?.email;
  return target ? String(target).trim() : '';
};

// GET: /customer/addresses & /api/auth/customer-addresses (Fetch saved addresses)
const handleGetAddresses = async (req: Request, res: Response) => {
  const target = resolveCustomerTarget(req);
  if (!target) {
    return res.status(400).json({ status: 'error', message: 'Authenticated customer identifier required.' });
  }

  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ status: 'error', message: 'Database not connected' });

    const filter = buildCustomerMongoFilter(target);
    let user = await mongoDb.collection('users').findOne(filter);
    if (!user) user = await mongoDb.collection('customers').findOne(filter);

    if (!user) return res.status(404).json({ status: 'error', message: 'Customer record not found.' });

    const addresses = deduplicateAddresses(Array.isArray(user.addresses) ? user.addresses : []);
    return res.json({ status: 'success', addresses });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST: /customer/addresses & /api/auth/customer-address (Save/Add/Deduplicate saved address)
const handleSaveAddress = async (req: Request, res: Response) => {
  const target = resolveCustomerTarget(req);
  const address = req.body?.address || req.body;

  if (!target || !address || typeof address !== 'object') {
    return res.status(400).json({ status: 'error', message: 'Authenticated customer ID and address details are required.' });
  }

  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ status: 'error', message: 'Database not connected' });

    const filter = buildCustomerMongoFilter(target);
    let user = await mongoDb.collection('users').findOne(filter);
    if (!user) user = await mongoDb.collection('customers').findOne(filter);

    if (!user) return res.status(404).json({ status: 'error', message: 'Customer record not found.' });

    const existingAddresses: any[] = Array.isArray(user.addresses) ? user.addresses : [];
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

    let savedAddr: any = null;
    let rawUpdated: any[];

    if (address.id && existingAddresses.some(a => a.id === address.id)) {
      savedAddr = { ...address };
      rawUpdated = existingAddresses.map(a => a.id === address.id ? { ...a, ...address } : a);
    } else if (existingDuplicate) {
      savedAddr = { ...existingDuplicate, ...address, id: existingDuplicate.id };
      rawUpdated = existingAddresses.map(a => a.id === existingDuplicate.id ? savedAddr : a);
    } else {
      savedAddr = {
        ...address,
        id: address.id || 'addr_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
      };
      rawUpdated = [savedAddr, ...existingAddresses];
    }

    const updatedAddresses = deduplicateAddresses(rawUpdated);

    await mongoDb.collection('users').updateOne(filter, { $set: { addresses: updatedAddresses } });
    await mongoDb.collection('customers').updateOne(filter, { $set: { addresses: updatedAddresses } }).catch(() => {});

    return res.json({
      status: 'success',
      message: 'Address saved successfully',
      isDuplicate: false,
      address: savedAddr,
      addresses: updatedAddresses
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// PUT: /customer/addresses/:id & /api/auth/customer-address/:id (Update address)
const handleUpdateAddress = async (req: Request, res: Response) => {
  const addressId = req.params.addressId || req.params.id;
  const target = resolveCustomerTarget(req);
  const addressData = req.body?.address || req.body;

  if (!target || !addressId) {
    return res.status(400).json({ status: 'error', message: 'Customer identifier and Address ID are required.' });
  }

  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ status: 'error', message: 'Database not connected' });

    const filter = buildCustomerMongoFilter(target);
    let user = await mongoDb.collection('users').findOne(filter);
    if (!user) user = await mongoDb.collection('customers').findOne(filter);

    if (!user) return res.status(404).json({ status: 'error', message: 'Customer record not found.' });

    const existingAddresses: any[] = Array.isArray(user.addresses) ? user.addresses : [];
    const rawUpdated = existingAddresses.map(a => a.id === addressId ? { ...a, ...addressData } : a);
    const updatedAddresses = deduplicateAddresses(rawUpdated);

    await mongoDb.collection('users').updateOne(filter, { $set: { addresses: updatedAddresses } });
    await mongoDb.collection('customers').updateOne(filter, { $set: { addresses: updatedAddresses } }).catch(() => {});

    return res.json({ status: 'success', message: 'Address updated successfully', addresses: updatedAddresses });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE: /customer/addresses/:id & /api/auth/customer-address/:id (Delete address)
const handleDeleteAddress = async (req: Request, res: Response) => {
  const addressId = req.params.addressId || req.params.id;
  const target = resolveCustomerTarget(req);

  if (!target || !addressId) {
    return res.status(400).json({ status: 'error', message: 'Customer identifier and Address ID are required.' });
  }

  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ status: 'error', message: 'Database not connected' });

    const filter = buildCustomerMongoFilter(target);
    let user = await mongoDb.collection('users').findOne(filter);
    if (!user) user = await mongoDb.collection('customers').findOne(filter);

    if (!user) return res.status(404).json({ status: 'error', message: 'Customer record not found.' });

    const existingAddresses: any[] = Array.isArray(user.addresses) ? user.addresses : [];
    const updatedAddresses = existingAddresses.filter(a => a.id !== addressId);

    await mongoDb.collection('users').updateOne(filter, { $set: { addresses: updatedAddresses } });
    await mongoDb.collection('customers').updateOne(filter, { $set: { addresses: updatedAddresses } }).catch(() => {});

    return res.json({ status: 'success', message: 'Address deleted successfully', addresses: updatedAddresses });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// Register Address Endpoints (Supports both /customer/addresses and /customer-address)
router.get('/addresses', handleGetAddresses);
router.post('/addresses', handleSaveAddress);
router.put('/addresses/:id', handleUpdateAddress);
router.delete('/addresses/:id', handleDeleteAddress);

router.post('/customer-address', handleSaveAddress);
router.put('/customer-address/:addressId', handleUpdateAddress);
router.delete('/customer-address/:addressId', handleDeleteAddress);

export default router;
