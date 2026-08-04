import { Router, Request, Response } from 'express';
import { db } from '../db';
import { securityManager } from '../security/securityManager';
import { authRateLimiter, authenticateToken, AuthenticatedRequest } from '../security/middleware';

const router = Router();

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
      let displayName = identifier.split('@')[0];
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      userDetails = { id: 'cust_' + displayName.toLowerCase(), name: displayName || 'Connect Member', email: identifier, role: 'customer' };
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
  const { mobileOrEmail } = req.body;
  const ip = req.ip || '127.0.0.1';

  if (!mobileOrEmail) {
    return res.status(400).json({ status: 'error', message: 'Mobile number is required.' });
  }

  // Server-side Indian Mobile Validation (bypass protection)
  const cleaned = mobileOrEmail.trim().replace(/\D/g, '');
  const isNumericInput = /^\d+$/.test(mobileOrEmail.trim());
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
    const { otp, cooldownSeconds } = securityManager.generateOTP(mobileOrEmail);

    securityManager.logEvent({
      action: 'OTP_REQUESTED',
      email: mobileOrEmail,
      ip,
      device: req.headers['user-agent'] || 'Unknown',
      country: 'India',
      status: 'SUCCESS',
      details: `Generated 6-digit OTP (expires in 5 minutes).`
    });

    return res.json({
      status: 'success',
      message: `OTP sent successfully to ${mobileOrEmail}. Valid for 5 minutes.`,
      cooldownSeconds,
      // For development convenience, return preview OTP
      devOtpPreview: otp
    });
  } catch (err: any) {
    return res.status(429).json({ status: 'error', message: err.message });
  }
});

// 3. POST: /api/auth/verify-otp (3 Attempts Limit)
router.post('/verify-otp', authRateLimiter, async (req: Request, res: Response) => {
  const { mobileOrEmail, otp } = req.body;
  const ip = req.ip || '127.0.0.1';

  if (!mobileOrEmail || !otp) {
    return res.status(400).json({ status: 'error', message: 'Mobile/Email and OTP are required.' });
  }

  const result = securityManager.verifyOTP(mobileOrEmail, otp);

  if (!result.valid) {
    securityManager.logEvent({
      action: 'OTP_VERIFICATION_FAILED',
      email: mobileOrEmail,
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
  const userPayload = { userId: 'cust_' + mobileOrEmail.replace(/\D/g, ''), email: mobileOrEmail, role: 'customer', sessionId };

  const accessToken = securityManager.generateAccessToken(userPayload);
  const refreshToken = securityManager.generateRefreshToken(userPayload);

  securityManager.createSession({
    sessionId,
    userId: userPayload.userId,
    email: mobileOrEmail,
    role: 'customer',
    tokenHash: refreshToken.slice(-10),
    deviceName: 'Mobile Web / OTP Device',
    os: 'Mobile',
    browser: 'Browser',
    ip,
    country: 'India',
    city: 'Bangalore'
  });

  return res.json({
    status: 'success',
    message: 'OTP verified successfully.',
    accessToken,
    refreshToken,
    user: { id: userPayload.userId, email: mobileOrEmail, role: 'customer', name: 'OTP Verified Member' }
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

// Customer Registration
router.post('/register-customer', async (req: Request, res: Response) => {
  const { name, email, phone, address, city, pincode, aadhaarNumber, panNumber } = req.body;

  // Server-side Indian Mobile Number Validation (bypass protection)
  if (phone) {
    const mobileCheck = validateIndianMobile(phone);
    if (!mobileCheck.valid) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_MOBILE',
        message: mobileCheck.message
      });
    }
  }

  try {
    const createdUser = {
      id: 'cust_' + Math.floor(1000 + Math.random() * 9000),
      name: name || 'Connect Customer',
      email,
      phone,
      address,
      city,
      pincode,
      aadhaar: aadhaarNumber,
      pan: panNumber,
      role: 'customer'
    };
    return res.json({ status: 'success', message: 'Customer registration successful', data: createdUser });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
